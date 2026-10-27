import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { applicantFromPayload, ensureDakCases } from "@/lib/dak/cases";
import { prisma } from "@/lib/prisma";

// Reviewers are notified about new applications and customer replies.
const NOTIFY_WHERE = { actorType: "customer", toStatus: { in: ["Submitted", "Customer Responded"] } };

export async function GET() {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    await ensureDakCases();
    const user = await prisma.user.findUnique({ where: { id: reviewer.id }, select: { dakNotificationsSeenAt: true } });
    const seenAt = user?.dakNotificationsSeenAt ?? new Date(0);

    const [items, unread, needsAction] = await Promise.all([
      prisma.dakEvent.findMany({
        where: NOTIFY_WHERE,
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { case: { select: { caseNumber: true, insuranceApplication: { select: { payload: true } } } } },
      }),
      prisma.dakEvent.count({ where: { ...NOTIFY_WHERE, createdAt: { gt: seenAt } } }),
      prisma.dakCase.count({ where: { status: { in: ["Submitted", "Customer Responded"] } } }),
    ]);

    return NextResponse.json({
      unread,
      needsAction,
      items: items.map((event) => ({
        id: event.id,
        applicationId: event.case.caseNumber,
        name: applicantFromPayload(event.case.insuranceApplication.payload).name,
        kind: event.toStatus === "Submitted" ? "new_application" : "customer_response",
        createdAt: event.createdAt.toISOString(),
        unread: event.createdAt > seenAt,
      })),
    });
  } catch (error) {
    console.error("DAK PORTAL NOTIFICATIONS ERROR:", error);
    return NextResponse.json({ error: "Could not load notifications" }, { status: 500 });
  }
}

/** Marks all notifications as seen. */
export async function POST() {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  await prisma.user.update({ where: { id: reviewer.id }, data: { dakNotificationsSeenAt: new Date() } });
  return NextResponse.json({ ok: true });
}
