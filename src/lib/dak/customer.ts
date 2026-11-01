import { prisma } from "../prisma";
import { caseStatus, ensureDakCases } from "./cases";
import { DAK_CUSTOMER_STATUS, isDakStatus } from "./statuses";

/** Customer side of the DAK portal is switched on per environment. */
export const dakCustomerPortalEnabled = () => process.env.DAK_CUSTOMER_PORTAL === "true";

/** Ids of the DAK applications submitted with this email (case-insensitive). */
async function applicationIdsForEmail(email: string) {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "InsuranceApplication"
    WHERE "provider" = 'DAK'
      AND lower(trim("payload"->'personal'->>'email')) = ${email.trim().toLowerCase()}`;
  return rows.map((row) => row.id);
}

/**
 * Everything the customer may see about their own DAK applications. Never
 * includes internal notes, reviewer names or files other than the
 * membership letter.
 */
export async function getCustomerDakApplications(email: string) {
  const ids = await applicationIdsForEmail(email);
  if (!ids.length) return [];

  // Safety net, in case a recent submission has no review case yet.
  await ensureDakCases();

  const cases = await prisma.dakCase.findMany({
    where: { insuranceApplicationId: { in: ids } },
    orderBy: { submittedAt: "desc" },
    include: {
      events: { where: { toStatus: { not: null } }, orderBy: { createdAt: "asc" }, select: { toStatus: true, createdAt: true } },
      requests: {
        where: { status: "open" },
        orderBy: { createdAt: "asc" },
        select: { id: true, relatedField: true, message: true, dueDate: true, createdAt: true },
      },
      documents: { where: { source: "dak_letter" }, orderBy: { createdAt: "desc" }, select: { id: true, name: true } },
    },
  });

  return cases.map((item) => {
    const status = caseStatus(item.status);
    const wording = DAK_CUSTOMER_STATUS[status];
    const active = status === "Active";
    const closed = status === "Cancelled" || status === "Not Eligible";

    return {
      applicationNumber: item.caseNumber,
      status,
      label: wording.label,
      nextStep: wording.nextStep,
      progress: wording.progress,
      submittedAt: item.submittedAt.toISOString(),
      timeline: item.events
        .filter((event) => isDakStatus(event.toStatus))
        .map((event) => ({
          label: DAK_CUSTOMER_STATUS[caseStatus(event.toStatus as string)].timeline,
          at: event.createdAt.toISOString(),
        })),
      // Only while DAK is waiting for the customer.
      requests:
        status === "Information Required"
          ? item.requests.map((request) => ({
              id: request.id,
              topic: request.relatedField,
              message: request.message,
              dueDate: request.dueDate?.toISOString() ?? null,
              sentAt: request.createdAt.toISOString(),
            }))
          : [],
      membership: active ? { number: item.membershipNumber, startDate: item.confirmedStartDate } : null,
      letter: active && item.documents[0] ? { id: item.documents[0].id, name: item.documents[0].name } : null,
      reason: closed ? item.closedReason : null,
    };
  });
}

export type CustomerDakApplication = Awaited<ReturnType<typeof getCustomerDakApplications>>[number];

/** The membership letter, if it belongs to an active application of this customer. */
export async function findCustomerDakLetter(email: string, documentId: string) {
  const document = await prisma.dakDocument.findUnique({
    where: { id: documentId },
    select: {
      bucket: true,
      storagePath: true,
      name: true,
      source: true,
      case: { select: { status: true, insuranceApplicationId: true } },
    },
  });
  if (!document || document.source !== "dak_letter" || document.case.status !== "Active") return null;

  const ids = await applicationIdsForEmail(email);
  return ids.includes(document.case.insuranceApplicationId) ? document : null;
}

/** The case behind one of this customer's applications, or null if it is not theirs. */
export async function findCustomerDakCase(email: string, applicationNumber: string) {
  const item = await prisma.dakCase.findUnique({
    where: { caseNumber: applicationNumber },
    select: { id: true, caseNumber: true, status: true, insuranceApplicationId: true, insuranceApplication: { select: { payload: true } } },
  });
  if (!item) return null;

  const ids = await applicationIdsForEmail(email);
  if (!ids.includes(item.insuranceApplicationId)) return null;

  const personal = (item.insuranceApplication.payload as { personal?: { firstName?: string; lastName?: string } } | null)?.personal;
  return {
    id: item.id,
    caseNumber: item.caseNumber,
    status: caseStatus(item.status),
    customerName: [personal?.firstName, personal?.lastName].filter(Boolean).join(" ").trim() || "Customer",
  };
}
