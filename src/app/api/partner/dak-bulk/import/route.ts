import { after, NextResponse } from "next/server";

import { readUploadedFile, requireBulkPartner } from "@/lib/dak/bulk/access";
import { BULK_CONSENT_VERSION } from "@/lib/dak/bulk/config";
import { importDakDrafts } from "@/lib/dak/bulk/importDrafts";
import { sendPendingInvitations } from "@/lib/dak/bulk/invitations";
import { BulkFileError, parseBulkFile } from "@/lib/dak/bulk/parse";

export const maxDuration = 60;

/**
 * Imports a checked file: the partner must confirm consent. The file is read
 * and validated again here (the preview in the browser is never trusted).
 */
export async function POST(req: Request) {
  const { partner, response } = await requireBulkPartner();
  if (response) return response;

  const { form, file } = await readUploadedFile(req);
  if (!file) return NextResponse.json({ error: "Please choose a file." }, { status: 400 });
  if (form?.get("consent") !== "true" || form?.get("consentVersion") !== BULK_CONSENT_VERSION) {
    return NextResponse.json({ error: "Please confirm that you have the customers' consent." }, { status: 400 });
  }

  try {
    const rows = await parseBulkFile(file.name, file.buffer);
    const outcome = await importDakDrafts(partner, file.name, rows);
    // Invitations go out after the response, so the partner sees the result at once.
    // Anything not sent here is picked up by the scheduled job.
    if (outcome.imported) {
      after(async () => {
        try {
          await sendPendingInvitations({ batchId: outcome.batchId });
        } catch (sendError) {
          console.error("DAK BULK INVITATIONS AFTER IMPORT FAILED:", sendError);
        }
      });
    }
    return NextResponse.json(outcome);
  } catch (error) {
    if (error instanceof BulkFileError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("DAK BULK IMPORT ERROR:", error);
    return NextResponse.json({ error: "We could not import this file. Nothing was saved. Please try again." }, { status: 500 });
  }
}
