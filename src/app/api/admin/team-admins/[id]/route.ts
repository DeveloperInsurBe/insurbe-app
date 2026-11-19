import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { isValidCommissionRate, MAX_COMMISSION_RATE } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import {
  generateInviteCode,
  generateTeamAdminPassword,
  TEAM_ADMIN_DISABLED_ROLE,
  TEAM_ADMIN_ROLE,
} from "@/lib/team/access";

/**
 * Super Admin: { action: "set_limit", commissionLimit } |
 * { action: "set_rate", commissionRate } (own rate per direct customer, null = default) |
 * "reset_password" | "new_invite" | "disable" | "enable" for one Sales Leader.
 */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user || (user.role !== TEAM_ADMIN_ROLE && user.role !== TEAM_ADMIN_DISABLED_ROLE)) {
    return NextResponse.json({ error: "Sales Leader not found" }, { status: 404 });
  }

  if (action === "set_rate") {
    const raw = body?.commissionRate;
    const commissionRate = raw === null ? null : Number(raw);
    if (commissionRate !== null && !isValidCommissionRate(commissionRate)) {
      return NextResponse.json(
        { error: `The rate must be a whole number between 0 and ${MAX_COMMISSION_RATE}.` },
        { status: 400 },
      );
    }
    const before = await prisma.user.findUnique({ where: { id }, select: { commissionRate: true } });
    await prisma.user.update({ where: { id }, data: { commissionRate } });
    await prisma.commissionRateChange.create({
      data: {
        role: "sales_leader",
        userId: id,
        oldRate: before?.commissionRate ?? null,
        newRate: commissionRate,
        changedBy: admin.user?.email ?? "admin",
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "set_limit") {
    const commissionLimit = Number(body?.commissionLimit);
    if (!isValidCommissionRate(commissionLimit)) {
      return NextResponse.json(
        { error: `The commission limit must be a whole number between 0 and ${MAX_COMMISSION_RATE}.` },
        { status: 400 },
      );
    }
    await prisma.user.update({ where: { id }, data: { commissionLimit } });
    return NextResponse.json({ ok: true });
  }

  if (action === "reset_password") {
    const password = generateTeamAdminPassword();
    await prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(password, 10) } });
    return NextResponse.json({ password });
  }

  if (action === "new_invite") {
    // The old link stops working; partners who already joined stay in the team.
    const inviteCode = generateInviteCode();
    await prisma.user.update({ where: { id }, data: { inviteCode } });
    return NextResponse.json({ inviteCode });
  }

  if (action === "disable" || action === "enable") {
    // Access is re-checked on every request, so this applies at once. Their
    // invite and customer links stop working while disabled.
    await prisma.user.update({
      where: { id },
      data: { role: action === "disable" ? TEAM_ADMIN_DISABLED_ROLE : TEAM_ADMIN_ROLE },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
