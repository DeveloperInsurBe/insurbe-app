import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { applicantFromPayload } from "@/lib/dak/cases";
import { isDakStatus } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const events = await prisma.dakEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: { case: { select: { caseNumber: true, insuranceApplication: { select: { payload: true } } } } },
    });
    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        createdAt: event.createdAt.toISOString(),
        actorType: event.actorType,
        actorName: event.actorName,
        applicationId: event.case.caseNumber,
        applicant: applicantFromPayload(event.case.insuranceApplication.payload).name,
        event: event.event,
        note: event.note,
        fromStatus: isDakStatus(event.fromStatus) ? event.fromStatus : null,
        toStatus: isDakStatus(event.toStatus) ? event.toStatus : null,
      })),
    });
  } catch (error) {
    console.error("DAK PORTAL ACTIVITY ERROR:", error);
    return NextResponse.json({ error: "Could not load the activity log" }, { status: 500 });
  }
}
