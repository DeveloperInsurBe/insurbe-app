import type { Prisma } from "@prisma/client";

import { getDefaultCommissionRate } from "../commission";
import { prisma } from "../prisma";

/**
 * Everything a team admin may see, always limited to the agents they
 * onboarded (User.teamAdminId) and the customers those agents brought in.
 * Application.partnerId / InsuranceApplication.partnerId hold the agent's
 * user id when source = "agent"; Mawista records use agentId.
 */

const SUBMITTED = { status: { notIn: ["incomplete", "client_profile"] } };

export async function getTeamAgentIds(teamAdminId: string) {
  const agents = await prisma.user.findMany({
    where: { role: "agent", teamAdminId },
    select: { id: true },
  });
  return agents.map((agent) => agent.id);
}

/** Commission rows (Application) of this team's customers. */
export const teamApplicationWhere = (agentIds: string[]): Prisma.ApplicationWhereInput => ({
  source: "agent",
  partnerId: { in: agentIds },
});

export async function getTeamAgents(teamAdminId: string) {
  const [agents, defaultRate] = await Promise.all([
    prisma.user.findMany({
      where: { role: "agent", teamAdminId },
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, email: true, companyName: true, commissionRate: true, createdAt: true },
    }),
    getDefaultCommissionRate("agent"),
  ]);
  const ids = agents.map((agent) => agent.id);

  const [apps, pending, clients] = ids.length
    ? await Promise.all([
        prisma.application.groupBy({
          by: ["partnerId", "commissionStatus"],
          where: { ...teamApplicationWhere(ids), ...SUBMITTED },
          _count: { _all: true },
          _sum: { commission: true },
        }),
        prisma.application.groupBy({
          by: ["partnerId"],
          where: { ...teamApplicationWhere(ids), commissionStatus: "Pending" },
          _count: { _all: true },
        }),
        prisma.application.groupBy({
          by: ["partnerId"],
          where: { ...teamApplicationWhere(ids), status: "client_profile" },
          _count: { _all: true },
        }),
      ])
    : [[], [], []];

  return {
    defaultRate,
    agents: agents.map((agent) => {
      const rows = apps.filter((row) => row.partnerId === agent.id);
      const sum = (status?: string) =>
        rows.filter((row) => !status || row.commissionStatus === status).reduce((total, row) => total + (row._sum.commission ?? 0), 0);
      return {
        id: agent.id,
        name: [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() || agent.email,
        email: agent.email,
        companyName: agent.companyName,
        joinedAt: agent.createdAt.toISOString(),
        customRate: agent.commissionRate,
        rate: agent.commissionRate ?? defaultRate,
        applications: rows.reduce((total, row) => total + row._count._all, 0),
        clients: clients.find((row) => row.partnerId === agent.id)?._count._all ?? 0,
        pendingCount: pending.find((row) => row.partnerId === agent.id)?._count._all ?? 0,
        commission: { total: sum(), pending: sum("Pending"), approved: sum("Approved"), paid: sum("Paid") },
      };
    }),
  };
}

export type TeamAgentRow = Awaited<ReturnType<typeof getTeamAgents>>["agents"][number];

/** Metrics for the team dashboard. */
export async function getTeamDashboard(teamAdminId: string) {
  const { agents, defaultRate } = await getTeamAgents(teamAdminId);
  const ids = agents.map((agent) => agent.id);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5, 1);
  sixMonthsAgo.setUTCHours(0, 0, 0, 0);

  const [publicApps, privateCount, mawista, recent] = ids.length
    ? await Promise.all([
        prisma.insuranceApplication.groupBy({
          by: ["provider"],
          where: { source: "agent", partnerId: { in: ids } },
          _count: { _all: true },
        }),
        prisma.application.count({
          where: {
            ...teamApplicationWhere(ids),
            ...SUBMITTED,
            OR: [{ product: null }, { product: { not: "Public Health Insurance" } }],
          },
        }),
        prisma.mawsitaRecord.count({ where: { agentId: { in: ids } } }),
        prisma.application.findMany({
          where: { ...teamApplicationWhere(ids), ...SUBMITTED, createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true },
        }),
      ])
    : [[], 0, 0, []];

  // Applications per month, last six months (oldest first).
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(sixMonthsAgo);
    date.setUTCMonth(sixMonthsAgo.getUTCMonth() + index);
    return { key: date.toISOString().slice(0, 7), label: date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }), count: 0 };
  });
  recent.forEach((row) => {
    const month = months.find((item) => item.key === row.createdAt.toISOString().slice(0, 7));
    if (month) month.count += 1;
  });

  const total = (pick: (agent: TeamAgentRow) => number) => agents.reduce((sum, agent) => sum + pick(agent), 0);

  return {
    defaultRate,
    agents,
    totals: {
      agents: agents.length,
      activeAgents: agents.filter((agent) => agent.applications > 0).length,
      applications: total((agent) => agent.applications),
      clients: total((agent) => agent.clients),
      commission: {
        total: total((agent) => agent.commission.total),
        pending: total((agent) => agent.commission.pending),
        approved: total((agent) => agent.commission.approved),
        paid: total((agent) => agent.commission.paid),
      },
    },
    products: {
      private: privateCount,
      TK: publicApps.find((row) => row.provider === "TK")?._count._all ?? 0,
      DAK: publicApps.find((row) => row.provider === "DAK")?._count._all ?? 0,
      Mawista: mawista,
    },
    months,
  };
}

/** Mawista policies of this team's customers, full details. */
export async function getTeamMawistaRecords(agentIds: string[]) {
  if (!agentIds.length) return [];
  return prisma.mawsitaRecord.findMany({
    where: { agentId: { in: agentIds } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      agentId: true,
      customerName: true,
      email: true,
      phone: true,
      planName: true,
      planType: true,
      startDate: true,
      endDate: true,
      premiumAmount: true,
      status: true,
      createdAt: true,
    },
  });
}
