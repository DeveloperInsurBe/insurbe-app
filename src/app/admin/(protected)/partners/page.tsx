import Link from "next/link";
import { ChevronRight, Info, Search } from "lucide-react";

import { getDefaultCommissionRate, getDefaultRateStats } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import CommissionRateEditor from "../CommissionRateEditor";
import {
  FilterGroup,
  PeriodSwitch,
  RateBadge,
  SplitBar,
  euro,
  initials,
  pick,
} from "../adminUi";
import Pagination, {
  PAGE_SIZES,
  parsePage,
  parsePageSize,
} from "../Pagination";
import {
  PERIODS,
  getPublicInsuranceCounts,
  parsePeriod,
  periodHref,
  periodRange,
} from "./publicInsurance";
import CountUp from "../CountUp";

const SORTS = [
  { value: "total", label: "Most applications" },
  { value: "tk", label: "TK" },
  { value: "dak", label: "DAK" },
  { value: "commission", label: "Commission" },
  { value: "name", label: "Name A–Z" },
] as const;

const ACTIVITY = [
  { value: "all", label: "All partners" },
  { value: "active", label: "With applications" },
  { value: "inactive", label: "No applications" },
] as const;

type Sort = (typeof SORTS)[number]["value"];
type Activity = (typeof ACTIVITY)[number]["value"];

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    q?: string;
    page?: string;
    size?: string;
    sort?: string;
    show?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const range = periodRange(period);
  const q = (params.q || "").trim();
  const sort: Sort = pick(SORTS, params.sort);
  const show: Activity = pick(ACTIVITY, params.show);

  const [partners, partnerMetrics, publicCounts, defaultRate, defaultStats] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "partner",
        ...(q
          ? {
              OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { companyName: { contains: q, mode: "insensitive" } },
                { partnerId: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        partnerId: true,
        firstName: true,
        lastName: true,
        email: true,
        companyName: true,
        commissionRate: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.groupBy({
      by: ["partnerId"],
      where: {
        source: "partner",
        partnerId: { not: null },
        status: { not: "incomplete" },
        ...(range ? { createdAt: range } : {}),
      },
      _count: { _all: true },
      _sum: { commission: true },
    }),
    getPublicInsuranceCounts(period),
    getDefaultCommissionRate("partner"),
    getDefaultRateStats("partner"),
  ]);

  const partnerMetricMap = new Map(
    partnerMetrics.map((item) => [
      item.partnerId,
      {
        enrollments: item._count._all,
        commission: item._sum.commission ?? 0,
      },
    ]),
  );

  const publicCountMap = new Map<string, { tk: number; dak: number }>();

  for (const row of publicCounts) {
    const current = publicCountMap.get(row.partnerId) ?? { tk: 0, dak: 0 };

    if (row.provider === "TK") current.tk = row.customers;
    if (row.provider === "DAK") current.dak = row.customers;

    publicCountMap.set(row.partnerId, current);
  }

  const allRows = partners.map((partner) => {
    const metric = partner.partnerId
      ? partnerMetricMap.get(partner.partnerId)
      : undefined;
    const publicCount = partner.partnerId
      ? publicCountMap.get(partner.partnerId)
      : undefined;
    const tk = publicCount?.tk ?? 0;
    const dak = publicCount?.dak ?? 0;

    return {
      ...partner,
      fullName:
        `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim() ||
        "Partner",
      tk,
      dak,
      publicTotal: tk + dak,
      enrollments: metric?.enrollments ?? 0,
      commission: metric?.commission ?? 0,
      rate: partner.commissionRate ?? defaultRate,
      customRate: partner.commissionRate !== null,
    };
  });

  /**
   * SUMMARY (ALL MATCHING PARTNERS, BEFORE ACTIVITY FILTER)
   */
  const summary = allRows.reduce(
    (acc, row) => ({
      tk: acc.tk + row.tk,
      dak: acc.dak + row.dak,
      active: acc.active + (row.publicTotal > 0 ? 1 : 0),
      enrollments: acc.enrollments + row.enrollments,
      commission: acc.commission + row.commission,
    }),
    { tk: 0, dak: 0, active: 0, enrollments: 0, commission: 0 },
  );

  const sortValue = (row: (typeof allRows)[number]) => {
    if (sort === "tk") return row.tk;
    if (sort === "dak") return row.dak;
    if (sort === "commission") return row.commission;
    return row.publicTotal;
  };

  const rows = allRows
    .filter((row) =>
      show === "active"
        ? row.publicTotal > 0
        : show === "inactive"
          ? row.publicTotal === 0
          : true,
    )
    .sort((a, b) =>
      sort === "name"
        ? a.fullName.localeCompare(b.fullName)
        : sortValue(b) - sortValue(a) || a.fullName.localeCompare(b.fullName),
    );

  const pageSize = parsePageSize(params.size);
  const page = parsePage(params.page, Math.ceil(rows.length / pageSize));
  const offset = (page - 1) * pageSize;
  const pagedRows = rows.slice(offset, offset + pageSize);

  const listHref = (overrides: {
    period?: string;
    sort?: string;
    show?: string;
    page?: number;
    size?: number;
  }) => {
    const nextSize = overrides.size ?? pageSize;
    const nextPage = overrides.page ?? 1;

    return periodHref("/admin/partners", {
      period: overrides.period ?? period,
      q,
      sort: (overrides.sort ?? sort) === "total" ? undefined : overrides.sort ?? sort,
      show: overrides.show ?? show,
      size: nextSize === PAGE_SIZES[0] ? undefined : String(nextSize),
      page: nextPage === 1 ? undefined : String(nextPage),
    });
  };

  const detailHref = (partnerId: string) =>
    periodHref(`/admin/partners/${encodeURIComponent(partnerId)}`, { period });

  const publicTotal = summary.tk + summary.dak;
  const periodLabel = PERIODS.find((item) => item.value === period)?.label;

  return (
    <div className="min-w-0 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">
            Partners
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            TK & DAK applications, enrollments and commission per partner
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CommissionRateEditor
            role="partner"
            targetName="All partners"
            customRate={null}
            defaultRate={defaultRate}
            pendingCount={defaultStats.pending}
            followersCount={defaultStats.followers}
          />
          <PeriodSwitch
            periods={PERIODS}
            active={period}
            hrefFor={(value) => listHref({ period: value })}
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Partners
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            <CountUp value={allRows.length} />
          </p>
          <p className="mt-1 text-xs text-gray-500">
            <span className="font-semibold text-[#820ad1]"><CountUp value={summary.active} delay={250} /></span>{" "}
            with applications
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Public applications
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900"><CountUp value={publicTotal} /></p>
          <div className="mt-2">
            <SplitBar tk={summary.tk} dak={summary.dak} />
            <div className="mt-1.5 flex justify-between text-[11px] font-semibold">
              <span className="text-blue-600">TK {summary.tk}</span>
              <span className="text-emerald-600">DAK {summary.dak}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Enrollments
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            <CountUp value={summary.enrollments} />
          </p>
          <p className="mt-1 text-xs text-gray-500">All products</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Commission
          </p>
          <p className="mt-1 text-2xl font-black text-[#820ad1]">
            <CountUp value={summary.commission} format="euro" />
          </p>
          <p className="mt-1 text-xs text-gray-500">{periodLabel}</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <form action="/admin/partners" className="relative">
          {period !== "all" ? (
            <input type="hidden" name="period" value={period} />
          ) : null}
          {sort !== "total" ? <input type="hidden" name="sort" value={sort} /> : null}
          {show !== "all" ? <input type="hidden" name="show" value={show} /> : null}
          {pageSize !== PAGE_SIZES[0] ? (
            <input type="hidden" name="size" value={pageSize} />
          ) : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, company or partner ID…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
          />
        </form>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <FilterGroup
            label="Show"
            options={[
              { ...ACTIVITY[0], count: allRows.length },
              { ...ACTIVITY[1], count: summary.active, dot: "bg-emerald-500" },
              {
                ...ACTIVITY[2],
                count: allRows.length - summary.active,
                dot: "bg-gray-400",
              },
            ]}
            active={show}
            hrefFor={(value) => listHref({ show: value })}
          />

          <FilterGroup
            label="Sort"
            options={SORTS}
            active={sort}
            hrefFor={(value) => listHref({ sort: value })}
          />
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-500 sm:text-xs">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        Applications count each customer once per provider, across all
        statuses. Click a partner to see every submission.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No partners found</p>
          <p className="mt-1 text-xs text-gray-500">
            Try another search, period or filter.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE / TABLET CARDS */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
            {pagedRows.map((partner, index) => {
              const card = (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-sm font-black text-[#820ad1]">
                      {initials(partner.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {partner.fullName}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {partner.companyName || partner.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-gray-400">
                      #{offset + index + 1}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-2xl font-black leading-none text-gray-900">
                        {partner.publicTotal}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">applications</p>
                    </div>
                    <div className="flex gap-3 text-xs font-semibold">
                      <span className="text-blue-600">TK {partner.tk}</span>
                      <span className="text-emerald-600">DAK {partner.dak}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <SplitBar tk={partner.tk} dak={partner.dak} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
                    <span className="text-gray-500">
                      <span className="font-semibold text-gray-900">
                        {partner.enrollments}
                      </span>{" "}
                      enrollments
                    </span>
                    <RateBadge rate={partner.rate} custom={partner.customRate} />
                    <span className="font-semibold text-[#820ad1]">
                      {euro.format(partner.commission)}
                    </span>
                  </div>
                </>
              );

              const className = `block rounded-2xl border border-gray-200 bg-white p-4 transition-all ${
                partner.publicTotal === 0 ? "opacity-70" : ""
              }`;

              return partner.partnerId ? (
                <Link
                  key={partner.id}
                  href={detailHref(partner.partnerId)}
                  className={`${className} hover:border-[#820ad1]/40 hover:shadow-sm`}
                >
                  {card}
                </Link>
              ) : (
                <div key={partner.id} className={className}>
                  {card}
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white xl:block">
            <table className="w-full table-fixed">
              <thead className="border-b border-gray-100 bg-gray-50/70">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <th className="w-14 px-4 py-3">#</th>
                  <th className="px-4 py-3">Partner</th>
                  <th className="w-32 px-4 py-3">Partner ID</th>
                  <th className="w-56 px-4 py-3">TK / DAK applications</th>
                  <th className="w-28 px-4 py-3 text-right">Enrollments</th>
                  <th className="w-32 px-4 py-3">Rate / app</th>
                  <th className="w-28 px-4 py-3 text-right">Commission</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {pagedRows.map((partner, index) => (
                  <tr
                    key={partner.id}
                    className={`group border-t border-gray-100 transition-colors hover:bg-[#820ad1]/[0.03] ${
                      partner.publicTotal === 0 ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-gray-400">
                      {offset + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-xs font-black text-[#820ad1]">
                          {initials(partner.fullName)}
                        </div>
                        <div className="min-w-0">
                          {partner.partnerId ? (
                            <Link
                              href={detailHref(partner.partnerId)}
                              className="block truncate text-sm font-semibold text-gray-900 hover:text-[#820ad1]"
                            >
                              {partner.fullName}
                            </Link>
                          ) : (
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {partner.fullName}
                            </p>
                          )}
                          <p className="truncate text-xs text-gray-500">
                            {[partner.companyName, partner.email]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block max-w-full truncate rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                        {partner.partnerId || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-base font-black text-gray-900">
                          {partner.publicTotal}
                        </span>
                        <div className="min-w-0 flex-1">
                          <SplitBar tk={partner.tk} dak={partner.dak} />
                          <div className="mt-1 flex justify-between text-[11px] font-semibold">
                            <span className="text-blue-600">TK {partner.tk}</span>
                            <span className="text-emerald-600">DAK {partner.dak}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {partner.enrollments}
                    </td>
                    <td className="px-4 py-3">
                      <RateBadge rate={partner.rate} custom={partner.customRate} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-[#820ad1]">
                      {euro.format(partner.commission)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {partner.partnerId ? (
                        <Link
                          href={detailHref(partner.partnerId)}
                          aria-label={`View ${partner.fullName}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all group-hover:bg-[#820ad1]/10 group-hover:text-[#820ad1]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={rows.length}
            hrefFor={({ page: nextPage, size }) =>
              listHref({ page: nextPage, size })
            }
          />
        </>
      )}
    </div>
  );
}
