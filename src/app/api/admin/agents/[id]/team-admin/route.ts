import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import { TEAM_ADMIN_DISABLED_ROLE, TEAM_ADMIN_ROLE } from "@/lib/team/access";

/**
 * Super Admin: moves a partner of any category (and with them their
 * customers) into a Sales Leader's team, or back to the Super Admin with
 * { teamAdminId: null }.
 */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const teamAdminId = typeof body?.teamAdminId === "string" && body.teamAdminId ? body.teamAdminId : null;

  const member = await prisma.user.findFirst({ where: { id, role: { in: ["agent", "partner"] } }, select: { id: true } });
  if (!member) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  if (teamAdminId) {
    const teamAdmin = await prisma.user.findFirst({
      where: { id: teamAdminId, role: { in: [TEAM_ADMIN_ROLE, TEAM_ADMIN_DISABLED_ROLE] } },
      select: { id: true },
    });
    if (!teamAdmin) return NextResponse.json({ error: "Sales Leader not found" }, { status: 404 });
  }

  await prisma.user.update({ where: { id }, data: { teamAdminId } });
  return NextResponse.json({ ok: true, teamAdminId });
}
