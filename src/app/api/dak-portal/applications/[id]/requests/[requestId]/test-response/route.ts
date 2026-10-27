import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { DakTransitionError } from "@/lib/dak/cases";
import { dakTestToolsEnabled, findDakCaseForAction } from "@/lib/dak/detail";
import { prisma } from "@/lib/prisma";

/**
 * TEST ONLY (DAK_PORTAL_TEST_TOOLS=true): answers an open request as if the
 * customer had replied. Customers will reply from their dashboard later.
 */
export async function POST(req: Request, context: { params: Promise<{ id: string; requestId: string }> }) {
  if (!dakTestToolsEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id, requestId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const message = String(body?.response || "").trim().slice(0, 4000) || "Test response: the requested information was provided.";

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const answered = await prisma.dakInfoRequest.updateMany({
      where: { id: requestId, caseId: item.id, status: "open" },
      data: { status: "responded", response: message, respondedAt: new Date() },
    });
    if (answered.count !== 1) throw new DakTransitionError("This request is not open anymore.");

    // The case moves to "Customer Responded" once every open request is answered.
    const stillOpen = await prisma.dakInfoRequest.count({ where: { caseId: item.id, status: "open" } });
    const event = {
      event: "Customer responded to information request",
      note: "Test response",
      actorType: "customer",
      actorName: item.customer.name,
    };
    const moved =
      stillOpen === 0 &&
      (
        await prisma.dakCase.updateMany({
          where: { id: item.id, status: "Information Required" },
          data: { status: "Customer Responded" },
        })
      ).count === 1;
    await prisma.dakEvent.create({
      data: {
        caseId: item.id,
        ...event,
        fromStatus: moved ? "Information Required" : null,
        toStatus: moved ? "Customer Responded" : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DakTransitionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DAK PORTAL TEST RESPONSE ERROR:", error);
    return NextResponse.json({ error: "Could not record the response" }, { status: 500 });
  }
}
