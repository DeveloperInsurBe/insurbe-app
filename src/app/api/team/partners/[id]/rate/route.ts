import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireTeamAdmin } from "@/lib/team/access";

/**
 * Sales Leader: sets the commission rate (EUR per application) of one of
 * their own partners (any category), up to the limit the Super Admin gave
 * them. applyToPending also re-prices that partner's "Pending" commissions;
 * Approved / Paid never change.
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

  // Only partners of this Sales Leader.
  const member = await prisma.user.findFirst({
    where: { id, role: { in: ["agent", "partner"] }, teamAdminId: teamAdmin.id },
    select: { id: true, role: true, partnerId: true, commissionRate: true },
  });
  if (!member) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  // Agents' customers are linked by user id, other partners' by partner code.
  const source = member.role === "agent" ? "agent" : "partner";
  const referrerKey = source === "agent" ? member.id : member.partnerId;

  try {
    // One batch (not an interactive transaction: the shared pooler can be slow).
    const setRate = prisma.user.update({ where: { id: member.id }, data: { commissionRate: rate } });
    let pendingUpdated = 0;
    if (applyToPending && referrerKey) {
      const [, repriced] = await prisma.$transaction([
        setRate,
        prisma.application.updateMany({
          where: { source, partnerId: referrerKey, commissionStatus: "Pending" },
          data: { commission: rate },
        }),
      ]);
      pendingUpdated = repriced.count;
    } else {
      await setRate;
    }

    await prisma.commissionRateChange.create({
      data: {
        role: source,
        userId: member.id,
        oldRate: member.commissionRate,
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
