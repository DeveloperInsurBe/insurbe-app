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

/* -------------------------------------------------------------------------- */
/*                         DIRECT UPLOADS (BROWSER -> STORAGE)                */
/* -------------------------------------------------------------------------- */
// Reviewer files go straight from the browser to Supabase Storage through a
// one-time signed URL, so they are not limited by the serverless request size.

const UPLOAD_PREFIX = "upload-";

/** One-time URL the browser PUTs the file to. The path stays on this case. */
export async function createDakUploadUrl(caseId: string, name: string) {
  const bucket = getMawsitaBucketName();
  const storagePath = `dak/${caseId}/${UPLOAD_PREFIX}${randomUUID()}-${safeFileName(name)}`;
  const { data, error } = await getSupabaseStorageAdmin().storage.from(bucket).createSignedUploadUrl(storagePath);
  if (error || !data?.signedUrl) throw new Error(`DAK upload link failed: ${error?.message ?? "no url"}`);
  return { storagePath, uploadUrl: data.signedUrl };
}

/** Uploaded file's real size and type, or null when nothing was uploaded there. */
async function statDakUpload(storagePath: string) {
  const slash = storagePath.lastIndexOf("/");
  const { data, error } = await getSupabaseStorageAdmin()
    .storage.from(getMawsitaBucketName())
    .list(storagePath.slice(0, slash), { search: storagePath.slice(slash + 1), limit: 1 });
  const file = data?.find((item) => item.name === storagePath.slice(slash + 1));
  if (error || !file) return null;
  const metadata = (file.metadata ?? {}) as { size?: number; mimetype?: string };
  return { size: Number(metadata.size) || 0, mimeType: String(metadata.mimetype || "") };
}

export class DakUploadError extends Error {}

/**
 * Records a file the browser uploaded with createDakUploadUrl. Checks the path
 * belongs to this case, the upload exists, and its real type and size.
 */
export async function registerDakUpload({
  caseId,
  storagePath,
  name,
  allowedTypes,
  maxBytes,
  uploadedBy,
}: {
  caseId: string;
  storagePath: string;
  name: string;
  allowedTypes: string[];
  maxBytes: number;
  uploadedBy: string;
}) {
  if (!storagePath.startsWith(`dak/${caseId}/${UPLOAD_PREFIX}`) || storagePath.includes("..")) {
    throw new DakUploadError("Invalid upload.");
  }
  if (await prisma.dakDocument.findFirst({ where: { storagePath }, select: { id: true } })) {
    throw new DakUploadError("This file was already added.");
  }

  const stat = await statDakUpload(storagePath);
  if (!stat) throw new DakUploadError("The upload did not finish. Please try again.");

  const bucket = getMawsitaBucketName();
  if (!allowedTypes.includes(stat.mimeType) || stat.size > maxBytes) {
    await getSupabaseStorageAdmin().storage.from(bucket).remove([storagePath]);
    throw new DakUploadError(`This file type or size is not allowed (max ${Math.round(maxBytes / (1024 * 1024))} MB).`);
  }

  // The reviewer's own upload needs no second review.
  return prisma.dakDocument.create({
    data: {
      caseId,
      name: name.trim().slice(0, 200) || "DAK document",
      mimeType: stat.mimeType,
      size: stat.size,
      source: "dak",
      bucket,
      storagePath,
      reviewStatus: "reviewed",
      reviewedBy: uploadedBy,
      reviewedAt: new Date(),
      uploadedBy,
    },
  });
}
