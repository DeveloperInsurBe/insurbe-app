import { prisma } from "../prisma";
import { DakTransitionError } from "./cases";
import { notifyDakReviewers } from "./notify";

/**
 * Records the customer's answer to one open information request. Once every
 * open request is answered the case moves to "Customer Responded" and the
 * reviewers get an alert.
 */
export async function recordCustomerResponse({
  caseId,
  caseNumber,
  requestId,
  response,
  customerName,
  note,
}: {
  caseId: string;
  caseNumber: string;
  requestId: string;
  response: string;
  customerName: string;
  /** Shown next to the timeline entry, e.g. "Replied from dashboard". */
  note: string;
}) {
  const answered = await prisma.dakInfoRequest.updateMany({
    where: { id: requestId, caseId, status: "open" },
    data: { status: "responded", response, respondedAt: new Date() },
  });
  if (answered.count !== 1) throw new DakTransitionError("This request was already answered.");

  const stillOpen = await prisma.dakInfoRequest.count({ where: { caseId, status: "open" } });
  const moved =
    stillOpen === 0 &&
    (
      await prisma.dakCase.updateMany({
        where: { id: caseId, status: "Information Required" },
        data: { status: "Customer Responded" },
      })
    ).count === 1;

  await prisma.dakEvent.create({
    data: {
      caseId,
      event: "Customer responded to information request",
      note,
      actorType: "customer",
      actorName: customerName,
      fromStatus: moved ? "Information Required" : null,
      toStatus: moved ? "Customer Responded" : null,
    },
  });

  await notifyDakReviewers({ kind: "customer_response", caseNumber, applicantName: customerName });
  return { moved, stillOpen };
}
