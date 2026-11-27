import { NextResponse } from "next/server";

import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { getCustomerDraft } from "@/lib/dak/bulk/draftAccess";
import { DraftSubmitError, submitDraft } from "@/lib/dak/bulk/submitDraft";

export const maxDuration = 60;

/** The customer submits their completed draft (with their declarations) to DAK. */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const { id } = await context.params;
  const draft = await getCustomerDraft(id);
  if (!draft) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  try {
    const result = await submitDraft(draft, body?.declarations ?? {}, {
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof DraftSubmitError) {
      return NextResponse.json({ error: error.message, fieldErrors: error.fieldErrors ?? null }, { status: 400 });
    }
    console.error("DAK DRAFT SUBMIT ROUTE ERROR:", error);
    return NextResponse.json({ error: "We couldn't submit your application right now. Please try again shortly." }, { status: 500 });
  }
}
