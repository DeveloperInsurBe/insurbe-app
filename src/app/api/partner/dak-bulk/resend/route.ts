import { NextResponse } from "next/server";

import { requireBulkPartner } from "@/lib/dak/bulk/access";
import { resendInvitation } from "@/lib/dak/bulk/invitations";

export const maxDuration = 30;

/** Sends the invitation again (email failed or link expired). Only the partner's own drafts. */
export async function POST(req: Request) {
  const { partner, response } = await requireBulkPartner();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const draftId = typeof body?.draftId === "string" ? body.draftId : "";
  const result = draftId ? await resendInvitation(draftId, partner.partnerRef) : null;
  if (!result) {
    return NextResponse.json({ error: "This invitation can't be sent again." }, { status: 400 });
  }
  if (result.failed) {
    return NextResponse.json({ error: "The email could not be sent. Please check the address." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
