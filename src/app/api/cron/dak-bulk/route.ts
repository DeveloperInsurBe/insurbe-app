import { NextResponse } from "next/server";

import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import {
  expireOldInvitations,
  purgeExpiredDrafts,
  releaseStuckInvitations,
  sendPendingInvitations,
} from "@/lib/dak/bulk/invitations";

export const maxDuration = 60;

/**
 * Scheduled job for the DAK bulk upload: sends invitations that were not sent
 * right after the import, frees drafts stuck in "sending", expires old
 * invitation links and deletes personal data past the retention period.
 * Called by Vercel Cron with the CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!dakBulkUploadEnabled()) return NextResponse.json({ skipped: "DAK_BULK_UPLOAD is off" });

  const released = await releaseStuckInvitations();
  const invitations = await sendPendingInvitations({ limit: 100 });
  const expired = await expireOldInvitations();
  const purged = await purgeExpiredDrafts();
  return NextResponse.json({ released, ...invitations, expired, purged });
}
