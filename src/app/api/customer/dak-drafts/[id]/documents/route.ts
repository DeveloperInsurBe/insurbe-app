import { NextResponse } from "next/server";

import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { isDocumentKind } from "@/lib/dak/bulk/draftForm";
import { getCustomerDraft } from "@/lib/dak/bulk/draftAccess";
import { DraftUploadError, registerDraftUpload, removeDraftDocument } from "@/lib/dak/bulk/draftServer";

export const maxDuration = 30;

/** Records a document the browser uploaded (the server checks the real file). */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const { id } = await context.params;
  const draft = await getCustomerDraft(id);
  if (!draft) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (!isDocumentKind(body?.kind) || typeof body?.storagePath !== "string") {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  try {
    return NextResponse.json(await registerDraftUpload(draft, body.kind, body.storagePath, String(body?.name ?? "")));
  } catch (error) {
    if (error instanceof DraftUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("DAK DRAFT DOCUMENT ERROR:", error);
    return NextResponse.json({ error: "We could not save this document. Please try again." }, { status: 500 });
  }
}

/** Removes one document (?kind=passport). */
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const { id } = await context.params;
  const draft = await getCustomerDraft(id);
  if (!draft) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  const kind = new URL(req.url).searchParams.get("kind");
  if (!isDocumentKind(kind)) return NextResponse.json({ error: "Unknown document" }, { status: 400 });
  return NextResponse.json(await removeDraftDocument(draft, kind));
}
