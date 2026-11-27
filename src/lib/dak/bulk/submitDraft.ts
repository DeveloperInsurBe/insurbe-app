import { prisma } from "../../prisma";
import { runDakSubmission } from "../submitFlow";
import {
  DECLARATIONS,
  DECLARATIONS_VERSION,
  DOCUMENT_KINDS,
  type DeclarationKey,
  toSubmissionPayload,
  validateDraftForm,
} from "./draftForm";
import { type CustomerDraft, draftDocumentsOf, draftFormOf, readDraftFile } from "./draftServer";

export class DraftSubmitError extends Error {
  constructor(message: string, public fieldErrors?: Record<string, string>) {
    super(message);
  }
}

/**
 * Submits a completed draft through the normal DAK submission (same
 * application, case, PDF, emails, commission). Attribution comes from the
 * draft's partner, never from the browser.
 */
export async function submitDraft(draft: CustomerDraft, accepted: Partial<Record<DeclarationKey, boolean>>, meta: { ip?: string | null }) {
  const form = draftFormOf(draft);
  const fieldErrors = validateDraftForm(form);
  if (Object.keys(fieldErrors).length) throw new DraftSubmitError("Please complete all required fields.", fieldErrors);

  const documents = draftDocumentsOf(draft);
  const missing = DOCUMENT_KINDS.filter((kind) => !documents[kind.key]);
  if (missing.length) throw new DraftSubmitError(`Please upload: ${missing.map((kind) => kind.label).join(", ")}.`);

  const notAccepted = DECLARATIONS.filter((declaration) => accepted[declaration.key] !== true);
  if (notAccepted.length) throw new DraftSubmitError("Please confirm all declarations.");

  // Claim the draft so a double click can't submit it twice.
  const claimed = await prisma.dakDraft.updateMany({
    where: { id: draft.id, status: "ready" },
    data: { status: "submitting", submitError: null },
  });
  if (claimed.count !== 1) throw new DraftSubmitError("This application is not ready to submit yet.");

  try {
    const payload = toSubmissionPayload(form);
    const body = new FormData();
    body.append("personal", JSON.stringify(payload.personal));
    body.append("selectPlan", JSON.stringify(payload.selectPlan));
    body.append("partnerRef", draft.partnerRef);
    for (const kind of DOCUMENT_KINDS) {
      const document = documents[kind.key]!;
      const content = await readDraftFile(document.storagePath);
      body.append(kind.key, new File([new Uint8Array(content)], document.name, { type: document.mimeType }));
    }

    const { status, json } = await runDakSubmission(body);
    if (status !== 200 || !json.success) {
      const message =
        json.code === "DAK_REAPPLY_BLOCKED" && typeof json.error === "string"
          ? json.error
          : "We couldn't submit your application right now. Please try again shortly.";
      await prisma.dakDraft.update({ where: { id: draft.id }, data: { status: "ready", submitError: message } });
      throw new DraftSubmitError(message);
    }

    const declaredAt = new Date().toISOString();
    // The DAK submit returns the application number (or the id when there is none).
    const reference = String(json.applicationId ?? "");
    const application = reference
      ? await prisma.insuranceApplication.findFirst({
          where: { OR: [{ applicationNumber: reference }, { id: reference }] },
          select: { id: true, applicationNumber: true },
        })
      : null;
    await prisma.dakDraft.update({
      where: { id: draft.id },
      data: {
        status: "submitted",
        submittedAt: new Date(),
        applicationId: application?.id ?? null,
        submitError: null,
        declarations: {
          version: DECLARATIONS_VERSION,
          acceptedAt: declaredAt,
          ip: meta.ip ?? null,
          items: DECLARATIONS.map((declaration) => ({ key: declaration.key, text: declaration.text, accepted: true })),
        },
      },
    });
    return { applicationNumber: application?.applicationNumber ?? reference };
  } catch (error) {
    if (error instanceof DraftSubmitError) throw error;
    console.error("DAK DRAFT SUBMIT ERROR:", error);
    await prisma.dakDraft.update({
      where: { id: draft.id },
      data: { status: "ready", submitError: "We couldn't submit your application right now. Please try again shortly." },
    });
    throw new DraftSubmitError("We couldn't submit your application right now. Please try again shortly.");
  }
}
