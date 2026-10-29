import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { findDakCaseForAction, serializeDocument } from "@/lib/dak/detail";
import { DakUploadError, registerDakUpload } from "@/lib/dak/documents";
import { DAK_MAX_UPLOAD_BYTES, DAK_UPLOAD_TYPES, isDakFinal } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

/** Step 2 of a reviewer upload: records the file the browser uploaded on the case. */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const storagePath = String(body?.storagePath || "");
    const name = String(body?.name || "");

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (isDakFinal(item.status)) {
      return NextResponse.json({ error: `The application is ${item.status} and can no longer be changed.` }, { status: 409 });
    }

    const document = await registerDakUpload({
      caseId: item.id,
      storagePath,
      name,
      allowedTypes: [...DAK_UPLOAD_TYPES],
      maxBytes: DAK_MAX_UPLOAD_BYTES,
      uploadedBy: reviewer.name,
    });
    await prisma.dakEvent.create({
      data: {
        caseId: item.id,
        event: `DAK document uploaded — ${document.name}`,
        actorType: "reviewer",
        actorName: reviewer.name,
        actorId: reviewer.id,
      },
    });

    return NextResponse.json({ document: serializeDocument(document) });
  } catch (error) {
    if (error instanceof DakUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("DAK PORTAL DOCUMENT UPLOAD ERROR:", error);
    return NextResponse.json({ error: "The document could not be uploaded" }, { status: 500 });
  }
}
