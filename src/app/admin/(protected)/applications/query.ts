import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  PERIODS,
  parsePeriod,
  periodRange,
  type Period,
} from "../partners/publicInsurance";
import type { ApplicationRow } from "./shared";

export { COMMISSION_STATUSES, type ApplicationRow } from "./shared";

export const PUBLIC_PRODUCT = "Public Health Insurance";

export const PRODUCTS = [
  { value: "all", label: "All" },
  { value: "tk", label: "TK" },
  { value: "dak", label: "DAK" },
  { value: "private", label: "Private" },
] as const;

export const SOURCES = [
  { value: "all", label: "Any" },
  { value: "direct", label: "Direct" },
  { value: "partner", label: "Partner" },
  { value: "agent", label: "Agent" },
] as const;

export const COMMISSIONS = [
  { value: "all", label: "All", status: null },
  { value: "pending", label: "Pending", status: "Pending" },
  { value: "approved", label: "Approved", status: "Approved" },
  { value: "paid", label: "Paid", status: "Paid" },
  { value: "rejected", label: "Rejected", status: "Rejected" },
  { value: "not-eligible", label: "Not eligible", status: "Not Eligible" },
] as const;

export const STAGES = [
  { value: "active", label: "Submitted" },
  { value: "drafts", label: "Drafts" },
  { value: "any", label: "All" },
] as const;

export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "commission", label: "Commission" },
] as const;

type Option = { value: string };

function pickValue<T extends readonly Option[]>(
  options: T,
  value: string | undefined,
): T[number]["value"] {
  return options.find((option) => option.value === value)?.value ?? options[0].value;
}

export type ApplicationFilters = {
  period: Period;
  q: string;
  product: (typeof PRODUCTS)[number]["value"];
  source: (typeof SOURCES)[number]["value"];
  commission: (typeof COMMISSIONS)[number]["value"];
  stage: (typeof STAGES)[number]["value"];
  sort: (typeof SORTS)[number]["value"];
};

export type FilterParams = Partial<Record<keyof ApplicationFilters, string>>;

export function parseFilters(params: FilterParams): ApplicationFilters {
  return {
    period: parsePeriod(params.period),
    q: (params.q || "").trim(),
    product: pickValue(PRODUCTS, params.product),
    source: pickValue(SOURCES, params.source),
    commission: pickValue(COMMISSIONS, params.commission),
    stage: pickValue(STAGES, params.stage),
    sort: pickValue(SORTS, params.sort),
  };
}

/**
 * Query string for the current filters (defaults left out).
 */
export function filtersToParams(filters: ApplicationFilters) {
  return {
    period: filters.period === PERIODS[0].value ? undefined : filters.period,
    q: filters.q || undefined,
    product: filters.product,
    source: filters.source,
    commission: filters.commission,
    stage: filters.stage === "active" ? undefined : filters.stage,
    sort: filters.sort === "newest" ? undefined : filters.sort,
  };
}

/**
 * Lookups the filters need: TK/DAK references (Application rows only
 * store "Public Health Insurance") and referrers matching the search.
 */
export async function getFilterContext(filters: ApplicationFilters) {
  const [publicRefs, referrers] = await Promise.all([
    prisma.insuranceApplication.findMany({
      select: { id: true, applicationNumber: true, provider: true },
    }),
    filters.q
      ? prisma.user.findMany({
          where: {
            role: { in: ["partner", "agent"] },
            OR: [
              { firstName: { contains: filters.q, mode: "insensitive" } },
              { lastName: { contains: filters.q, mode: "insensitive" } },
              { companyName: { contains: filters.q, mode: "insensitive" } },
              { email: { contains: filters.q, mode: "insensitive" } },
            ],
          },
          select: { id: true, role: true, partnerId: true },
        })
      : [],
  ]);

  const refs = { TK: [] as string[], DAK: [] as string[] };

  for (const row of publicRefs) {
    const list = row.provider === "TK" ? refs.TK : row.provider === "DAK" ? refs.DAK : null;

    if (!list) continue;

    list.push(row.id);
    if (row.applicationNumber) list.push(row.applicationNumber);
  }

  const referrerIds = referrers
    .map((user) => (user.role === "agent" ? user.id : user.partnerId))
    .filter((id): id is string => !!id);

  return { refs, referrerIds };
}

export type FilterContext = Awaited<ReturnType<typeof getFilterContext>>;

/**
 * Prisma filter for the current filters. `omit` leaves one filter out,
 * which gives the counts shown on that filter's own options.
 */
export function buildWhere(
  filters: ApplicationFilters,
  context: FilterContext,
  omit?: "product" | "source" | "commission" | "stage",
): Prisma.ApplicationWhereInput {
  const and: Prisma.ApplicationWhereInput[] = [
    { status: { not: "client_profile" } },
  ];

  const range = periodRange(filters.period);
  if (range) and.push({ createdAt: range });

  if (omit !== "stage") {
    if (filters.stage === "active") and.push({ status: { not: "incomplete" } });
    if (filters.stage === "drafts") and.push({ status: "incomplete" });
  }

  if (omit !== "product" && filters.product !== "all") {
    and.push(productWhere(filters.product, context));
  }

  if (omit !== "source" && filters.source !== "all") {
    and.push(
      filters.source === "direct"
        ? { OR: [{ source: "user" }, { source: null }] }
        : { source: filters.source },
    );
  }

  if (omit !== "commission" && filters.commission !== "all") {
    const status = COMMISSIONS.find((item) => item.value === filters.commission)?.status;
    if (status) and.push({ commissionStatus: status });
  }

  if (filters.q) {
    const contains = { contains: filters.q, mode: "insensitive" as const };

    and.push({
      OR: [
        { orderId: contains },
        { firstName: contains },
        { lastName: contains },
        { userId: contains },
        { product: contains },
        { partnerId: contains },
        ...(context.referrerIds.length
          ? [{ partnerId: { in: context.referrerIds } }]
          : []),
      ],
    });
  }

  return { AND: and };
}

export function productWhere(
  product: "tk" | "dak" | "private",
  context: FilterContext,
): Prisma.ApplicationWhereInput {
  if (product === "private") {
    return { OR: [{ product: null }, { product: { not: PUBLIC_PRODUCT } }] };
  }

  const provider = product === "tk" ? "TK" : "DAK";

  return {
    product: PUBLIC_PRODUCT,
    OR: [
      { orderId: { startsWith: `IB-${provider}-` } },
      { orderId: { in: context.refs[provider] } },
    ],
  };
}

export function orderByFor(
  sort: ApplicationFilters["sort"],
): Prisma.ApplicationOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ createdAt: "asc" }];
  if (sort === "commission") return [{ commission: "desc" }, { createdAt: "desc" }];
  return [{ createdAt: "desc" }];
}

type Personal = Record<string, unknown>;

const text = (value: unknown) =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value).trim()
    : "";

const humanize = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

function flatten(record: Personal | undefined): [string, string][] {
  if (!record) return [];

  return Object.entries(record)
    .filter(([key]) => !key.toLowerCase().startsWith("confirm"))
    .map(([key, value]) => [humanize(key), text(value)] as [string, string])
    .filter(([, value]) => value && value.length <= 200);
}

export async function getApplicationRows(
  where: Prisma.ApplicationWhereInput,
  orderBy: Prisma.ApplicationOrderByWithRelationInput[],
  paging: { skip?: number; take: number },
): Promise<ApplicationRow[]> {
  const applications = await prisma.application.findMany({
    where,
    orderBy,
    ...paging,
    select: {
      id: true,
      orderId: true,
      userId: true,
      status: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      product: true,
      source: true,
      partnerId: true,
      commission: true,
      commissionStatus: true,
      personalDetails: true,
    },
  });

  const publicOrderIds = applications
    .filter((app) => app.product === PUBLIC_PRODUCT)
    .map((app) => app.orderId);

  const referrerIds = [
    ...new Set(applications.map((app) => app.partnerId).filter((id): id is string => !!id)),
  ];

  const [publicApps, referrers] = await Promise.all([
    publicOrderIds.length
      ? prisma.insuranceApplication.findMany({
          where: {
            OR: [
              { id: { in: publicOrderIds } },
              { applicationNumber: { in: publicOrderIds } },
            ],
          },
          select: { id: true, applicationNumber: true, provider: true, payload: true },
        })
      : [],
    referrerIds.length
      ? prisma.user.findMany({
          where: {
            OR: [
              { role: "partner", partnerId: { in: referrerIds } },
              { role: "agent", id: { in: referrerIds } },
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
          },
        })
      : [],
  ]);

  const publicByRef = new Map<string, (typeof publicApps)[number]>();

  for (const app of publicApps) {
    publicByRef.set(app.id, app);
    if (app.applicationNumber) publicByRef.set(app.applicationNumber, app);
  }

  const referrerName = new Map<string, string>();

  for (const user of referrers) {
    const key = user.role === "agent" ? user.id : user.partnerId;
    const name =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.companyName ||
      user.email;

    if (key) referrerName.set(`${user.role}:${key}`, name);
  }

  return applications.map((app) => {
    const publicApp =
      app.product === PUBLIC_PRODUCT ? publicByRef.get(app.orderId) : undefined;
    const payload = (publicApp?.payload as { personal?: Personal; selectPlan?: Personal } | null) ?? {};
    const personal = publicApp ? payload.personal ?? {} : ((app.personalDetails as Personal | null) ?? {});

    const provider =
      publicApp?.provider ??
      (app.orderId.startsWith("IB-TK-") ? "TK" : app.orderId.startsWith("IB-DAK-") ? "DAK" : null);
    const kind: ApplicationRow["kind"] =
      app.product === PUBLIC_PRODUCT && (provider === "TK" || provider === "DAK")
        ? provider
        : "private";

    const source: ApplicationRow["source"] =
      app.source === "partner" || app.source === "agent" ? app.source : "direct";

    const phone = publicApp
      ? `${text(personal.countryCode)} ${text(personal.phoneNumber)}`.trim()
      : text(personal.phone);

    return {
      id: app.id,
      orderId: app.orderId,
      createdAt: app.createdAt.toISOString(),
      status: app.status,
      name:
        `${app.firstName || text(personal.firstName)} ${app.lastName || text(personal.lastName)}`.trim(),
      email: text(personal.email) || (app.userId?.includes("@") ? app.userId : ""),
      phone,
      location: [text(personal.city), text(personal.country)].filter(Boolean).join(", "),
      product:
        kind === "private" ? app.product || "Private insurance" : `${kind} public insurance`,
      kind,
      source,
      referrer:
        source === "direct" || !app.partnerId
          ? ""
          : referrerName.get(`${source}:${app.partnerId}`) || app.partnerId,
      commission: app.commission,
      commissionStatus: app.commissionStatus,
      extra: [...flatten(personal), ...flatten(payload.selectPlan)],
    };
  });
}
