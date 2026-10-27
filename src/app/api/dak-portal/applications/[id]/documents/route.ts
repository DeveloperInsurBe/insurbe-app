import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { findDakCaseForAction, serializeDocument } from "@/lib/dak/detail";
import { saveDakDocument } from "@/lib/dak/documents";
import { DAK_MAX_UPLOAD_BYTES, isDakFinal } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

/** DAK reviewer uploads a document to the application. */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please choose a file." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type) || file.size > DAK_MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Upload a PDF, JPG or PNG of at most 10 MB." }, { status: 400 });
    }

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (isDakFinal(item.status)) {
      return NextResponse.json({ error: `The application is ${item.status} and can no longer be changed.` }, { status: 409 });
    }

    const saved = await saveDakDocument({
      caseId: item.id,
      name: file.name || "DAK document",
      mimeType: file.type,
      content: Buffer.from(await file.arrayBuffer()),
      source: "dak",
      uploadedBy: reviewer.name,
    });
    // The reviewer's own upload needs no second review.
    const document = await prisma.dakDocument.update({
      where: { id: saved.id },
      data: { reviewStatus: "reviewed", reviewedBy: reviewer.name, reviewedAt: new Date() },
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
    console.error("DAK PORTAL DOCUMENT UPLOAD ERROR:", error);
    return NextResponse.json({ error: "The document could not be uploaded" }, { status: 500 });
  }
}
