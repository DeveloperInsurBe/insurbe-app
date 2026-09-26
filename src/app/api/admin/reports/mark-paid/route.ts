import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { EXCLUDED_STATUSES, parseRange } from "@/app/admin/(protected)/reports/report";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * POST { source, referrerKey, from, to }
 * Marks the referrer's Approved commissions created in [from, to] as Paid.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const source = body?.source;
  const referrerKey = typeof body?.referrerKey === "string" ? body.referrerKey : "";

  if ((source !== "partner" && source !== "agent") || !referrerKey) {
    return NextResponse.json({ error: "Invalid referrer" }, { status: 400 });
  }

  if (typeof body?.from !== "string" || typeof body?.to !== "string") {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const range = parseRange({ from: body.from, to: body.to });

  if (range.mode !== "custom") {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const result = await prisma.application.updateMany({
      where: {
        source,
        partnerId: referrerKey,
        commissionStatus: "Approved",
        status: { notIn: EXCLUDED_STATUSES },
        createdAt: { gte: range.gte, lt: range.lt },
      },
      data: { commissionStatus: "Paid" },
    });

    console.info(
      `COMMISSIONS MARKED PAID: ${result.count} for ${source}:${referrerKey} ` +
        `(${range.from}..${range.to}) by ${session.user.email}`,
    );

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error("MARK PAID ERROR:", error);

    return NextResponse.json(
      { error: "Failed to mark commissions as paid" },
      { status: 500 },
    );
  }
}
