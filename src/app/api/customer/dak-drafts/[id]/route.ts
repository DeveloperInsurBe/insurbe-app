import { NextResponse } from "next/server";

import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { cleanDraftForm, validateDraftForm } from "@/lib/dak/bulk/draftForm";
import { getCustomerDraft } from "@/lib/dak/bulk/draftAccess";
import { draftDocumentsOf, draftStatusFor } from "@/lib/dak/bulk/draftServer";
import { prisma } from "@/lib/prisma";

/** Autosave: the customer's answers on their own DAK draft. */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const { id } = await context.params;
  const draft = await getCustomerDraft(id);
  if (!draft) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const form = cleanDraftForm(body?.form, draft.email);
  const status = draftStatusFor(form, draftDocumentsOf(draft));
  await prisma.dakDraft.update({ where: { id: draft.id }, data: { form, status } });
  return NextResponse.json({ ok: true, status, errors: validateDraftForm(form) });
}
