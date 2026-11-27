import { NextResponse } from "next/server";

import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { DOCUMENT_MAX_BYTES, DOCUMENT_TYPES, isDocumentKind } from "@/lib/dak/bulk/draftForm";
import { getCustomerDraft } from "@/lib/dak/bulk/draftAccess";
import { createDraftUploadUrl } from "@/lib/dak/bulk/draftServer";

/** One-time upload link for a document of the customer's own draft. */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const { id } = await context.params;
  const draft = await getCustomerDraft(id);
  if (!draft) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const size = Number(body?.size);
  if (!isDocumentKind(body?.kind)) return NextResponse.json({ error: "Unknown document" }, { status: 400 });
  if (!(DOCUMENT_TYPES as readonly string[]).includes(String(body?.type)) || !(size > 0) || size > DOCUMENT_MAX_BYTES) {
    return NextResponse.json({ error: "Please upload a PDF, JPG or PNG file of at most 10 MB." }, { status: 400 });
  }
  try {
    return NextResponse.json(await createDraftUploadUrl(draft.id, body.kind, String(body?.name ?? "")));
  } catch (error) {
    console.error("DAK DRAFT UPLOAD URL ERROR:", error);
    return NextResponse.json({ error: "Upload is not possible right now. Please try again." }, { status: 500 });
  }
}
