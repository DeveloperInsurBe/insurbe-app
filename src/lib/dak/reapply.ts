import { prisma } from "../prisma";
import { DAK_SUPPORT_EMAIL } from "./emails";
import { DAK_FINAL_STATUSES } from "./statuses";

/**
 * Who may submit a new DAK application (DAK only, TK is not affected):
 * - already insured (Active)            -> blocked
 * - an application still in progress    -> blocked (matched by email)
 * - DAK said not eligible before        -> blocked (matched by email, or name + date of birth)
 * - only cancelled applications before  -> allowed
 * Switched on with DAK_REAPPLY_RULES=true, once old applications are cleaned up.
 */
export const dakReapplyRulesEnabled = () => process.env.DAK_REAPPLY_RULES === "true";

export type DakReapplyBlock = { reason: "active" | "in_progress" | "not_eligible"; message: string };

const clean = (value: unknown) => (typeof value === "string" ? value.trim().toLowerCase() : "");

export async function checkDakReapply(
  personal: { email?: unknown; firstName?: unknown; lastName?: unknown },
  selectPlan: { dob?: unknown },
): Promise<DakReapplyBlock | null> {
  const email = clean(personal.email);
  const firstName = clean(personal.firstName);
  const lastName = clean(personal.lastName);
  const dob = clean(selectPlan.dob);

  // Earlier DAK applications with the same email.
  const byEmail = email
    ? await prisma.$queryRaw<{ caseNumber: string; status: string }[]>`
        SELECT c."caseNumber", c."status"
        FROM "DakCase" c
        JOIN "InsuranceApplication" ia ON ia."id" = c."insuranceApplicationId"
        WHERE lower(trim(ia."payload"->'personal'->>'email')) = ${email}
        ORDER BY c."submittedAt" DESC`
    : [];

  const active = byEmail.find((row) => row.status === "Active");
  if (active) {
    return {
      reason: "active",
      message: `You are already insured with DAK (application ${active.caseNumber}). You can see your membership in your InsurBe dashboard.`,
    };
  }

  const open = byEmail.find((row) => !(DAK_FINAL_STATUSES as string[]).includes(row.status));
  if (open) {
    return {
      reason: "in_progress",
      message: `You already have a DAK application in progress (${open.caseNumber}). You can follow it in your InsurBe dashboard.`,
    };
  }

  let notEligible = byEmail.some((row) => row.status === "Not Eligible");

  // Same person with another email: name + date of birth (only for "not eligible").
  if (!notEligible && firstName && lastName && dob) {
    const byPerson = await prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*) AS n
      FROM "DakCase" c
      JOIN "InsuranceApplication" ia ON ia."id" = c."insuranceApplicationId"
      WHERE c."status" = 'Not Eligible'
        AND lower(trim(ia."payload"->'personal'->>'firstName')) = ${firstName}
        AND lower(trim(ia."payload"->'personal'->>'lastName')) = ${lastName}
        AND lower(trim(ia."payload"->'selectPlan'->>'dob')) = ${dob}`;
    notEligible = Number(byPerson[0]?.n ?? 0) > 0;
  }

  if (notEligible) {
    return {
      reason: "not_eligible",
      message: `DAK could not accept a previous application from you, so a new DAK application is not possible. If you have questions, please contact ${DAK_SUPPORT_EMAIL}.`,
    };
  }

  return null;
}
