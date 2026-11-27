import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

import { prisma } from "../../prisma";
import { DAK_FINAL_STATUSES } from "../statuses";
import { BULK_CONSENT_TEXT, BULK_CONSENT_VERSION, DRAFT_RETENTION_DAYS } from "./config";
import type { ParsedRow } from "./parse";

/** Shown to the partner for held rows; never says why (account existence stays private). */
export const HELD_MESSAGE = "Needs a check by InsurBe before it can continue.";

/** Roles that are customers; anyone else (partner, admin, reviewer, ...) is held for InsurBe. */
const CUSTOMER_ROLES = new Set(["user", "", null]);

type Partner = { userId: string; partnerRef: string };

export type ImportOutcome = {
  batchId: string;
  /** New drafts created by this upload */
  imported: number;
  /** People this partner had already imported: their existing draft is kept, nothing is sent again */
  alreadyImported: number;
  held: number;
  errors: number;
  rows: { rowNumber: number; status: "imported" | "already_imported" | "held" | "error"; reference?: string; message?: string }[];
};

const lower = (value: string | undefined) => (value ?? "").trim().toLowerCase();

async function nextDraftReferences(count: number) {
  if (!count) return [];
  const rows = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT nextval('"DakDraftNumber_seq"') AS n FROM generate_series(1, ${count}::int)`;
  const year = new Date().getUTCFullYear();
  return rows.map((row) => `IB-DAK-D-${year}-${String(row.n).padStart(4, "0")}`);
}

/**
 * Why a row can't become a draft right now, for InsurBe only. Same rules as a
 * normal DAK application (active / in progress / not eligible), checked for
 * all rows at once, plus open drafts and non-customer accounts.
 */
async function findHeldReasons(rows: ParsedRow[], partner: Partner) {
  const emails = rows.map((row) => row.data.email);
  const reasons = new Map<string, string>();
  const reuse = new Map<string, { id: string; reference: string }>();

  const [cases, users, drafts] = await Promise.all([
    prisma.$queryRaw<{ email: string; status: string }[]>`
      SELECT lower(trim(ia."payload"->'personal'->>'email')) AS email, c."status"
      FROM "DakCase" c
      JOIN "InsuranceApplication" ia ON ia."id" = c."insuranceApplicationId"
      WHERE lower(trim(ia."payload"->'personal'->>'email')) = ANY(${emails})`,
    prisma.user.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      select: { email: true, role: true },
    }),
    prisma.dakDraft.findMany({
      where: { email: { in: emails }, status: { notIn: ["submitted", "expired"] } },
      select: { id: true, reference: true, email: true, partnerRef: true },
    }),
  ]);

  for (const row of cases) {
    if (row.status === "Active") reasons.set(row.email, "Already insured with DAK");
    else if (row.status === "Not Eligible") reasons.set(row.email, reasons.get(row.email) ?? "DAK said not eligible before");
    else if (!(DAK_FINAL_STATUSES as string[]).includes(row.status)) {
      reasons.set(row.email, reasons.get(row.email) ?? "A DAK application is already in progress");
    }
  }
  for (const user of users) {
    if (!CUSTOMER_ROLES.has(user.role ?? "")) reasons.set(lower(user.email), "Email belongs to a non-customer account");
  }
  for (const draft of drafts) {
    // The same partner uploading the same person again reuses the draft (safe retry).
    if (draft.partnerRef === partner.partnerRef) reuse.set(draft.email, { id: draft.id, reference: draft.reference });
    else reasons.set(draft.email, reasons.get(draft.email) ?? "Another partner already started a draft");
  }

  // Not eligible before under another email: name + date of birth.
  const people = rows.filter((row) => row.data.date_of_birth);
  if (people.length) {
    const keys = people.map((row) => `${lower(row.data.first_name)}|${lower(row.data.last_name)}|${row.data.date_of_birth}`);
    const matches = await prisma.$queryRaw<{ key: string }[]>`
      SELECT lower(trim(ia."payload"->'personal'->>'firstName')) || '|' ||
             lower(trim(ia."payload"->'personal'->>'lastName')) || '|' ||
             lower(trim(ia."payload"->'selectPlan'->>'dob')) AS key
      FROM "DakCase" c
      JOIN "InsuranceApplication" ia ON ia."id" = c."insuranceApplicationId"
      WHERE c."status" = 'Not Eligible'`;
    const blocked = new Set(matches.map((match) => match.key));
    people.forEach((row, index) => {
      if (blocked.has(keys[index])) reasons.set(row.data.email, reasons.get(row.data.email) ?? "DAK said not eligible before");
    });
  }

  return { reasons, reuse };
}

/**
 * Creates the batch, one row record per line and one draft per valid,
 * unblocked person. Nothing reaches the DAK portal: drafts only become DAK
 * applications when the customer submits them.
 */
export async function importDakDrafts(partner: Partner, fileName: string, parsed: ParsedRow[]): Promise<ImportOutcome> {
  const valid = parsed.filter((row) => row.errors.length === 0);
  const { reasons, reuse } = valid.length ? await findHeldReasons(valid, partner) : { reasons: new Map(), reuse: new Map() };

  const toCreate = valid.filter((row) => !reasons.has(row.data.email) && !reuse.has(row.data.email));
  const references = await nextDraftReferences(toCreate.length);
  const batchId = randomUUID();
  const purgeAfter = new Date(Date.now() + DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const rowRecords: Prisma.DakImportRowCreateManyInput[] = [];
  const drafts: Prisma.DakDraftCreateManyInput[] = [];
  const outcome: ImportOutcome = { batchId, imported: 0, alreadyImported: 0, held: 0, errors: 0, rows: [] };

  for (const row of parsed) {
    const rowId = randomUUID();
    if (row.errors.length) {
      rowRecords.push({ id: rowId, batchId, rowNumber: row.rowNumber, data: row.data, status: "error", errors: row.errors });
      outcome.errors += 1;
      outcome.rows.push({ rowNumber: row.rowNumber, status: "error", message: row.errors.join("; ") });
      continue;
    }
    const reason = reasons.get(row.data.email);
    if (reason) {
      rowRecords.push({ id: rowId, batchId, rowNumber: row.rowNumber, data: row.data, status: "held", errors: [reason] });
      outcome.held += 1;
      outcome.rows.push({ rowNumber: row.rowNumber, status: "held", message: HELD_MESSAGE });
      continue;
    }
    const existing = reuse.get(row.data.email);
    if (existing) {
      rowRecords.push({ id: rowId, batchId, rowNumber: row.rowNumber, data: row.data, status: "already_imported", draftId: existing.id });
      outcome.alreadyImported += 1;
      outcome.rows.push({
        rowNumber: row.rowNumber,
        status: "already_imported",
        reference: existing.reference,
        message: "Already imported earlier – nothing changed, no new email sent",
      });
      continue;
    }
    const draftId = randomUUID();
    const reference = references[drafts.length];
    drafts.push({
      id: draftId,
      reference,
      email: row.data.email,
      firstName: row.data.first_name,
      lastName: row.data.last_name,
      prefill: row.data,
      partnerUserId: partner.userId,
      partnerRef: partner.partnerRef,
      source: "partner",
      batchId,
      rowId,
      purgeAfter,
    });
    rowRecords.push({ id: rowId, batchId, rowNumber: row.rowNumber, data: row.data, status: "imported", draftId });
    outcome.imported += 1;
    outcome.rows.push({ rowNumber: row.rowNumber, status: "imported", reference });
  }

  // One batch of writes (no interactive transaction: the shared pooler can be slow).
  await prisma.$transaction([
    prisma.dakImportBatch.create({
      data: {
        id: batchId,
        partnerUserId: partner.userId,
        partnerRef: partner.partnerRef,
        fileName: fileName.slice(0, 200),
        rowCount: parsed.length,
        importedCount: outcome.imported,
        heldCount: outcome.held,
        errorCount: outcome.errors,
        consentText: BULK_CONSENT_TEXT,
        consentVersion: BULK_CONSENT_VERSION,
        consentAt: new Date(),
      },
    }),
    prisma.dakImportRow.createMany({ data: rowRecords }),
    prisma.dakDraft.createMany({ data: drafts }),
  ]);

  return outcome;
}
