import type { Prisma } from "@prisma/client";

import { getDefaultCommissionRates } from "../commission";
import { partnerCategoryOf, type PartnerCategory } from "../partnerCategory";
import { prisma } from "../prisma";

/**
 * Everything a Sales Leader (role team_admin) may see:
 * - their own direct customers: source "agent", partnerId = the Sales Leader's
 *   user id (they earn commission on these),
 * - the partners they onboarded (User.teamAdminId; any category) and those
 *   partners' customers: agents by user id (source "agent"), referral and
 *   institutional partners by partner code (source "partner"),
 * - Mawista records of their agents (MawsitaRecord.agentId).
 */

const SUBMITTED = { status: { notIn: ["incomplete", "client_profile"] } };

export type TeamScope = {
  teamAdminId: string;
  agentIds: string[];
  partnerCodes: string[];
};

export async function getTeamScope(teamAdminId: string): Promise<TeamScope> {
  const members = await prisma.user.findMany({
    where: { teamAdminId, role: { in: ["agent", "partner"] } },
    select: { id: true, role: true, partnerId: true },
  });
  return {
    teamAdminId,
    agentIds: members.filter((user) => user.role === "agent").map((user) => user.id),
    partnerCodes: members
      .filter((user) => user.role === "partner" && user.partnerId)
      .map((user) => user.partnerId as string),
  };
}

/** Customers the Sales Leader brought in themselves. */
export const directCustomersWhere = (teamAdminId: string): Prisma.ApplicationWhereInput => ({
  source: "agent",
  partnerId: teamAdminId,
});

/** Customers of the partners in the team. Matches nothing when the team is empty. */
export function partnerCustomersWhere(scope: TeamScope): Prisma.ApplicationWhereInput {
  const or: Prisma.ApplicationWhereInput[] = [];
  if (scope.agentIds.length) or.push({ source: "agent", partnerId: { in: scope.agentIds } });
  if (scope.partnerCodes.length) or.push({ source: "partner", partnerId: { in: scope.partnerCodes } });
  return or.length ? { OR: or } : { id: { in: [] } };
}

/** Direct customers and the partners' customers together. */
export const allTeamCustomersWhere = (scope: TeamScope): Prisma.ApplicationWhereInput => ({
  OR: [directCustomersWhere(scope.teamAdminId), partnerCustomersWhere(scope)],
});

/** Same filters for TK / DAK rows (InsuranceApplication uses the same source/partnerId). */
function insuranceWhere(scope: TeamScope): Prisma.InsuranceApplicationWhereInput {
  return {
    OR: [
      { source: "agent", partnerId: { in: [scope.teamAdminId, ...scope.agentIds] } },
      ...(scope.partnerCodes.length ? [{ source: "partner", partnerId: { in: scope.partnerCodes } }] : []),
    ],
  };
}

type CommissionTotals = { total: number; pending: number; approved: number; paid: number };

const emptyTotals = (): CommissionTotals => ({ total: 0, pending: 0, approved: 0, paid: 0 });

function addCommission(totals: CommissionTotals, status: string, amount: number) {
  totals.total += amount;
  if (status === "Pending") totals.pending += amount;
  if (status === "Approved") totals.approved += amount;
  if (status === "Paid") totals.paid += amount;
}

export async function getTeamMembers(teamAdminId: string) {
  const [members, defaults] = await Promise.all([
    prisma.user.findMany({
      where: { teamAdminId, role: { in: ["agent", "partner"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        partnerId: true,
        partnerCategory: true,
        firstName: true,
        lastName: true,
        email: true,
        companyName: true,
        commissionRate: true,
        createdAt: true,
      },
    }),
    getDefaultCommissionRates(),
  ]);

  const scope: TeamScope = {
    teamAdminId,
    agentIds: members.filter((user) => user.role === "agent").map((user) => user.id),
    partnerCodes: members.filter((user) => user.role === "partner" && user.partnerId).map((user) => user.partnerId as string),
  };
  const hasMembers = scope.agentIds.length + scope.partnerCodes.length > 0;
  const where = partnerCustomersWhere(scope);

  const [apps, pending, clients] = hasMembers
    ? await Promise.all([
        prisma.application.groupBy({
          by: ["source", "partnerId", "commissionStatus"],
          where: { AND: [where, SUBMITTED] },
          _count: { _all: true },
          _sum: { commission: true },
        }),
        prisma.application.groupBy({
          by: ["source", "partnerId"],
          where: { AND: [where, { commissionStatus: "Pending" }] },
          _count: { _all: true },
        }),
        prisma.application.groupBy({
          by: ["source", "partnerId"],
          where: { AND: [where, { status: "client_profile" }] },
          _count: { _all: true },
        }),
      ])
    : [[], [], []];

  return {
    defaults,
    scope,
    members: members.map((user) => {
      const kind: "agent" | "partner" = user.role === "agent" ? "agent" : "partner";
      const key = kind === "agent" ? user.id : user.partnerId;
      const mine = (row: { source: string | null; partnerId: string | null }) => row.source === kind && row.partnerId === key;
      const rows = apps.filter(mine);
      const commission = emptyTotals();
      rows.forEach((row) => addCommission(commission, row.commissionStatus, row._sum.commission ?? 0));
      const category: PartnerCategory = partnerCategoryOf(user);
      return {
        id: user.id,
        kind,
        category,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email,
        email: user.email,
        companyName: user.companyName,
        partnerCode: user.partnerId,
        joinedAt: user.createdAt.toISOString(),
        customRate: user.commissionRate,
        rate: user.commissionRate ?? defaults[kind],
        applications: rows.reduce((total, row) => total + row._count._all, 0),
        clients: clients.filter(mine).reduce((total, row) => total + row._count._all, 0),
        pendingCount: pending.filter(mine).reduce((total, row) => total + row._count._all, 0),
        commission,
      };
    }),
  };
}

export type TeamMemberRow = Awaited<ReturnType<typeof getTeamMembers>>["members"][number];

/** The Sales Leader's own customers and commission. */
export async function getDirectSummary(teamAdminId: string, ownRate: number | null, defaultRate: number) {
  const rows = await prisma.application.groupBy({
    by: ["commissionStatus"],
    where: { AND: [directCustomersWhere(teamAdminId), SUBMITTED] },
    _count: { _all: true },
    _sum: { commission: true },
  });
  const commission = emptyTotals();
  rows.forEach((row) => addCommission(commission, row.commissionStatus, row._sum.commission ?? 0));
  return {
    applications: rows.reduce((total, row) => total + row._count._all, 0),
    commission,
    rate: ownRate ?? defaultRate,
    customRate: ownRate,
  };
}

/**
 * Metrics for the Sales Leader dashboard. Runs in two small rounds of
 * queries, as the database pool only allows a few connections at once.
 */
export async function getTeamDashboard(teamAdminId: string, ownRate: number | null) {
  const { members, scope, defaults } = await getTeamMembers(teamAdminId);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5, 1);
  sixMonthsAgo.setUTCHours(0, 0, 0, 0);

  const [direct, publicApps, privateCount, mawista, recent, activity] = await Promise.all([
    getDirectSummary(teamAdminId, ownRate, defaults.agent),
    prisma.insuranceApplication.groupBy({
      by: ["provider"],
      where: insuranceWhere(scope),
      _count: { _all: true },
    }),
    prisma.application.count({
      where: {
        AND: [allTeamCustomersWhere(scope), SUBMITTED, { OR: [{ product: null }, { product: { not: "Public Health Insurance" } }] }],
      },
    }),
    scope.agentIds.length ? prisma.mawsitaRecord.count({ where: { agentId: { in: scope.agentIds } } }) : 0,
    prisma.application.findMany({
      where: { AND: [allTeamCustomersWhere(scope), SUBMITTED, { createdAt: { gte: sixMonthsAgo } }] },
      select: { createdAt: true },
    }),
    getTeamActivity(scope, 10),
  ]);

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

  const total = (pick: (member: TeamMemberRow) => number) => members.reduce((sum, member) => sum + pick(member), 0);

  return {
    direct,
    activity,
    members,
    totals: {
      partners: members.length,
      activePartners: members.filter((member) => member.applications > 0).length,
      applications: total((member) => member.applications),
      clients: total((member) => member.clients),
      commission: {
        total: total((member) => member.commission.total),
        pending: total((member) => member.commission.pending),
        approved: total((member) => member.commission.approved),
        paid: total((member) => member.commission.paid),
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

/** Latest status changes and submissions of the team's customers. */
export async function getTeamActivity(scope: TeamScope, take = 15) {
  const rows = await prisma.application.findMany({
    where: { AND: [allTeamCustomersWhere(scope), SUBMITTED] },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, firstName: true, lastName: true, product: true, status: true, source: true, partnerId: true, createdAt: true },
  });
  return rows.map((row) => ({
    id: row.id,
    customer: [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || "Customer",
    product: row.product || "Private Health Insurance",
    status: row.status,
    direct: row.source === "agent" && row.partnerId === scope.teamAdminId,
    createdAt: row.createdAt.toISOString(),
  }));
}

/** Mawista policies of this team's agents, full details. */
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
