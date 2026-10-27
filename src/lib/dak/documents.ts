import { randomUUID } from "crypto";

import { prisma } from "../prisma";
import { getMawsitaBucketName, getSupabaseStorageAdmin } from "../supabaseStorageAdmin";

export type DakDocumentSource = "customer" | "insurbe" | "dak";

const safeFileName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(-120) || "document";

/** Stores a file in Supabase Storage and records it on the DAK case. */
export async function saveDakDocument({
  caseId,
  name,
  mimeType,
  content,
  source,
  uploadedBy,
}: {
  caseId: string;
  name: string;
  mimeType: string;
  content: Buffer;
  source: DakDocumentSource;
  uploadedBy?: string;
}) {
  const bucket = getMawsitaBucketName();
  const storagePath = `dak/${caseId}/${randomUUID()}-${safeFileName(name)}`;

  const { error } = await getSupabaseStorageAdmin()
    .storage.from(bucket)
    .upload(storagePath, content, { contentType: mimeType || "application/octet-stream", upsert: false });
  if (error) throw new Error(`DAK document upload failed: ${error.message}`);

  return prisma.dakDocument.create({
    data: {
      caseId,
      name,
      mimeType: mimeType || "application/octet-stream",
      size: content.length,
      source,
      bucket,
      storagePath,
      // InsurBe's own application PDF needs no manual review.
      reviewStatus: source === "insurbe" ? "auto" : "pending",
      uploadedBy,
    },
  });
}

export async function dakDocumentSignedUrl(
  document: { bucket: string; storagePath: string; name: string },
  download: boolean,
) {
  const { data, error } = await getSupabaseStorageAdmin()
    .storage.from(document.bucket)
    .createSignedUrl(document.storagePath, 60, download ? { download: document.name } : undefined);
  if (error || !data?.signedUrl) throw new Error(`DAK document link failed: ${error?.message ?? "no url"}`);
  return data.signedUrl;
}

export async function readDakDocument(document: { bucket: string; storagePath: string }) {
  const { data, error } = await getSupabaseStorageAdmin().storage.from(document.bucket).download(document.storagePath);
  if (error || !data) throw new Error(`DAK document download failed: ${error?.message ?? "empty"}`);
  return Buffer.from(await data.arrayBuffer());
}
