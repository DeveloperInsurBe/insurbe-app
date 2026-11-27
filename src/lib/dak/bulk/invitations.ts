import { createHash, randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";

import { prisma } from "../../prisma";
import { getMawsitaBucketName, getSupabaseStorageAdmin } from "../../supabaseStorageAdmin";
import { DRAFT_RETENTION_DAYS, INVITE_VALID_DAYS } from "./config";

/**
 * DAK bulk upload invitations: one email per draft with a single-use link.
 * Only the SHA-256 hash of the token is stored; the link works for
 * INVITE_VALID_DAYS and is cleared once the customer accepts it.
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "InsurBe <noreply@insurbe.com>";
/** Resend accepts at most 100 emails per batch call. */
const BATCH_SIZE = 50;

export const hashInviteToken = (token: string) => createHash("sha256").update(token).digest("hex");

const baseUrl = () => process.env.NEXTAUTH_URL || "https://insurbe.com";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);

function invitationEmail(params: { firstName: string; partnerName: string; link: string; reference: string }) {
  const firstName = escapeHtml(params.firstName);
  const partnerName = escapeHtml(params.partnerName);
  return `
  <div style="font-family:Arial,sans-serif;background:#f4f6fb;padding:32px 16px;">
    <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(90deg,#6D28D9,#9333EA);padding:22px;text-align:center;">
        <h2 style="color:#fff;margin:0;font-weight:600;">InsurBe</h2>
      </div>
      <div style="padding:28px;color:#333;font-size:15px;line-height:1.6;">
        <h3 style="margin-top:0;font-size:20px;">Hello ${firstName},</h3>
        <p><b>${partnerName}</b> has started a DAK health insurance application for you with InsurBe (reference ${escapeHtml(params.reference)}).</p>
        <p>To continue, please check your details, upload your documents and submit the application yourself. <b>Nothing is sent to DAK until you submit it.</b></p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${params.link}" style="background:#6D28D9;color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:600;display:inline-block;">Continue my DAK application</a>
        </div>
        <p style="font-size:13px;color:#666;">This link works once and for ${INVITE_VALID_DAYS} days. After that, you can continue from your InsurBe account.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:22px 0;" />
        <p style="font-size:12px;color:#777;line-height:1.5;">
          <b>About your data:</b> The partner who started your application shared your name, email address and the details they had with InsurBe GmbH,
          which is responsible for this data. We use it only to prepare your DAK application, at your request.
          If you don't continue, we delete it after ${DRAFT_RETENTION_DAYS} days.
          You can ask us to see, correct or delete your data at any time, or object to its use, at
          <a href="mailto:support@insurbe.com" style="color:#6D28D9;">support@insurbe.com</a>.
          You can also complain to a data protection authority. Details: <a href="${baseUrl()}/privacypolicy" style="color:#6D28D9;">privacy policy</a>.
        </p>
        <p style="font-size:12px;color:#777;">If you did not ask for this, you can ignore this email.</p>
      </div>
    </div>
  </div>`;
}

/**
 * Sends invitations for drafts that have none yet (status "imported"),
 * optionally only those of one upload. Safe to call more than once: a draft
 * gets a new token only when it is actually sent.
 */
export async function sendPendingInvitations(options: { batchId?: string; draftIds?: string[]; limit?: number } = {}) {
  const candidates = await prisma.dakDraft.findMany({
    where: {
      status: "imported",
      ...(options.batchId ? { batchId: options.batchId } : {}),
      ...(options.draftIds ? { id: { in: options.draftIds } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: options.limit ?? 200,
    select: { id: true, email: true, firstName: true, reference: true, partnerUserId: true },
  });
  if (!candidates.length) return { sent: 0, failed: 0 };

  // Claim each draft ("imported" -> "sending") so two runs at the same time
  // (after an import and the scheduled job) never email the same person twice.
  const claims = await prisma.$transaction(
    candidates.map((draft) =>
      prisma.dakDraft.updateMany({ where: { id: draft.id, status: "imported" }, data: { status: "sending" } }),
    ),
  );
  const drafts = candidates.filter((_, index) => claims[index].count === 1);
  if (!drafts.length) return { sent: 0, failed: 0 };

  const partnerIds = [...new Set(drafts.map((draft) => draft.partnerUserId))];
  const partners = await prisma.user.findMany({
    where: { id: { in: partnerIds } },
    select: { id: true, companyName: true, firstName: true, lastName: true },
  });
  const partnerName = (id: string) => {
    const partner = partners.find((item) => item.id === id);
    return partner?.companyName || [partner?.firstName, partner?.lastName].filter(Boolean).join(" ") || "An InsurBe partner";
  };

  let sent = 0;
  let failed = 0;
  for (let start = 0; start < drafts.length; start += BATCH_SIZE) {
    const chunk = drafts.slice(start, start + BATCH_SIZE).map((draft) => {
      const token = randomBytes(32).toString("base64url");
      return { draft, token, link: `${baseUrl()}/dak-invite?token=${token}` };
    });
    const expiresAt = new Date(Date.now() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000);

    const message = ({ draft, link }: (typeof chunk)[number]) => ({
      from: FROM,
      to: draft.email,
      subject: "Your DAK health insurance application – please complete it",
      html: invitationEmail({ firstName: draft.firstName, partnerName: partnerName(draft.partnerUserId), link, reference: draft.reference }),
    });

    // One batch call; if Resend rejects the batch (e.g. one bad address), send
    // one by one so the other people still get their email.
    const errors = new Map<string, string>();
    let batchError: string | null = null;
    try {
      const result = await resend.batch.send(chunk.map(message));
      if (result.error) batchError = result.error.message;
    } catch (sendError) {
      batchError = (sendError as Error).message;
    }
    if (batchError) {
      console.error("DAK BULK INVITATIONS: batch failed, sending one by one:", batchError);
      for (const item of chunk) {
        try {
          const result = await resend.emails.send(message(item));
          if (result.error) errors.set(item.draft.id, result.error.message);
        } catch (sendError) {
          errors.set(item.draft.id, (sendError as Error).message);
        }
        await new Promise((resolve) => setTimeout(resolve, 550)); // stay under Resend's rate limit
      }
    }

    // One batch of writes per chunk.
    await prisma.$transaction(
      chunk.map(({ draft, token }) => {
        const error = errors.get(draft.id);
        return prisma.dakDraft.update({
          where: { id: draft.id },
          data: error
            ? { status: "email_failed", inviteError: error.slice(0, 300) }
            : {
                status: "invitation_sent",
                inviteTokenHash: hashInviteToken(token),
                inviteExpiresAt: expiresAt,
                inviteSentAt: new Date(),
                inviteError: null,
              },
        });
      }),
    );
    failed += errors.size;
    sent += chunk.length - errors.size;
  }
  return { sent, failed };
}

/** Drafts left in "sending" by a run that crashed go back to the queue. */
export async function releaseStuckInvitations() {
  const result = await prisma.dakDraft.updateMany({
    where: { status: "sending", updatedAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } },
    data: { status: "imported" },
  });
  return result.count;
}

/** Marks invitations that were never accepted in time as expired. */
export async function expireOldInvitations() {
  const result = await prisma.dakDraft.updateMany({
    where: { status: "invitation_sent", acceptedAt: null, inviteExpiresAt: { lt: new Date() } },
    data: { status: "expired", inviteTokenHash: null },
  });
  return result.count;
}

/** A draft by its invitation token, if the link is still valid. */
export async function findDraftByInviteToken(token: string) {
  if (!token || token.length > 200) return null;
  const draft = await prisma.dakDraft.findUnique({
    where: { inviteTokenHash: hashInviteToken(token) },
    select: {
      id: true,
      reference: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      acceptedAt: true,
      inviteExpiresAt: true,
      partnerUserId: true,
    },
  });
  if (!draft || draft.acceptedAt || draft.status !== "invitation_sent") return null;
  if (!draft.inviteExpiresAt || draft.inviteExpiresAt < new Date()) return null;
  return draft;
}

/**
 * Partner asks InsurBe to send the invitation again (email failed, or the link
 * expired before the customer used it). Only their own drafts, only while the
 * personal data is still kept.
 */
export async function resendInvitation(draftId: string, partnerRef: string) {
  const reset = await prisma.dakDraft.updateMany({
    where: {
      id: draftId,
      partnerRef,
      status: { in: ["email_failed", "expired"] },
      acceptedAt: null,
      purgeAfter: { gt: new Date() },
    },
    data: { status: "imported", inviteError: null, inviteTokenHash: null },
  });
  if (reset.count !== 1) return null;
  return sendPendingInvitations({ draftIds: [draftId] });
}

/**
 * Deletes the personal data of drafts that were never submitted once their
 * retention period is over: uploaded files, prefill, answers and the matching
 * spreadsheet rows. Only a neutral record (reference, partner, dates) stays.
 */
export async function purgeExpiredDrafts(limit = 100) {
  const drafts = await prisma.dakDraft.findMany({
    where: { purgeAfter: { lt: new Date() }, status: { notIn: ["submitted", "submitting", "deleted"] } },
    take: limit,
    select: { id: true },
  });
  const storage = getSupabaseStorageAdmin().storage.from(getMawsitaBucketName());

  for (const draft of drafts) {
    const folder = `dak-drafts/${draft.id}`;
    const { data: files } = await storage.list(folder, { limit: 100 });
    if (files?.length) await storage.remove(files.map((file) => `${folder}/${file.name}`)).catch(() => null);

    await prisma.$transaction([
      prisma.dakDraft.update({
        where: { id: draft.id },
        data: {
          status: "deleted",
          email: `deleted-${draft.id}@deleted.invalid`,
          firstName: "Deleted",
          lastName: "",
          prefill: {},
          form: Prisma.DbNull,
          documents: Prisma.DbNull,
          inviteTokenHash: null,
          inviteError: null,
          submitError: null,
        },
      }),
      prisma.dakImportRow.updateMany({ where: { draftId: draft.id }, data: { data: {}, errors: Prisma.DbNull } }),
    ]);
  }

  // Rows that never became drafts (errors, held) keep no personal data past the retention period either.
  const cutoff = new Date(Date.now() - DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.dakImportRow.updateMany({
    where: { draftId: null, status: { in: ["error", "held"] }, batch: { createdAt: { lt: cutoff } }, NOT: { data: { equals: {} } } },
    data: { data: {}, errors: Prisma.DbNull },
  });
  return { drafts: drafts.length, rows: rows.count };
}
