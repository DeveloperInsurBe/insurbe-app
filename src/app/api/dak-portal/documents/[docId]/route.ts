import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { caseStatus } from "@/lib/dak/cases";
import { serializeDocument } from "@/lib/dak/detail";
import { dakDocumentSignedUrl } from "@/lib/dak/documents";
import { isDakFinal } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

/** Opens (or with ?download=1 downloads) a document through a short-lived signed link. */
export async function GET(req: Request, context: { params: Promise<{ docId: string }> }) {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { docId } = await context.params;
    const document = await prisma.dakDocument.findUnique({ where: { id: docId } });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const download = new URL(req.url).searchParams.get("download") === "1";
    return NextResponse.redirect(await dakDocumentSignedUrl(document, download));
  } catch (error) {
    console.error("DAK PORTAL DOCUMENT LINK ERROR:", error);
    return NextResponse.json({ error: "Could not open the document" }, { status: 500 });
  }
}

/** Marks a document as reviewed. */
export async function PATCH(_req: Request, context: { params: Promise<{ docId: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { docId } = await context.params;
    const document = await prisma.dakDocument.findUnique({
      where: { id: docId },
      include: { case: { select: { status: true } } },
    });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    const status = caseStatus(document.case.status);
    if (isDakFinal(status)) {
      return NextResponse.json({ error: `The application is ${status} and can no longer be changed.` }, { status: 409 });
    }
    if (document.reviewStatus !== "pending") {
      return NextResponse.json({ document: serializeDocument(document) });
    }

    const updated = await prisma.dakDocument.update({
      where: { id: docId },
      data: { reviewStatus: "reviewed", reviewedBy: reviewer.name, reviewedAt: new Date() },
    });
    await prisma.dakEvent.create({
      data: {
        caseId: document.caseId,
        event: `Document marked as reviewed — ${document.name}`,
        actorType: "reviewer",
        actorName: reviewer.name,
        actorId: reviewer.id,
      },
    });
    return NextResponse.json({ document: serializeDocument(updated) });
  } catch (error) {
    console.error("DAK PORTAL DOCUMENT REVIEW ERROR:", error);
    return NextResponse.json({ error: "Could not update the document" }, { status: 500 });
  }
}
