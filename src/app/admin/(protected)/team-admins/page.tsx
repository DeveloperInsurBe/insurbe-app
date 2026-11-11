import { prisma } from "@/lib/prisma";
import { teamAdminName, TEAM_ADMIN_DISABLED_ROLE, TEAM_ADMIN_ROLE } from "@/lib/team/access";
import TeamAdminsClient, { type TeamAdminRow } from "./TeamAdminsClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamAdminsPage() {
  const users = await prisma.user.findMany({
    where: { role: { in: [TEAM_ADMIN_ROLE, TEAM_ADMIN_DISABLED_ROLE] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, commissionLimit: true, inviteCode: true, createdAt: true },
  });

  const agents = users.length
    ? await prisma.user.findMany({
        where: { role: "agent", teamAdminId: { in: users.map((user) => user.id) } },
        select: { id: true, teamAdminId: true },
      })
    : [];
  const applications = agents.length
    ? await prisma.application.groupBy({
        by: ["partnerId"],
        where: {
          source: "agent",
          partnerId: { in: agents.map((agent) => agent.id) },
          status: { notIn: ["incomplete", "client_profile"] },
        },
        _count: { _all: true },
        _sum: { commission: true },
      })
    : [];

  const rows: TeamAdminRow[] = users.map((user) => {
    const ids = agents.filter((agent) => agent.teamAdminId === user.id).map((agent) => agent.id);
    const stats = applications.filter((row) => row.partnerId && ids.includes(row.partnerId));
    return {
      id: user.id,
      name: teamAdminName(user),
      email: user.email,
      active: user.role === TEAM_ADMIN_ROLE,
      commissionLimit: user.commissionLimit ?? 0,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt.toISOString(),
      agents: ids.length,
      applications: stats.reduce((sum, row) => sum + row._count._all, 0),
      commission: stats.reduce((sum, row) => sum + (row._sum.commission ?? 0), 0),
    };
  });

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Team admins</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Restricted admins who only see the agents they onboarded and those agents&apos; customers.
        </p>
      </div>
      <TeamAdminsClient rows={rows} />
    </div>
  );
}
