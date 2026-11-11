import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import { TEAM_ADMIN_DISABLED_ROLE, TEAM_ADMIN_ROLE } from "@/lib/team/access";

/**
 * Superadmin: moves an agent (and with it their customers) to a team admin,
 * or back to the superadmin with { teamAdminId: null }.
 */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const teamAdminId = typeof body?.teamAdminId === "string" && body.teamAdminId ? body.teamAdminId : null;

  const agent = await prisma.user.findFirst({ where: { id, role: "agent" }, select: { id: true } });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  if (teamAdminId) {
    const teamAdmin = await prisma.user.findFirst({
      where: { id: teamAdminId, role: { in: [TEAM_ADMIN_ROLE, TEAM_ADMIN_DISABLED_ROLE] } },
      select: { id: true },
    });
    if (!teamAdmin) return NextResponse.json({ error: "Team admin not found" }, { status: 404 });
  }

  await prisma.user.update({ where: { id }, data: { teamAdminId } });
  return NextResponse.json({ ok: true, teamAdminId });
}
