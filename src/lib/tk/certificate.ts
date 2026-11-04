import { randomUUID } from "crypto";

import { prisma } from "../prisma";
import { getMawsitaBucketName, getSupabaseStorageAdmin } from "../supabaseStorageAdmin";

/**
 * TK PROVISIONAL INSURANCE CERTIFICATE
 *
 * With metaDaten.vorlBescheinigung = true, TK returns the certificate as a
 * Base64 PDF in the /einreichen response (vorlBescheinigungData). It is only
 * delivered in that response, so we keep our own copy in storage. The final
 * membership confirmation still comes from TK by post.
 */
export const tkProvisionalCertificateEnabled = () => process.env.TK_PROVISIONAL_CERTIFICATE === "true";

export type TkCertificateRef = {
  bucket: string;
  storagePath: string;
  name: string;
  size: number;
  savedAt: string;
};

const STORE_TIMEOUT_MS = 8000;

/** The PDF from TK's response, or null when it is missing or not a PDF. */
export function decodeTkCertificate(base64: string | null | undefined) {
  if (!base64) return null;
  const content = Buffer.from(base64, "base64");
  return content.subarray(0, 5).toString("latin1") === "%PDF-" ? content : null;
}

export const tkCertificateFileName = (applicationNumber: string) =>
  `TK-provisional-certificate-${applicationNumber}.pdf`;

/** Saves our copy. Time-limited, as it runs after TK has already accepted the application. */
export async function storeTkCertificate(applicationNumber: string, content: Buffer): Promise<TkCertificateRef> {
  const bucket = getMawsitaBucketName();
  const storagePath = `tk/certificates/${randomUUID()}-${applicationNumber.replace(/[^\w-]/g, "")}.pdf`;

  const upload = getSupabaseStorageAdmin()
    .storage.from(bucket)
    .upload(storagePath, content, { contentType: "application/pdf", upsert: false });
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("TK certificate upload timed out")), STORE_TIMEOUT_MS);
  });

  const { error } = await Promise.race([upload, timeout]);
  if (error) throw new Error(`TK certificate upload failed: ${error.message}`);

  return {
    bucket,
    storagePath,
    name: tkCertificateFileName(applicationNumber),
    size: content.length,
    savedAt: new Date().toISOString(),
  };
}

/** The stored certificate of an application payload, if any. */
export function tkCertificateRef(payload: unknown): TkCertificateRef | null {
  const ref = (payload as { tkApi?: { certificate?: Partial<TkCertificateRef> | null } } | null)?.tkApi?.certificate;
  return ref?.bucket && ref.storagePath && ref.name ? (ref as TkCertificateRef) : null;
}

/** Short-lived download link, only for the customer's own application. */
export async function customerTkCertificateUrl(email: string, applicationId: string) {
  const application = await prisma.insuranceApplication.findUnique({
    where: { id: applicationId },
    select: { provider: true, payload: true },
  });
  if (application?.provider !== "TK") return null;

  const owner = (application.payload as { personal?: { email?: unknown } } | null)?.personal?.email;
  if (typeof owner !== "string" || owner.trim().toLowerCase() !== email.trim().toLowerCase()) return null;

  const ref = tkCertificateRef(application.payload);
  if (!ref) return null;

  const { data, error } = await getSupabaseStorageAdmin()
    .storage.from(ref.bucket)
    .createSignedUrl(ref.storagePath, 60, { download: ref.name });
  if (error || !data?.signedUrl) throw new Error(`TK certificate link failed: ${error?.message ?? "no url"}`);
  return data.signedUrl;
}
