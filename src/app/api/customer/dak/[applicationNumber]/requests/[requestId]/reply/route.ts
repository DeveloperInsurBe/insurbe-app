import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { DakTransitionError } from "@/lib/dak/cases";
import { dakCustomerPortalEnabled, findCustomerDakCase } from "@/lib/dak/customer";
import { DakUploadError, registerDakUpload } from "@/lib/dak/documents";
import { recordCustomerResponse } from "@/lib/dak/responses";
import { DAK_MAX_UPLOAD_BYTES, DAK_UPLOAD_TYPES } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

const MAX_FILES = 5;
const MAX_MESSAGE = 4000;

/**
 * Customer reply, step 2: answers one open information request with a message
 * and the files uploaded in step 1.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ applicationNumber: string; requestId: string }> },
) {
  if (!dakCustomerPortalEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { applicationNumber, requestId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || "").trim().slice(0, MAX_MESSAGE);
    const files: { storagePath: string; name: string }[] = Array.isArray(body?.files)
      ? body.files
          .slice(0, MAX_FILES)
          .map((file: { storagePath?: unknown; name?: unknown }) => ({
            storagePath: String(file?.storagePath || ""),
            name: String(file?.name || ""),
          }))
          .filter((file: { storagePath: string }) => file.storagePath)
      : [];

    if (!message && !files.length) {
      return NextResponse.json({ error: "Please write a message or attach a file." }, { status: 400 });
    }

    const item = await findCustomerDakCase(session.user.email, decodeURIComponent(applicationNumber));
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.status !== "Information Required") {
      return NextResponse.json({ error: "DAK is not waiting for information on this application." }, { status: 409 });
    }

    const request = await prisma.dakInfoRequest.findFirst({
      where: { id: requestId, caseId: item.id },
      select: { status: true },
    });
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.status !== "open") {
      return NextResponse.json({ error: "You already answered this request." }, { status: 409 });
    }

    // Record the files first, so a wrong file stops the reply.
    const documents = [];
    for (const file of files) {
      documents.push(
        await registerDakUpload({
          caseId: item.id,
          storagePath: file.storagePath,
          name: file.name,
          allowedTypes: [...DAK_UPLOAD_TYPES],
          maxBytes: DAK_MAX_UPLOAD_BYTES,
          uploadedBy: item.customerName,
          source: "customer",
        }),
      );
    }

    const attached = documents.length ? `\n\nAttached: ${documents.map((document) => document.name).join(", ")}` : "";
    await recordCustomerResponse({
      caseId: item.id,
      caseNumber: item.caseNumber,
      requestId,
      response: `${message || "(No message, files attached)"}${attached}`,
      customerName: item.customerName,
      note: "Replied from dashboard",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DakUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof DakTransitionError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("CUSTOMER DAK REPLY ERROR:", error);
    return NextResponse.json({ error: "Your reply could not be sent. Please try again." }, { status: 500 });
  }
}
