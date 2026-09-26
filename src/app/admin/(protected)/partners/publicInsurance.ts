import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const PERIODS = [
  { value: "all", label: "All time" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
] as const;

export type Period = (typeof PERIODS)[number]["value"];

export const PUBLIC_PROVIDERS = ["TK", "DAK"] as const;

export type PublicProvider = (typeof PUBLIC_PROVIDERS)[number];

export function parsePeriod(value: string | undefined): Period {
  return PERIODS.some((period) => period.value === value)
    ? (value as Period)
    : "all";
}

/**
 * Month boundaries in UTC. "all" has no range.
 */
export function periodRange(period: Period): { gte: Date; lt: Date } | null {
  if (period === "all") return null;

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (period === "this-month") {
    return {
      gte: new Date(Date.UTC(year, month, 1)),
      lt: new Date(Date.UTC(year, month + 1, 1)),
    };
  }

  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}

export type PublicInsuranceCount = {
  partnerId: string;
  provider: PublicProvider;
  customers: number;
};

/**
 * Partner-referred TK/DAK submissions (every status), counted as unique
 * customer email per partner and provider.
 */
export async function getPublicInsuranceCounts(
  period: Period,
): Promise<PublicInsuranceCount[]> {
  const range = periodRange(period);

  return prisma.$queryRaw<PublicInsuranceCount[]>`
    SELECT
      "partnerId",
      "provider",
      COUNT(DISTINCT lower(coalesce("payload"->'personal'->>'email', "id")))::int AS "customers"
    FROM "InsuranceApplication"
    WHERE "source" = 'partner'
      AND "partnerId" IS NOT NULL
      AND "provider" IN ('TK', 'DAK')
      ${
        range
          ? Prisma.sql`AND "createdAt" >= ${range.gte} AND "createdAt" < ${range.lt}`
          : Prisma.empty
      }
    GROUP BY "partnerId", "provider"
  `;
}

export function customerKey(payload: unknown, fallback: string) {
  const email = (payload as { personal?: { email?: string } } | null)?.personal
    ?.email;

  return (email || fallback).trim().toLowerCase();
}

export function periodHref(
  basePath: string,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") search.set(key, value);
  }

  const query = search.toString();

  return query ? `${basePath}?${query}` : basePath;
}
