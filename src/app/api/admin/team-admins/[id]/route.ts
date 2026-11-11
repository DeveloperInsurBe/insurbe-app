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
 * Superadmin: { action: "set_limit", commissionLimit } | "reset_password" |
 * "new_invite" | "disable" | "enable" for one team admin.
 */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user || (user.role !== TEAM_ADMIN_ROLE && user.role !== TEAM_ADMIN_DISABLED_ROLE)) {
    return NextResponse.json({ error: "Team admin not found" }, { status: 404 });
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
    // The old link stops working; agents who already joined stay in the team.
    const inviteCode = generateInviteCode();
    await prisma.user.update({ where: { id }, data: { inviteCode } });
    return NextResponse.json({ inviteCode });
  }

  if (action === "disable" || action === "enable") {
    // Access is re-checked on every request, so this applies at once. Their
    // invite link stops working while disabled (see the agent signup).
    await prisma.user.update({
      where: { id },
      data: { role: action === "disable" ? TEAM_ADMIN_DISABLED_ROLE : TEAM_ADMIN_ROLE },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
