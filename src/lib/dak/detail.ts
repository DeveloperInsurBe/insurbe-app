import { prisma } from "../prisma";
import { applicantFromPayload, caseStatus, dueState } from "./cases";
import { isDakStatus } from "./statuses";

export const dakTestToolsEnabled = () => process.env.DAK_PORTAL_TEST_TOOLS === "true";

const iso = (value: Date | null) => (value ? value.toISOString() : null);

export function serializeDocument(document: {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  source: string;
  reviewStatus: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: document.id,
    name: document.name,
    mimeType: document.mimeType,
    size: document.size,
    source: document.source as "customer" | "insurbe" | "dak",
    reviewStatus: document.reviewStatus as "pending" | "reviewed" | "auto",
    reviewedBy: document.reviewedBy,
    reviewedAt: iso(document.reviewedAt),
    uploadedAt: document.createdAt.toISOString(),
  };
}

export type DakDocumentDto = ReturnType<typeof serializeDocument>;

/** Everything the application detail page shows, by case number (IB-DAK-040). */
export async function loadDakCaseDetail(caseNumber: string) {
  const item = await prisma.dakCase.findUnique({
    where: { caseNumber },
    include: {
      insuranceApplication: { select: { payload: true } },
      events: { orderBy: { createdAt: "asc" } },
      requests: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!item) return null;

  const applicant = applicantFromPayload(item.insuranceApplication.payload);
  const status = caseStatus(item.status);
  const openRequests = item.requests.filter((request) => request.status === "open");

  return {
    id: item.caseNumber,
    status,
    submittedAt: item.submittedAt.toISOString(),
    closedReason: item.closedReason,
    due: dueState(openRequests),
    applicant,
    allocation:
      status === "Active"
        ? {
            membershipNumber: item.membershipNumber,
            kvnr: item.kvnr,
            svnr: item.svnr,
            startDate: item.confirmedStartDate,
            contributionCategory: item.contributionCategory,
          }
        : null,
    events: item.events.map((event) => ({
      id: event.id,
      event: event.event,
      fromStatus: isDakStatus(event.fromStatus) ? event.fromStatus : null,
      toStatus: isDakStatus(event.toStatus) ? event.toStatus : null,
      note: event.note,
      actorType: event.actorType as "customer" | "reviewer" | "system",
      actorName: event.actorName,
      createdAt: event.createdAt.toISOString(),
    })),
    requests: item.requests.map((request) => ({
      id: request.id,
      category: request.category,
      relatedField: request.relatedField,
      message: request.message,
      internalNote: request.internalNote,
      dueDate: iso(request.dueDate),
      priority: request.priority,
      status: request.status as "open" | "responded",
      response: request.response,
      respondedAt: iso(request.respondedAt),
      createdAt: request.createdAt.toISOString(),
    })),
    documents: item.documents.map(serializeDocument),
    testTools: dakTestToolsEnabled(),
  };
}

export type DakCaseDetail = NonNullable<Awaited<ReturnType<typeof loadDakCaseDetail>>>;

/** Internal id + customer contact of a case, for actions. */
export async function findDakCaseForAction(caseNumber: string) {
  const item = await prisma.dakCase.findUnique({
    where: { caseNumber },
    select: { id: true, caseNumber: true, status: true, insuranceApplication: { select: { payload: true } } },
  });
  if (!item) return null;
  const applicant = applicantFromPayload(item.insuranceApplication.payload);
  return {
    id: item.id,
    caseNumber: item.caseNumber,
    status: caseStatus(item.status),
    customer: { email: applicant.email, name: applicant.name, caseNumber: item.caseNumber },
  };
}
