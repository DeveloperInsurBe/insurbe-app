import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { periodRange, type Period } from "../partners/publicInsurance";

const PUBLIC_PRODUCT = "Public Health Insurance";
const NOT_APPLICATIONS = ["incomplete", "client_profile"];

type Range = { gte: Date; lt: Date } | null;

/**
 * Same-length window before the current one, for "vs previous" deltas.
 * This month (to date) compares with the same days of last month.
 */
function previousRange(period: Period): Range {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (period === "this-month") {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const elapsed = now.getTime() - Date.UTC(year, month, 1);

    return { gte: start, lt: new Date(start.getTime() + elapsed) };
  }

  if (period === "last-month") {
    return {
      gte: new Date(Date.UTC(year, month - 2, 1)),
      lt: new Date(Date.UTC(year, month - 1, 1)),
    };
  }

  return null;
}

const dateSql = (range: Range) =>
  range
    ? Prisma.sql`AND "createdAt" >= ${range.gte} AND "createdAt" < ${range.lt}`
    : Prisma.empty;

/**
 * Applications = private applications (Application, no drafts) +
 * TK/DAK submissions (InsuranceApplication). TK/DAK also write an
 * Application row, which is skipped to avoid double counting.
 */
async function countApplications(range: Range) {
  const [privateRows, publicRows] = await Promise.all([
    prisma.$queryRaw<{ source: string | null; count: number }[]>`
      SELECT "source", COUNT(*)::int AS "count"
      FROM "Application"
      WHERE "status" NOT IN (${Prisma.join(NOT_APPLICATIONS)})
        AND ("product" IS NULL OR "product" <> ${PUBLIC_PRODUCT})
        ${dateSql(range)}
      GROUP BY "source"
    `,
    prisma.$queryRaw<{ source: string | null; provider: string; count: number }[]>`
      SELECT "source", "provider", COUNT(*)::int AS "count"
      FROM "InsuranceApplication"
      WHERE "provider" IN ('TK', 'DAK')
        ${dateSql(range)}
      GROUP BY "source", "provider"
    `,
  ]);

  const bySource = { direct: 0, partner: 0, agent: 0 };
  const byKind = { TK: 0, DAK: 0, private: 0 };

  const sourceKey = (source: string | null) =>
    source === "partner" || source === "agent" ? source : "direct";

  for (const row of privateRows) {
    bySource[sourceKey(row.source)] += row.count;
    byKind.private += row.count;
  }

  for (const row of publicRows) {
    bySource[sourceKey(row.source)] += row.count;
    byKind[row.provider === "TK" ? "TK" : "DAK"] += row.count;
  }

  return {
    total: byKind.TK + byKind.DAK + byKind.private,
    bySource,
    byKind,
  };
}

export type MonthPoint = {
  month: string;
  label: string;
  TK: number;
  DAK: number;
  private: number;
};

/**
 * Last 12 months (UTC), oldest first.
 */
async function getMonthlyTrend(): Promise<MonthPoint[]> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

  const [privateRows, publicRows] = await Promise.all([
    prisma.$queryRaw<{ month: string; count: number }[]>`
      SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS "month",
             COUNT(*)::int AS "count"
      FROM "Application"
      WHERE "createdAt" >= ${start}
        AND "status" NOT IN (${Prisma.join(NOT_APPLICATIONS)})
        AND ("product" IS NULL OR "product" <> ${PUBLIC_PRODUCT})
      GROUP BY 1
    `,
    prisma.$queryRaw<{ month: string; provider: string; count: number }[]>`
      SELECT to_char(date_trunc('month', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM') AS "month",
             "provider",
             COUNT(*)::int AS "count"
      FROM "InsuranceApplication"
      WHERE "createdAt" >= ${start}
        AND "provider" IN ('TK', 'DAK')
      GROUP BY 1, 2
    `,
  ]);

  const points: MonthPoint[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));

    return {
      month: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
      TK: 0,
      DAK: 0,
      private: 0,
    };
  });

  const byMonth = new Map(points.map((point) => [point.month, point]));

  for (const row of privateRows) {
    const point = byMonth.get(row.month);
    if (point) point.private += row.count;
  }

  for (const row of publicRows) {
    const point = byMonth.get(row.month);
    if (point) point[row.provider === "TK" ? "TK" : "DAK"] += row.count;
  }

  return points;
}

export type RecentItem = {
  id: string;
  name: string;
  kind: "TK" | "DAK" | "private";
  product: string;
  source: "direct" | "partner" | "agent";
  status: string;
  createdAt: string;
};

async function getRecentActivity(limit: number): Promise<RecentItem[]> {
  const [privateApps, publicApps] = await Promise.all([
    prisma.application.findMany({
      where: {
        status: { notIn: NOT_APPLICATIONS },
        OR: [{ product: null }, { product: { not: PUBLIC_PRODUCT } }],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        product: true,
        source: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.insuranceApplication.findMany({
      where: { provider: { in: ["TK", "DAK"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        provider: true,
        source: true,
        status: true,
        createdAt: true,
        payload: true,
      },
    }),
  ]);

  const sourceKey = (source: string | null): RecentItem["source"] =>
    source === "partner" || source === "agent" ? source : "direct";

  const items: RecentItem[] = [
    ...privateApps.map((app) => ({
      id: app.id,
      name: `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim() || "Unnamed",
      kind: "private" as const,
      product: app.product || "Private insurance",
      source: sourceKey(app.source),
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    })),
    ...publicApps.map((app) => {
      const personal =
        (app.payload as { personal?: { firstName?: string; lastName?: string } } | null)
          ?.personal ?? {};
      const kind = app.provider === "TK" ? ("TK" as const) : ("DAK" as const);

      return {
        id: app.id,
        name: `${personal.firstName ?? ""} ${personal.lastName ?? ""}`.trim() || "Unnamed",
        kind,
        product: `${kind} public insurance`,
        source: sourceKey(app.source),
        status: app.status,
        createdAt: (app.createdAt ?? new Date(0)).toISOString(),
      };
    }),
  ];

  return items
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

async function getTopPartners(range: Range, limit: number) {
  const rows = await prisma.$queryRaw<{ partnerId: string; count: number }[]>`
    SELECT "partnerId", SUM("count")::int AS "count" FROM (
      SELECT "partnerId", COUNT(*) AS "count"
      FROM "Application"
      WHERE "source" = 'partner' AND "partnerId" IS NOT NULL
        AND "status" NOT IN (${Prisma.join(NOT_APPLICATIONS)})
        AND ("product" IS NULL OR "product" <> ${PUBLIC_PRODUCT})
        ${dateSql(range)}
      GROUP BY "partnerId"
      UNION ALL
      SELECT "partnerId", COUNT(*) AS "count"
      FROM "InsuranceApplication"
      WHERE "source" = 'partner' AND "partnerId" IS NOT NULL
        AND "provider" IN ('TK', 'DAK')
        ${dateSql(range)}
      GROUP BY "partnerId"
    ) AS combined
    GROUP BY "partnerId"
    ORDER BY 2 DESC
    LIMIT ${limit}
  `;

  const partners = rows.length
    ? await prisma.user.findMany({
        where: { role: "partner", partnerId: { in: rows.map((row) => row.partnerId) } },
        select: { partnerId: true, firstName: true, lastName: true, companyName: true, email: true },
      })
    : [];

  const nameById = new Map(
    partners.map((partner) => [
      partner.partnerId,
      `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim() ||
        partner.companyName ||
        partner.email,
    ]),
  );

  return rows.map((row) => ({
    partnerId: row.partnerId,
    name: nameById.get(row.partnerId) || row.partnerId,
    count: row.count,
  }));
}

async function getCommissionOverview(range: Range) {
  const groups = await prisma.application.groupBy({
    by: ["commissionStatus"],
    where: {
      source: { in: ["partner", "agent"] },
      partnerId: { not: null },
      status: { not: "client_profile" },
      ...(range ? { createdAt: range } : {}),
    },
    _count: { _all: true },
    _sum: { commission: true },
  });

  const totals = { Pending: 0, Approved: 0, Paid: 0, Rejected: 0 };
  const counts = { Pending: 0, Approved: 0, Paid: 0, Rejected: 0 };

  for (const group of groups) {
    const key = group.commissionStatus as keyof typeof totals;
    if (key in totals) {
      totals[key] += group._sum.commission ?? 0;
      counts[key] += group._count._all;
    }
  }

  return { totals, counts };
}

export async function getDashboardData(period: Period) {
  const range = periodRange(period);
  const previous = previousRange(period);

  const [
    current,
    before,
    trend,
    recent,
    topPartners,
    commission,
    commissionAllTime,
    partnerTotal,
    activePartners,
    publicToForward,
  ] = await Promise.all([
    countApplications(range),
    previous ? countApplications(previous) : Promise.resolve(null),
    getMonthlyTrend(),
    getRecentActivity(7),
    getTopPartners(range, 5),
    getCommissionOverview(range),
    getCommissionOverview(null),
    prisma.user.count({ where: { role: "partner" } }),
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT "partnerId")::int AS "count" FROM (
        SELECT "partnerId" FROM "Application"
        WHERE "source" = 'partner' AND "partnerId" IS NOT NULL
          AND "status" NOT IN (${Prisma.join(NOT_APPLICATIONS)})
          ${dateSql(range)}
        UNION ALL
        SELECT "partnerId" FROM "InsuranceApplication"
        WHERE "source" = 'partner' AND "partnerId" IS NOT NULL
          ${dateSql(range)}
      ) AS active
    `,
    prisma.insuranceApplication.count({ where: { status: "PENDING" } }),
  ]);

  const delta = (now: number, then: number | undefined) =>
    then === undefined || then === 0 ? null : Math.round(((now - then) / then) * 100);

  return {
    applications: {
      ...current,
      delta: delta(current.total, before?.total),
      publicDelta: delta(
        current.byKind.TK + current.byKind.DAK,
        before ? before.byKind.TK + before.byKind.DAK : undefined,
      ),
    },
    partners: {
      total: partnerTotal,
      active: activePartners[0]?.count ?? 0,
    },
    commission,
    commissionAllTime,
    publicToForward,
    trend,
    recent,
    topPartners,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
