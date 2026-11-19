import { prisma } from "./prisma";

export const COMMISSION_ROLES = ["partner", "agent"] as const;

export type CommissionRole = (typeof COMMISSION_ROLES)[number];

/**
 * Used only if the CommissionDefault rows are missing.
 */
export const FALLBACK_COMMISSION_RATES: Record<CommissionRole, number> = {
  partner: 5,
  agent: 30,
};

export const MAX_COMMISSION_RATE = 1000;

/**
 * Users whose customers are stored like agent customers (source "agent",
 * partnerId = their user id): agents and Sales Leaders (role team_admin), whose
 * own direct customers earn them commission. Disabled Sales Leaders stay in
 * the list so their history and payouts still resolve.
 */
export const AGENT_LIKE_ROLES = ["agent", "team_admin", "team_admin_disabled"];

/** Key of a referrer in "source:partnerId" maps (Sales Leaders count as "agent"). */
export const referrerKeyOf = (user: { role: string | null; id: string; partnerId: string | null }) =>
  user.role === "partner" ? `partner:${user.partnerId}` : `agent:${user.id}`;

export function isCommissionRole(value: unknown): value is CommissionRole {
  return COMMISSION_ROLES.includes(value as CommissionRole);
}

export function isValidCommissionRate(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_COMMISSION_RATE
  );
}

export async function getDefaultCommissionRates(): Promise<
  Record<CommissionRole, number>
> {
  const rows = await prisma.commissionDefault.findMany();
  const rates = { ...FALLBACK_COMMISSION_RATES };

  for (const row of rows) {
    if (isCommissionRole(row.role)) rates[row.role] = row.rate;
  }

  return rates;
}

export async function getDefaultCommissionRate(role: CommissionRole) {
  const row = await prisma.commissionDefault.findUnique({ where: { role } });

  return row?.rate ?? FALLBACK_COMMISSION_RATES[role];
}

/**
 * Partners/agents on the role default, and their Pending commissions
 * (what "apply to pending" would re-price for a default change).
 */
export async function getDefaultRateStats(role: CommissionRole) {
  const followers = await prisma.user.findMany({
    where: { role, commissionRate: null },
    select: { id: true, partnerId: true },
  });

  const referrerKeys = followers
    .map((user) => (role === "agent" ? user.id : user.partnerId))
    .filter((key): key is string => !!key);

  const pending = referrerKeys.length
    ? await prisma.application.count({
        where: {
          source: role,
          partnerId: { in: referrerKeys },
          commissionStatus: "Pending",
        },
      })
    : 0;

  return { followers: followers.length, pending };
}

/**
 * Commission (whole EUR) for a new application referred by a partner
 * (Application.partnerId = partner code) or an agent (= agent user id).
 * Returns 0 when there is no referrer.
 */
export async function getReferrerCommission(
  source: string | null | undefined,
  partnerId: string | null | undefined,
) {
  if (!partnerId) return 0;

  const role: CommissionRole = source === "agent" ? "agent" : "partner";

  const referrer = await prisma.user.findFirst({
    where:
      role === "agent"
        ? { role: { in: AGENT_LIKE_ROLES }, id: partnerId }
        : { role: "partner", partnerId },
    select: { commissionRate: true },
  });

  return referrer?.commissionRate ?? (await getDefaultCommissionRate(role));
}
