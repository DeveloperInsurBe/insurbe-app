import { Info, Search } from "lucide-react";

import { getDefaultCommissionRate, getDefaultRateStats } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import CommissionRateEditor from "../CommissionRateEditor";
import Pagination, { PAGE_SIZES, parsePage, parsePageSize } from "../Pagination";
import { FilterGroup, PeriodSwitch, RateBadge, euro, initials, pick } from "../adminUi";
import { PERIODS, parsePeriod, periodHref, periodRange } from "../partners/publicInsurance";
import CountUp from "../CountUp";

const SORTS = [
  { value: "apps", label: "Most applications" },
  { value: "commission", label: "Commission" },
  { value: "name", label: "Name A–Z" },
] as const;

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    q?: string;
    sort?: string;
    page?: string;
    size?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const range = periodRange(period);
  const q = (params.q || "").trim();
  const sort = pick(SORTS, params.sort);

  const [agents, metrics, pendingGroups, clientGroups, defaultRate, defaultStats] =
    await Promise.all([
      prisma.user.findMany({
        where: {
          role: "agent",
          ...(q
            ? {
                OR: [
                  { firstName: { contains: q, mode: "insensitive" } },
                  { lastName: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                  { companyName: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
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
          source: "agent",
          partnerId: { not: null },
          status: { notIn: ["incomplete", "client_profile"] },
          ...(range ? { createdAt: range } : {}),
        },
        _count: { _all: true },
        _sum: { commission: true },
      }),
      prisma.application.groupBy({
        by: ["partnerId"],
        where: {
          source: "agent",
          partnerId: { not: null },
          commissionStatus: "Pending",
        },
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["partnerId"],
        where: {
          source: "agent",
          partnerId: { not: null },
          status: "client_profile",
        },
        _count: { _all: true },
      }),
      getDefaultCommissionRate("agent"),
      getDefaultRateStats("agent"),
    ]);

  const metricMap = new Map(
    metrics.map((item) => [
      item.partnerId,
      { applications: item._count._all, commission: item._sum.commission ?? 0 },
    ]),
  );
  const pendingMap = new Map(
    pendingGroups.map((item) => [item.partnerId, item._count._all]),
  );
  const clientMap = new Map(
    clientGroups.map((item) => [item.partnerId, item._count._all]),
  );

  const rows = agents
    .map((agent) => {
      const metric = metricMap.get(agent.id);

      return {
        ...agent,
        fullName:
          `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim() || agent.email,
        applications: metric?.applications ?? 0,
        commission: metric?.commission ?? 0,
        clients: clientMap.get(agent.id) ?? 0,
        pending: pendingMap.get(agent.id) ?? 0,
        rate: agent.commissionRate ?? defaultRate,
      };
    })
    .sort((a, b) => {
      if (sort === "name") return a.fullName.localeCompare(b.fullName);
      if (sort === "commission") return b.commission - a.commission;
      return b.applications - a.applications || a.fullName.localeCompare(b.fullName);
    });

  const summary = rows.reduce(
    (acc, row) => ({
      applications: acc.applications + row.applications,
      commission: acc.commission + row.commission,
      clients: acc.clients + row.clients,
      custom: acc.custom + (row.commissionRate !== null ? 1 : 0),
    }),
    { applications: 0, commission: 0, clients: 0, custom: 0 },
  );

  const pageSize = parsePageSize(params.size);
  const page = parsePage(params.page, Math.ceil(rows.length / pageSize));
  const offset = (page - 1) * pageSize;
  const pagedRows = rows.slice(offset, offset + pageSize);

  const listHref = (overrides: {
    period?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const nextSize = overrides.size ?? pageSize;
    const nextPage = overrides.page ?? 1;
    const nextSort = overrides.sort ?? sort;

    return periodHref("/admin/agents", {
      period: overrides.period ?? period,
      q,
      sort: nextSort === "apps" ? undefined : nextSort,
      size: nextSize === PAGE_SIZES[0] ? undefined : String(nextSize),
      page: nextPage === 1 ? undefined : String(nextPage),
    });
  };

  const cards = [
    { label: "Agents", value: rows.length, format: "number" as const, hint: `${summary.custom} with custom rate` },
    { label: "Applications", value: summary.applications, format: "number" as const, hint: "excl. drafts" },
    { label: "Clients", value: summary.clients, format: "number" as const, hint: "client profiles" },
    { label: "Commission", value: summary.commission, format: "euro" as const, hint: `default €${defaultRate} / application` },
  ];

  return (
    <div className="min-w-0 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Agents</h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Applications, clients and commission rate per agent
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CommissionRateEditor
            role="agent"
            targetName="All agents"
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
        {cards.map((card, index) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-black text-gray-900 sm:text-2xl">
              <CountUp value={card.value} format={card.format} delay={150 + index * 60} />
            </p>
            <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 lg:flex-row lg:items-center">
        <form action="/admin/agents" className="relative flex-1">
          {period !== "all" ? <input type="hidden" name="period" value={period} /> : null}
          {sort !== "apps" ? <input type="hidden" name="sort" value={sort} /> : null}
          {pageSize !== PAGE_SIZES[0] ? (
            <input type="hidden" name="size" value={pageSize} />
          ) : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email or company…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
          />
        </form>

        <FilterGroup
          label="Sort"
          options={SORTS}
          active={sort}
          hrefFor={(value) => listHref({ sort: value })}
        />
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-500 sm:text-xs">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        Use the pencil to give an agent a custom rate. New applications use it
        straight away; existing commissions only change if you tick the option.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No agents found</p>
          <p className="mt-1 text-xs text-gray-500">Try another search or period.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid">
              <span>Agent</span>
              <span className="text-right">Clients</span>
              <span className="text-right">Applications</span>
              <span>Rate / app</span>
              <span className="text-right">Commission</span>
            </div>

            {pagedRows.map((agent) => (
              <div
                key={agent.id}
                className="grid grid-cols-2 gap-3 border-t border-gray-100 px-4 py-3 first:border-t-0 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-4"
              >
                <div className="col-span-2 flex min-w-0 items-center gap-3 lg:col-span-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
                    {initials(agent.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {agent.fullName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {[agent.companyName, agent.email].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 lg:text-right lg:text-sm lg:font-semibold lg:text-gray-900">
                  <span className="lg:hidden">Clients </span>
                  <span className="font-semibold text-gray-900">{agent.clients}</span>
                </p>

                <p className="text-right text-xs text-gray-500 lg:text-sm lg:font-semibold lg:text-gray-900">
                  <span className="lg:hidden">Applications </span>
                  <span className="font-semibold text-gray-900">{agent.applications}</span>
                </p>

                <div className="flex items-center gap-1">
                  <RateBadge rate={agent.rate} custom={agent.commissionRate !== null} />
                  <CommissionRateEditor
                    variant="icon"
                    role="agent"
                    userId={agent.id}
                    targetName={agent.fullName}
                    customRate={agent.commissionRate}
                    defaultRate={defaultRate}
                    pendingCount={agent.pending}
                  />
                </div>

                <p className="text-right text-sm font-semibold text-[#820ad1]">
                  {euro.format(agent.commission)}
                </p>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={rows.length}
            hrefFor={({ page: nextPage, size }) => listHref({ page: nextPage, size })}
          />
        </>
      )}
    </div>
  );
}
