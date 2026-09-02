import { prisma } from "./prisma";

type PartnerSummaryRow = {
  pendingCount: unknown;
  approvedCount: unknown;
  pendingCommission: unknown;
  approvedCommission: unknown;
  todayClicks: unknown;
  monthClicks: unknown;
  todayApprovedCommission: unknown;
  monthApprovedCommission: unknown;
};

type AgentSummaryRow = {
  clientCount: unknown;
  applicationCount: unknown;
  totalCommission: unknown;
  pendingCount: unknown;
  approvedCount: unknown;
  pendingCommission: unknown;
  approvedCommission: unknown;
  todayApps: unknown;
  monthApps: unknown;
  todayApprovedCommission: unknown;
  monthApprovedCommission: unknown;
};

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

export async function getPartnerDashboardSummary(partnerId: string) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const rows = await prisma.$queryRaw<PartnerSummaryRow[]>`
    SELECT
      COUNT(*) FILTER (WHERE "commissionStatus" = 'Pending') AS "pendingCount",
      COUNT(*) FILTER (WHERE "commissionStatus" = 'Approved') AS "approvedCount",
      COALESCE(SUM("commission") FILTER (WHERE "commissionStatus" = 'Pending'), 0) AS "pendingCommission",
      COALESCE(SUM("commission") FILTER (WHERE "commissionStatus" = 'Approved'), 0) AS "approvedCommission",
      COUNT(*) FILTER (WHERE "createdAt" >= ${todayStart} AND "createdAt" < ${tomorrowStart}) AS "todayClicks",
      COUNT(*) FILTER (WHERE "createdAt" >= ${monthStart} AND "createdAt" < ${nextMonthStart}) AS "monthClicks",
      COALESCE(
        SUM("commission") FILTER (
          WHERE "commissionStatus" = 'Approved'
            AND "createdAt" >= ${todayStart}
            AND "createdAt" < ${tomorrowStart}
        ),
        0
      ) AS "todayApprovedCommission",
      COALESCE(
        SUM("commission") FILTER (
          WHERE "commissionStatus" = 'Approved'
            AND "createdAt" >= ${monthStart}
            AND "createdAt" < ${nextMonthStart}
        ),
        0
      ) AS "monthApprovedCommission"
    FROM "Application"
    WHERE "partnerId" = ${partnerId}
      AND "source" = 'partner'
      AND "status" <> 'incomplete'
  `;

  const row = rows[0];

  return {
    pendingCount: toNumber(row?.pendingCount),
    approvedCount: toNumber(row?.approvedCount),
    pendingCommission: toNumber(row?.pendingCommission),
    approvedCommission: toNumber(row?.approvedCommission),
    todayClicks: toNumber(row?.todayClicks),
    monthClicks: toNumber(row?.monthClicks),
    todayApprovedCommission: toNumber(row?.todayApprovedCommission),
    monthApprovedCommission: toNumber(row?.monthApprovedCommission),
  };
}

export async function getAgentDashboardSummary(agentId: string) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const rows = await prisma.$queryRaw<AgentSummaryRow[]>`
    SELECT
      COUNT(*) FILTER (WHERE "status" = 'client_profile') AS "clientCount",
      COUNT(*) FILTER (WHERE "status" <> 'client_profile') AS "applicationCount",
      COALESCE(SUM("commission") FILTER (WHERE "status" <> 'client_profile'), 0) AS "totalCommission",
      COUNT(*) FILTER (
        WHERE "status" <> 'client_profile'
          AND "commissionStatus" = 'Pending'
      ) AS "pendingCount",
      COUNT(*) FILTER (
        WHERE "status" <> 'client_profile'
          AND "commissionStatus" = 'Approved'
      ) AS "approvedCount",
      COALESCE(
        SUM("commission") FILTER (
          WHERE "status" <> 'client_profile'
            AND "commissionStatus" = 'Pending'
        ),
        0
      ) AS "pendingCommission",
      COALESCE(
        SUM("commission") FILTER (
          WHERE "status" <> 'client_profile'
            AND "commissionStatus" = 'Approved'
        ),
        0
      ) AS "approvedCommission",
      COUNT(*) FILTER (
        WHERE "status" <> 'client_profile'
          AND "createdAt" >= ${todayStart}
      ) AS "todayApps",
      COUNT(*) FILTER (
        WHERE "status" <> 'client_profile'
          AND "createdAt" >= ${monthStart}
      ) AS "monthApps",
      COALESCE(
        SUM("commission") FILTER (
          WHERE "status" <> 'client_profile'
            AND "commissionStatus" = 'Approved'
            AND "createdAt" >= ${todayStart}
        ),
        0
      ) AS "todayApprovedCommission",
      COALESCE(
        SUM("commission") FILTER (
          WHERE "status" <> 'client_profile'
            AND "commissionStatus" = 'Approved'
            AND "createdAt" >= ${monthStart}
        ),
        0
      ) AS "monthApprovedCommission"
    FROM "Application"
    WHERE "source" = 'agent'
      AND "partnerId" = ${agentId}
  `;

  const row = rows[0];

  return {
    clientCount: toNumber(row?.clientCount),
    applicationCount: toNumber(row?.applicationCount),
    totalCommission: toNumber(row?.totalCommission),
    pendingCount: toNumber(row?.pendingCount),
    approvedCount: toNumber(row?.approvedCount),
    pendingCommission: toNumber(row?.pendingCommission),
    approvedCommission: toNumber(row?.approvedCommission),
    todayApps: toNumber(row?.todayApps),
    monthApps: toNumber(row?.monthApps),
    todayApprovedCommission: toNumber(row?.todayApprovedCommission),
    monthApprovedCommission: toNumber(row?.monthApprovedCommission),
  };
}
