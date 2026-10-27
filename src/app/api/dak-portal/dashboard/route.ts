import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { applicantFromPayload, ensureDakCases, listInclude, serializeListRow } from "@/lib/dak/cases";
import { DAK_FINAL_STATUSES, DAK_STATUSES, type DakStatus } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

const payloadSelect = { insuranceApplication: { select: { payload: true } } };

export async function GET() {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    await ensureDakCases();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [grouped, queue, overdue, recent, pendingDocuments] = await Promise.all([
      prisma.dakCase.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.dakCase.findMany({
        where: { status: { in: ["Submitted", "Customer Responded"] } },
        include: listInclude,
        orderBy: { submittedAt: "asc" },
        take: 8,
      }),
      // Only cases still waiting for the customer; a request left open on a
      // cancelled case is not overdue anymore.
      prisma.dakInfoRequest.findMany({
        where: { status: "open", dueDate: { lt: startOfToday }, case: { status: "Information Required" } },
        select: { case: { select: { caseNumber: true, ...payloadSelect } } },
      }),
      prisma.dakEvent.findMany({
        where: { toStatus: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { case: { select: { caseNumber: true, ...payloadSelect } } },
      }),
      // Documents of final cases can no longer be reviewed.
      prisma.dakDocument.count({ where: { reviewStatus: "pending", case: { status: { notIn: DAK_FINAL_STATUSES } } } }),
    ]);

    const counts = Object.fromEntries(DAK_STATUSES.map((status) => [status, 0])) as Record<DakStatus, number>;
    grouped.forEach((row) => {
      if (row.status in counts) counts[row.status as DakStatus] = row._count._all;
    });

    const overdueByCase = new Map<string, { id: string; name: string; open: number }>();
    overdue.forEach(({ case: item }) => {
      const entry = overdueByCase.get(item.caseNumber) ?? {
        id: item.caseNumber,
        name: applicantFromPayload(item.insuranceApplication.payload).name,
        open: 0,
      };
      entry.open += 1;
      overdueByCase.set(item.caseNumber, entry);
    });

    return NextResponse.json({
      counts,
      total: Object.values(counts).reduce((sum, value) => sum + value, 0),
      queue: queue.map((item) => serializeListRow(item, now)),
      overdue: [...overdueByCase.values()],
      recent: recent.map((event) => ({
        id: event.id,
        applicationId: event.case.caseNumber,
        name: applicantFromPayload(event.case.insuranceApplication.payload).name,
        status: event.toStatus,
        createdAt: event.createdAt.toISOString(),
      })),
      pendingDocuments,
    });
  } catch (error) {
    console.error("DAK PORTAL DASHBOARD ERROR:", error);
    return NextResponse.json({ error: "Could not load the dashboard" }, { status: 500 });
  }
}
