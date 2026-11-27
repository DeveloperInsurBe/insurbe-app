import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

import { prisma } from "../../prisma";
import { getMawsitaBucketName, getSupabaseStorageAdmin } from "../../supabaseStorageAdmin";
import {
  DOCUMENT_KINDS,
  DOCUMENT_MAX_BYTES,
  type DocumentKind,
  type DraftDocument,
  type DraftForm,
  cleanDraftForm,
  formFromPrefill,
  validateDraftForm,
} from "./draftForm";

/** Draft states in which the customer can still edit and submit. */
export const OPEN_DRAFT_STATUSES = ["started", "documents_pending", "ready"];

export const draftSelect = {
  id: true,
  reference: true,
  email: true,
  firstName: true,
  lastName: true,
  prefill: true,
  form: true,
  documents: true,
  status: true,
  partnerUserId: true,
  partnerRef: true,
  customerUserId: true,
  submitError: true,
} satisfies Prisma.DakDraftSelect;

export type CustomerDraft = Prisma.DakDraftGetPayload<{ select: typeof draftSelect }>;

/** Saved answers, or the partner's prefill the first time. */
export function draftFormOf(draft: Pick<CustomerDraft, "form" | "prefill" | "email" | "firstName" | "lastName">): DraftForm {
  if (draft.form) return cleanDraftForm(draft.form, draft.email);
  return formFromPrefill((draft.prefill ?? {}) as Record<string, unknown>, draft.email, draft);
}

export const draftDocumentsOf = (draft: Pick<CustomerDraft, "documents">) =>
  (draft.documents ?? {}) as Partial<Record<DocumentKind, DraftDocument>>;

/** started -> documents_pending (answers complete) -> ready (answers + all documents). */
export function draftStatusFor(form: DraftForm, documents: Partial<Record<DocumentKind, DraftDocument>>) {
  if (Object.keys(validateDraftForm(form)).length) return "started";
  return DOCUMENT_KINDS.every((kind) => documents[kind.key]) ? "ready" : "documents_pending";
}

// ---------------------------------------------------------------------------
// Documents: the browser uploads straight to storage through a one-time
// signed URL (no 4.5 MB request limit); the server then checks the real file.

const draftPrefix = (draftId: string) => `dak-drafts/${draftId}/`;
const safeName = (name: string) => name.replace(/[^\w.-]+/g, "_").slice(-80) || "file";

export async function createDraftUploadUrl(draftId: string, kind: DocumentKind, name: string) {
  const storagePath = `${draftPrefix(draftId)}${kind}-${randomUUID()}-${safeName(name)}`;
  const { data, error } = await getSupabaseStorageAdmin()
    .storage.from(getMawsitaBucketName())
    .createSignedUploadUrl(storagePath);
  if (error || !data?.signedUrl) throw new Error(`Draft upload link failed: ${error?.message ?? "no url"}`);
  return { storagePath, uploadUrl: data.signedUrl };
}

export class DraftUploadError extends Error {}

/** The file's real type from its first bytes (not what the browser claims). */
function sniffType(bytes: Uint8Array): (typeof import("./draftForm").DOCUMENT_TYPES)[number] | null {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "application/pdf";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  return null;
}

export async function readDraftFile(storagePath: string) {
  const { data, error } = await getSupabaseStorageAdmin().storage.from(getMawsitaBucketName()).download(storagePath);
  if (error || !data) throw new Error(`Draft file read failed: ${error?.message ?? "no data"}`);
  return Buffer.from(await data.arrayBuffer());
}

async function removeDraftFiles(paths: string[]) {
  if (!paths.length) return;
  await getSupabaseStorageAdmin().storage.from(getMawsitaBucketName()).remove(paths).catch(() => null);
}

/** Checks an uploaded file (this draft's folder, real type, size) and records it. */
export async function registerDraftUpload(draft: CustomerDraft, kind: DocumentKind, storagePath: string, name: string) {
  if (!storagePath.startsWith(`${draftPrefix(draft.id)}${kind}-`) || storagePath.includes("..")) {
    throw new DraftUploadError("Invalid upload.");
  }
  let content: Buffer;
  try {
    content = await readDraftFile(storagePath);
  } catch {
    throw new DraftUploadError("The upload did not finish. Please try again.");
  }
  const mimeType = sniffType(content);
  if (!mimeType || content.length > DOCUMENT_MAX_BYTES || content.length === 0) {
    await removeDraftFiles([storagePath]);
    throw new DraftUploadError("Please upload a PDF, JPG or PNG file of at most 10 MB.");
  }

  const documents = draftDocumentsOf(draft);
  const replaced = documents[kind]?.storagePath;
  documents[kind] = {
    storagePath,
    name: name.trim().slice(0, 120) || kind,
    size: content.length,
    mimeType,
    uploadedAt: new Date().toISOString(),
  };
  const status = draftStatusFor(draftFormOf(draft), documents);
  await prisma.dakDraft.update({ where: { id: draft.id }, data: { documents, status } });
  if (replaced && replaced !== storagePath) await removeDraftFiles([replaced]);
  return { document: documents[kind], status };
}

export async function removeDraftDocument(draft: CustomerDraft, kind: DocumentKind) {
  const documents = draftDocumentsOf(draft);
  const path = documents[kind]?.storagePath;
  delete documents[kind];
  const status = draftStatusFor(draftFormOf(draft), documents);
  await prisma.dakDraft.update({ where: { id: draft.id }, data: { documents, status } });
  if (path) await removeDraftFiles([path]);
  return { status };
}
