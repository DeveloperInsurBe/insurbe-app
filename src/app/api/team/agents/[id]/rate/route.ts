import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireTeamAdmin } from "@/lib/team/access";

/**
 * Team admin: sets the commission rate (EUR per application) of one of their
 * own agents, up to the limit the superadmin gave them. applyToPending also
 * re-prices that agent's "Pending" commissions; Approved / Paid never change.
 */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { teamAdmin, response } = await requireTeamAdmin();
  if (response) return response;

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const rate = body?.rate;
  const applyToPending = body?.applyToPending === true;

  if (typeof rate !== "number" || !Number.isInteger(rate) || rate < 0 || rate > teamAdmin.commissionLimit) {
    return NextResponse.json(
      { error: `The rate must be a whole number between 0 and your limit of €${teamAdmin.commissionLimit}.` },
      { status: 400 },
    );
  }

  // Only agents of this team admin.
  const agent = await prisma.user.findFirst({
    where: { id, role: "agent", teamAdminId: teamAdmin.id },
    select: { id: true, commissionRate: true },
  });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  try {
    // One batch (not an interactive transaction: the shared pooler can be slow).
    const setRate = prisma.user.update({ where: { id: agent.id }, data: { commissionRate: rate } });
    let pendingUpdated = 0;
    if (applyToPending) {
      const [, repriced] = await prisma.$transaction([
        setRate,
        prisma.application.updateMany({
          where: { source: "agent", partnerId: agent.id, commissionStatus: "Pending" },
          data: { commission: rate },
        }),
      ]);
      pendingUpdated = repriced.count;
    } else {
      await setRate;
    }

    await prisma.commissionRateChange.create({
      data: {
        role: "agent",
        userId: agent.id,
        oldRate: agent.commissionRate,
        newRate: rate,
        pendingUpdated,
        changedBy: teamAdmin.email,
      },
    });

    return NextResponse.json({ ok: true, rate, pendingUpdated });
  } catch (error) {
    console.error("TEAM COMMISSION RATE ERROR:", error);
    return NextResponse.json({ error: "Could not update the rate" }, { status: 500 });
  }
}
