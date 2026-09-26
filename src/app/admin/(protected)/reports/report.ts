import { getDefaultCommissionRates } from "@/lib/commission";
import { prisma } from "@/lib/prisma";

/**
 * Agent contact records, not applications. Drafts are included.
 */
export const EXCLUDED_STATUSES = ["client_profile"];

const DRAFT_STATUS = "incomplete";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportRange = {
  mode: "month" | "custom" | "all";
  month: string;
  from: string;
  to: string;
  gte: Date;
  lt: Date;
  label: string;
  prevMonth: string;
  nextMonth: string | null;
};

const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * ?range=all (default), ?month=YYYY-MM or ?from=YYYY-MM-DD&to=YYYY-MM-DD.
 * Days are UTC.
 */
export function parseRange(params: {
  month?: string;
  from?: string;
  to?: string;
  range?: string;
}): ReportRange {
  const now = new Date();
  const currentMonth = monthKey(now);

  const hasMonth = !!params.month && MONTH_RE.test(params.month);
  const hasDays = !!params.from && !!params.to;

  if (params.range === "all" || (!hasMonth && !hasDays)) {
    const today = new Date(`${dayKey(now)}T00:00:00Z`);

    return {
      mode: "all",
      month: currentMonth,
      from: "2000-01-01",
      to: dayKey(today),
      gte: new Date(Date.UTC(2000, 0, 1)),
      lt: new Date(today.getTime() + DAY_MS),
      label: "All time",
      prevMonth: currentMonth,
      nextMonth: null,
    };
  }

  if (params.from && params.to && DAY_RE.test(params.from) && DAY_RE.test(params.to)) {
    let gte = new Date(`${params.from}T00:00:00Z`);
    let last = new Date(`${params.to}T00:00:00Z`);

    if (!Number.isNaN(gte.getTime()) && !Number.isNaN(last.getTime())) {
      if (last < gte) [gte, last] = [last, gte];

      const month = monthKey(gte);

      return {
        mode: "custom",
        month,
        from: dayKey(gte),
        to: dayKey(last),
        gte,
        lt: new Date(last.getTime() + DAY_MS),
        label: `${formatDay(gte)} – ${formatDay(last)}`,
        ...neighbours(month, currentMonth),
      };
    }
  }

  const month =
    params.month && MONTH_RE.test(params.month) ? params.month : currentMonth;
  const [year, monthIndex] = month.split("-").map(Number);
  const gte = new Date(Date.UTC(year, monthIndex - 1, 1));
  const lt = new Date(Date.UTC(year, monthIndex, 1));

  return {
    mode: "month",
    month,
    from: dayKey(gte),
    to: dayKey(new Date(lt.getTime() - DAY_MS)),
    gte,
    lt,
    label: gte.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    ...neighbours(month, currentMonth),
  };
}

function neighbours(month: string, currentMonth: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const prev = monthKey(new Date(Date.UTC(year, monthIndex - 2, 1)));
  const next = monthKey(new Date(Date.UTC(year, monthIndex, 1)));

  return { prevMonth: prev, nextMonth: next > currentMonth ? null : next };
}

export type BankDetails = {
  holder: string;
  iban: string;
  bic: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  currency: string;
};

export type ReportRow = {
  key: string;
  source: "partner" | "agent";
  /** Application.partnerId: partner code or agent user id */
  referrerKey: string;
  code: string;
  name: string;
  company: string;
  email: string;
  rate: number;
  applications: number;
  total: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  notEligible: number;
  approvedCount: number;
  drafts: number;
  bank: BankDetails | null;
};

export async function getCommissionReport(range: ReportRange): Promise<ReportRow[]> {
  const grouped = await prisma.application.groupBy({
    by: ["source", "partnerId", "commissionStatus", "status"],
    where: {
      source: { in: ["partner", "agent"] },
      partnerId: { not: null },
      status: { notIn: EXCLUDED_STATUSES },
      createdAt: { gte: range.gte, lt: range.lt },
    },
    _count: { _all: true },
    _sum: { commission: true },
  });

  const partnerCodes = new Set<string>();
  const agentIds = new Set<string>();

  for (const item of grouped) {
    if (!item.partnerId) continue;
    if (item.source === "agent") agentIds.add(item.partnerId);
    else partnerCodes.add(item.partnerId);
  }

  const [users, defaults] = await Promise.all([
    partnerCodes.size || agentIds.size
      ? prisma.user.findMany({
          where: {
            OR: [
              { role: "partner", partnerId: { in: [...partnerCodes] } },
              { role: "agent", id: { in: [...agentIds] } },
            ],
          },
          select: {
            id: true,
            role: true,
            partnerId: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            commissionRate: true,
            partnerProfile: {
              select: {
                accountHolder: true,
                iban: true,
                bicSwift: true,
                accountNumber: true,
                ifscCode: true,
                bankName: true,
                currency: true,
              },
            },
          },
        })
      : [],
    getDefaultCommissionRates(),
  ]);

  const userByKey = new Map(
    users.map((user) => [
      `${user.role}:${user.role === "agent" ? user.id : user.partnerId}`,
      user,
    ]),
  );

  const rows = new Map<string, ReportRow>();

  for (const item of grouped) {
    if (!item.partnerId) continue;

    const source = item.source === "agent" ? "agent" : "partner";
    const key = `${source}:${item.partnerId}`;
    let row = rows.get(key);

    if (!row) {
      const user = userByKey.get(key);
      const profile = user?.partnerProfile;
      const hasBank =
        !!profile && !!(profile.iban || profile.accountNumber);

      row = {
        key,
        source,
        referrerKey: item.partnerId,
        code: source === "partner" ? item.partnerId : "",
        name:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
          user?.email ||
          item.partnerId,
        company: user?.companyName || "",
        email: user?.email || "",
        rate: user?.commissionRate ?? defaults[source],
        applications: 0,
        total: 0,
        pending: 0,
        approved: 0,
        paid: 0,
        rejected: 0,
        notEligible: 0,
        approvedCount: 0,
        drafts: 0,
        bank: hasBank
          ? {
              holder: profile.accountHolder || "",
              iban: profile.iban || "",
              bic: profile.bicSwift || "",
              accountNumber: profile.accountNumber || "",
              ifsc: profile.ifscCode || "",
              bankName: profile.bankName || "",
              currency: profile.currency || "",
            }
          : null,
      };

      rows.set(key, row);
    }

    const sum = item._sum.commission ?? 0;

    row.applications += item._count._all;
    row.total += sum;
    if (item.status === DRAFT_STATUS) row.drafts += item._count._all;

    if (item.commissionStatus === "Pending") row.pending += sum;
    if (item.commissionStatus === "Approved") {
      row.approved += sum;
      row.approvedCount += item._count._all;
    }
    if (item.commissionStatus === "Paid") row.paid += sum;
    if (item.commissionStatus === "Rejected") row.rejected += sum;
    if (item.commissionStatus === "Not Eligible") row.notEligible += sum;
  }

  return [...rows.values()];
}
