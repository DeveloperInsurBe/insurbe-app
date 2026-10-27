import { Prisma } from "@prisma/client";

import { prisma } from "../prisma";
import {
  DAK_ACTIONS,
  DAK_DUE_SOON_DAYS,
  dakCategoryFromReason,
  isDakFinal,
  isDakStatus,
  type DakAction,
  type DakCategory,
  type DakStatus,
} from "./statuses";

/* -------------------------------------------------------------------------- */
/*                                  CREATING                                  */
/* -------------------------------------------------------------------------- */

/** Next DAK application number, e.g. IB-DAK-061. Never handed out twice. */
export async function nextDakApplicationNumber() {
  const [row] = await prisma.$queryRaw<{ n: bigint }[]>`SELECT nextval('"DakApplicationNumber_seq"') AS n`;
  return `IB-DAK-${String(row.n).padStart(3, "0")}`;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim());

function applicantNameFromPayload(payload: unknown) {
  const personal = (payload as { personal?: Record<string, unknown> } | null)?.personal ?? {};
  return [text(personal.firstName), text(personal.lastName)].filter(Boolean).join(" ") || "Customer";
}

/**
 * Opens the review case (status "Submitted") for a stored DAK application. The
 * case uses the customer's application number, so the portal and the
 * customer's emails show the same IB-DAK number.
 */
export async function createDakCase(application: {
  id: string;
  createdAt: Date | null;
  payload: unknown;
  applicationNumber: string | null;
}) {
  const submittedAt = application.createdAt ?? new Date();
  let caseNumber = application.applicationNumber;
  if (!caseNumber) {
    caseNumber = await nextDakApplicationNumber();
    await prisma.insuranceApplication.update({ where: { id: application.id }, data: { applicationNumber: caseNumber } });
  }

  // One nested write (atomic) instead of an interactive transaction: the shared
  // Supabase pooler can be slow to hand out connections.
  return prisma.dakCase.create({
    data: {
      insuranceApplicationId: application.id,
      caseNumber,
      submittedAt,
      events: {
        create: {
          event: "Application submitted",
          toStatus: "Submitted",
          actorType: "customer",
          actorName: applicantNameFromPayload(application.payload),
          createdAt: submittedAt,
        },
      },
    },
  });
}

/** Safety net: opens cases for DAK applications that do not have one yet. */
export async function ensureDakCases() {
  const missing = await prisma.insuranceApplication.findMany({
    where: { provider: "DAK", dakCase: null },
    select: { id: true, createdAt: true, payload: true, applicationNumber: true },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  for (const application of missing) {
    try {
      await createDakCase(application);
    } catch (error) {
      // Another request created it at the same time.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                  APPLICANT                                 */
/* -------------------------------------------------------------------------- */

export type DakApplicant = {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string | null;
  gender: string;
  nationality: string;
  maritalStatus: string;
  placeOfBirth: string;
  countryOfBirth: string;
  passportNumber: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  category: DakCategory | null;
  reason: string;
  institution: string;
  insuredBefore: string;
  previousInsuranceType: string;
  currentInsurer: string;
  familyMembers: string;
  additionalInfo: string;
  /** Not asked by the DAK form yet. */
  requestedStartDate: string | null;
};

export function applicantFromPayload(payload: unknown): DakApplicant {
  const data = (payload ?? {}) as { personal?: Record<string, unknown>; selectPlan?: Record<string, unknown> };
  const personal = data.personal ?? {};
  const plan = data.selectPlan ?? {};
  const firstName = text(personal.firstName);
  const lastName = text(personal.lastName);
  const requestedStart = text(plan.startDate ?? personal.startDate);

  return {
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || "Unknown applicant",
    email: text(personal.email),
    phone: [text(personal.countryCode), text(personal.phoneNumber)].filter(Boolean).join(" "),
    birthDate: text(plan.dob ?? personal.dob) || null,
    gender: text(personal.gender),
    nationality: text(personal.nationality),
    maritalStatus: text(personal.maritalStatus),
    placeOfBirth: text(personal.placeOfBirth),
    countryOfBirth: text(personal.countryOfBirth),
    passportNumber: text(personal.passportNumber),
    street: text(personal.streetNo),
    postalCode: text(personal.postalCode),
    city: text(personal.city),
    country: text(personal.country),
    category: dakCategoryFromReason(plan.reason),
    reason: text(plan.reason),
    institution: text(plan.institutionName),
    insuredBefore: text(plan.insuredBefore),
    previousInsuranceType: text(plan.previousInsuranceType),
    currentInsurer: text(plan.previousProviderName),
    familyMembers: text(personal.includeFamilyMembers),
    additionalInfo: text(personal.additionalInfo),
    requestedStartDate: requestedStart || null,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 SERIALIZING                                */
/* -------------------------------------------------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

export type DakDue = "overdue" | "due_soon" | null;

/** Overdue / due soon from the earliest due date of the open requests. */
export function dueState(openRequests: { dueDate: Date | null }[], now = new Date()): DakDue {
  const dates = openRequests.map((request) => request.dueDate?.getTime()).filter((value): value is number => !!value);
  if (!dates.length) return null;
  const earliest = Math.min(...dates);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (earliest < today) return "overdue";
  if (earliest - today <= DAK_DUE_SOON_DAYS * DAY_MS) return "due_soon";
  return null;
}

export const caseStatus = (value: string): DakStatus => (isDakStatus(value) ? value : "Submitted");

export const listInclude = {
  insuranceApplication: { select: { payload: true } },
  requests: { where: { status: "open" }, select: { dueDate: true } },
} satisfies Prisma.DakCaseInclude;

type ListCase = Prisma.DakCaseGetPayload<{ include: typeof listInclude }>;

export function serializeListRow(item: ListCase, now = new Date()) {
  const applicant = applicantFromPayload(item.insuranceApplication.payload);
  const status = caseStatus(item.status);
  return {
    id: item.caseNumber,
    name: applicant.name,
    email: applicant.email,
    birthDate: applicant.birthDate,
    category: applicant.category,
    submittedAt: item.submittedAt.toISOString(),
    startDate: item.confirmedStartDate ?? applicant.requestedStartDate,
    status,
    openRequests: isDakFinal(status) ? 0 : item.requests.length,
    ageDays: isDakFinal(status) ? null : Math.max(0, Math.floor((now.getTime() - item.submittedAt.getTime()) / DAY_MS)),
    due: isDakFinal(status) ? null : dueState(item.requests, now),
  };
}

export type DakListRow = ReturnType<typeof serializeListRow>;

/* -------------------------------------------------------------------------- */
/*                                 TRANSITIONS                                */
/* -------------------------------------------------------------------------- */

export class DakTransitionError extends Error {
  constructor(message: string, readonly status = 409) {
    super(message);
  }
}

/**
 * Moves a case to the action's target status and writes the audit event (plus
 * any nested writes in `data`) in one atomic update. Fails if someone else
 * changed the status in the meantime.
 */
export async function transitionDakCase({
  caseId,
  from,
  action,
  actor,
  note,
  event,
  data,
}: {
  caseId: string;
  /** Status the caller loaded; the update only applies while it is unchanged. */
  from: DakStatus;
  action: DakAction;
  actor: { type: "reviewer" | "customer" | "system"; name: string; id?: string };
  note?: string | null;
  event?: string;
  data?: Omit<Prisma.DakCaseUpdateInput, "status" | "events">;
}) {
  const definition = DAK_ACTIONS[action];
  if (!definition.from.includes(from)) {
    throw new DakTransitionError(`This action is not possible while the application is "${from}".`);
  }

  try {
    await prisma.dakCase.update({
      where: { id: caseId, status: from },
      data: {
        ...data,
        status: definition.to,
        events: {
          create: {
            event: event ?? definition.event,
            fromStatus: from,
            toStatus: definition.to,
            note: note || null,
            actorType: actor.type,
            actorName: actor.name,
            actorId: actor.id,
          },
        },
      },
    });
  } catch (error) {
    // P2025: no row matched, i.e. the status changed after it was loaded.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new DakTransitionError("The application was changed meanwhile. Please reload.");
    }
    throw error;
  }
  return { from, to: definition.to };
}
