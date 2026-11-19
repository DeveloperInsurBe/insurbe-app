import { getDefaultCommissionRate } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import { teamAdminName, TEAM_ADMIN_DISABLED_ROLE, TEAM_ADMIN_ROLE } from "@/lib/team/access";
import TeamAdminsClient, { type TeamAdminRow } from "./TeamAdminsClient";

export const dynamic = "force-dynamic";

const SUBMITTED = { status: { notIn: ["incomplete", "client_profile"] } };

/** Super Admin: Sales Leaders (role team_admin), their limits, own rate and numbers. */
export default async function AdminTeamAdminsPage() {
  const [users, defaultOwnRate] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [TEAM_ADMIN_ROLE, TEAM_ADMIN_DISABLED_ROLE] } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        commissionLimit: true,
        commissionRate: true,
        inviteCode: true,
        createdAt: true,
      },
    }),
    getDefaultCommissionRate("agent"),
  ]);
  const leaderIds = users.map((user) => user.id);

  const members = leaderIds.length
    ? await prisma.user.findMany({
        where: { role: { in: ["agent", "partner"] }, teamAdminId: { in: leaderIds } },
        select: { id: true, role: true, partnerId: true, teamAdminId: true },
      })
    : [];
  const agentIds = members.filter((user) => user.role === "agent").map((user) => user.id);
  const partnerCodes = members.filter((user) => user.role === "partner" && user.partnerId).map((user) => user.partnerId as string);

  // Agent-style rows cover agents and the Sales Leaders' own direct customers.
  const [agentLike, partnerRows] = await Promise.all([
    leaderIds.length || agentIds.length
      ? prisma.application.groupBy({
          by: ["partnerId"],
          where: { source: "agent", partnerId: { in: [...leaderIds, ...agentIds] }, ...SUBMITTED },
          _count: { _all: true },
          _sum: { commission: true },
        })
      : [],
    partnerCodes.length
      ? prisma.application.groupBy({
          by: ["partnerId"],
          where: { source: "partner", partnerId: { in: partnerCodes }, ...SUBMITTED },
          _count: { _all: true },
          _sum: { commission: true },
        })
      : [],
  ]);

  type Stat = { _count: { _all: number }; _sum: { commission: number | null } };
  const add = (stats: Stat[]) => ({
    applications: stats.reduce((sum, row) => sum + row._count._all, 0),
    commission: stats.reduce((sum, row) => sum + (row._sum.commission ?? 0), 0),
  });

  const rows: TeamAdminRow[] = users.map((user) => {
    const team = members.filter((member) => member.teamAdminId === user.id);
    const teamAgentIds = team.filter((member) => member.role === "agent").map((member) => member.id);
    const teamCodes = team.filter((member) => member.role === "partner").map((member) => member.partnerId);
    const partnersStats = add([
      ...agentLike.filter((row) => row.partnerId && teamAgentIds.includes(row.partnerId)),
      ...partnerRows.filter((row) => row.partnerId && teamCodes.includes(row.partnerId)),
    ]);
    const directStats = add(agentLike.filter((row) => row.partnerId === user.id));
    return {
      id: user.id,
      name: teamAdminName(user),
      email: user.email,
      active: user.role === TEAM_ADMIN_ROLE,
      commissionLimit: user.commissionLimit ?? 0,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt.toISOString(),
      ownRate: user.commissionRate,
      defaultOwnRate,
      partners: team.length,
      applications: partnersStats.applications,
      commission: partnersStats.commission,
      directApplications: directStats.applications,
      directCommission: directStats.commission,
    };
  });

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Sales Leaders</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Sales Leaders onboard partners and bring in their own customers. They only see their own customers, their partners and
          those partners&apos; customers, and earn commission on their direct customers only.
        </p>
      </div>
      <TeamAdminsClient rows={rows} />
    </div>
  );
}
