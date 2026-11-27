import { NextResponse } from "next/server";

import { getCurrentPartnerAccess } from "../../applicationAccess";
import { dakBulkUploadEnabled } from "./config";

/**
 * For the bulk upload APIs: the signed-in partner (role "partner", with a
 * partner code), or a response to return. Closed while the feature flag is off.
 */
export async function requireBulkPartner(): Promise<
  { partner: { userId: string; partnerRef: string }; response?: never } | { partner?: never; response: NextResponse }
> {
  if (!dakBulkUploadEnabled()) {
    return { response: NextResponse.json({ error: "Not available" }, { status: 404 }) };
  }
  const { partner } = await getCurrentPartnerAccess();
  if (!partner?.id || !partner.partnerId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { partner: { userId: partner.id, partnerRef: partner.partnerId } };
}

/** Reads the uploaded file from a multipart request. */
export async function readUploadedFile(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return { form, file: null };
  return { form, file: { name: file.name || "upload", buffer: Buffer.from(await file.arrayBuffer()) } };
}
