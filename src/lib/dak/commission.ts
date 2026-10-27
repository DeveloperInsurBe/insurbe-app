import { prisma } from "../prisma";

const PUBLIC_PRODUCT = "Public Health Insurance";

/**
 * Keeps the partner/agent commission in line with the DAK decision:
 * Active -> Approved, Cancelled / Not Eligible -> Not Eligible.
 * Only automatic states are changed; Paid and Rejected are admin decisions.
 *
 * The commission row (Application) stores the DAK application number or the
 * InsuranceApplication id as its orderId.
 */
export async function syncDakCommission(caseId: string, status: "Active" | "Cancelled" | "Not Eligible") {
  const item = await prisma.dakCase.findUnique({
    where: { id: caseId },
    select: { insuranceApplicationId: true, insuranceApplication: { select: { applicationNumber: true } } },
  });
  if (!item) return 0;

  const orderIds = [item.insuranceApplicationId, item.insuranceApplication.applicationNumber].filter(
    (value): value is string => !!value,
  );

  const { count } = await prisma.application.updateMany({
    where: {
      product: PUBLIC_PRODUCT,
      orderId: { in: orderIds },
      commissionStatus: status === "Active" ? "Pending" : { in: ["Pending", "Approved"] },
    },
    data: { commissionStatus: status === "Active" ? "Approved" : "Not Eligible" },
  });
  return count;
}
