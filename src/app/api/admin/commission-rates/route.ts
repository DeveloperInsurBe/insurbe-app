import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import {
  getDefaultCommissionRate,
  isCommissionRole,
  isValidCommissionRate,
  MAX_COMMISSION_RATE,
} from "@/lib/commission";
import { prisma } from "@/lib/prisma";

/**
 * PATCH { role, userId, rate: number | null, applyToPending }
 *   -> custom rate for one partner/agent (null = back to the default)
 * PATCH { role, rate: number, applyToPending }
 *   -> default rate for every partner/agent without a custom rate
 *
 * applyToPending also re-prices that referrer's "Pending" commissions.
 * Approved / Paid / Rejected commissions are never changed.
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const role = body?.role;
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const rate = body?.rate ?? null;
  const applyToPending = body?.applyToPending === true;

  if (!isCommissionRole(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (rate !== null && !isValidCommissionRate(rate)) {
    return NextResponse.json(
      { error: `Rate must be a whole number between 0 and ${MAX_COMMISSION_RATE}` },
      { status: 400 },
    );
  }

  const changedBy = session.user.email;

  try {
    /**
     * ONE PARTNER / AGENT
     */
    if (userId) {
      const user = await prisma.user.findFirst({
        where: { id: userId, role },
        select: { id: true, partnerId: true, commissionRate: true },
      });

      if (!user) {
        return NextResponse.json({ error: `${role} not found` }, { status: 404 });
      }

      const effectiveRate = rate ?? (await getDefaultCommissionRate(role));
      const referrerKey = role === "agent" ? user.id : user.partnerId;

      const pendingUpdated = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { commissionRate: rate },
        });

        let updated = 0;

        if (applyToPending && referrerKey) {
          const result = await tx.application.updateMany({
            where: {
              source: role,
              partnerId: referrerKey,
              commissionStatus: "Pending",
            },
            data: { commission: effectiveRate },
          });

          updated = result.count;
        }

        await tx.commissionRateChange.create({
          data: {
            role,
            userId: user.id,
            oldRate: user.commissionRate,
            newRate: rate,
            pendingUpdated: updated,
            changedBy,
          },
        });

        return updated;
      });

      return NextResponse.json({ success: true, effectiveRate, pendingUpdated });
    }

    /**
     * ROLE DEFAULT
     */
    if (rate === null) {
      return NextResponse.json({ error: "Default rate is required" }, { status: 400 });
    }

    const oldRate = await getDefaultCommissionRate(role);

    const pendingUpdated = await prisma.$transaction(async (tx) => {
      await tx.commissionDefault.upsert({
        where: { role },
        create: { role, rate, updatedBy: changedBy },
        update: { rate, updatedBy: changedBy },
      });

      let updated = 0;

      if (applyToPending) {
        const onDefault = await tx.user.findMany({
          where: { role, commissionRate: null },
          select: { id: true, partnerId: true },
        });

        const referrerKeys = onDefault
          .map((user) => (role === "agent" ? user.id : user.partnerId))
          .filter((key): key is string => !!key);

        if (referrerKeys.length) {
          const result = await tx.application.updateMany({
            where: {
              source: role,
              partnerId: { in: referrerKeys },
              commissionStatus: "Pending",
            },
            data: { commission: rate },
          });

          updated = result.count;
        }
      }

      await tx.commissionRateChange.create({
        data: {
          role,
          userId: null,
          oldRate,
          newRate: rate,
          pendingUpdated: updated,
          changedBy,
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, effectiveRate: rate, pendingUpdated });
  } catch (error) {
    console.error("COMMISSION RATE UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update commission rate" },
      { status: 500 },
    );
  }
}
