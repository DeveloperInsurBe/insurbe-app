import { Download, Info, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { FilterGroup, PeriodSwitch } from "../adminUi";
import Pagination, { PAGE_SIZES, parsePage, parsePageSize } from "../Pagination";
import { PERIODS, periodHref } from "../partners/publicInsurance";
import ApplicationsTable from "./ApplicationsTable";
import {
  COMMISSIONS,
  PRODUCTS,
  SORTS,
  SOURCES,
  STAGES,
  buildWhere,
  filtersToParams,
  getApplicationRows,
  getFilterContext,
  orderByFor,
  parseFilters,
  productWhere,
  type ApplicationFilters,
  type FilterParams,
} from "./query";
import CountUp from "../CountUp";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<FilterParams & { page?: string; size?: string }>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const context = await getFilterContext(filters);
  const where = buildWhere(filters, context);

  const withoutProduct = buildWhere(filters, context, "product");
  const withoutStage = buildWhere(filters, context, "stage");

  const count = (countWhere: Prisma.ApplicationWhereInput) =>
    prisma.application.count({ where: countWhere });

  const [
    total,
    productCounts,
    sourceGroups,
    commissionGroups,
    stageCounts,
  ] = await Promise.all([
    prisma.application.count({ where }),
    Promise.all([
      count(withoutProduct),
      count({ AND: [withoutProduct, productWhere("tk", context)] }),
      count({ AND: [withoutProduct, productWhere("dak", context)] }),
      count({ AND: [withoutProduct, productWhere("private", context)] }),
    ]),
    prisma.application.groupBy({
      by: ["source"],
      where: buildWhere(filters, context, "source"),
      _count: { _all: true },
    }),
    prisma.application.groupBy({
      by: ["commissionStatus"],
      where: buildWhere(filters, context, "commission"),
      _count: { _all: true },
      _sum: { commission: true },
    }),
    Promise.all([
      count({ AND: [withoutStage, { status: { not: "incomplete" } }] }),
      count({ AND: [withoutStage, { status: "incomplete" }] }),
      count(withoutStage),
    ]),
  ]);

  const pageSize = parsePageSize(params.size);
  const page = parsePage(params.page, Math.ceil(total / pageSize));

  const rows = await getApplicationRows(where, orderByFor(filters.sort), {
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  /**
   * COUNTS FOR FILTER OPTIONS
   */
  const sourceCount = { direct: 0, partner: 0, agent: 0 };

  for (const group of sourceGroups) {
    const key =
      group.source === "partner" || group.source === "agent" ? group.source : "direct";
    sourceCount[key] += group._count._all;
  }

  const commissionBy = new Map(
    commissionGroups.map((group) => [
      group.commissionStatus,
      { count: group._count._all, sum: group._sum.commission ?? 0 },
    ]),
  );
  const commissionTotal = commissionGroups.reduce(
    (sum, group) => sum + group._count._all,
    0,
  );

  const href = (overrides: Partial<ApplicationFilters> & { page?: number; size?: number }) => {
    const nextSize = overrides.size ?? pageSize;
    const nextPage = overrides.page ?? 1;

    return periodHref("/admin/applications", {
      ...filtersToParams({ ...filters, ...overrides }),
      size: nextSize === PAGE_SIZES[0] ? undefined : String(nextSize),
      page: nextPage === 1 ? undefined : String(nextPage),
    });
  };

  const exportHref = periodHref(
    "/api/admin/applications/export",
    filtersToParams(filters),
  );

  const statCards = [
    {
      label: "Applications",
      value: total,
      format: "number" as const,
      hint: "matching filters",
      tone: "text-gray-900",
    },
    {
      label: "Pending review",
      value: commissionBy.get("Pending")?.sum ?? 0,
      format: "euro" as const,
      hint: `${commissionBy.get("Pending")?.count ?? 0} commissions`,
      tone: "text-amber-600",
    },
    {
      label: "Approved, to pay",
      value: commissionBy.get("Approved")?.sum ?? 0,
      format: "euro" as const,
      hint: `${commissionBy.get("Approved")?.count ?? 0} commissions`,
      tone: "text-blue-600",
    },
    {
      label: "Paid out",
      value: commissionBy.get("Paid")?.sum ?? 0,
      format: "euro" as const,
      hint: `${commissionBy.get("Paid")?.count ?? 0} commissions`,
      tone: "text-emerald-600",
    },
  ];

  const hidden = filtersToParams(filters);

  return (
    <div className="min-w-0 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">
            Applications
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Every application with its product, source and commission status
          </p>
        </div>

        <PeriodSwitch
          periods={PERIODS}
          active={filters.period}
          hrefFor={(value) => href({ period: value as ApplicationFilters["period"] })}
        />
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className={`mt-1 text-xl font-black sm:text-2xl ${card.tone}`}>
              <CountUp value={card.value} format={card.format} delay={150 + index * 60} />
            </p>
            <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action="/admin/applications" className="relative flex-1">
            {Object.entries(hidden).map(([key, value]) =>
              key !== "q" && value && value !== "all" ? (
                <input key={key} type="hidden" name={key} value={value} />
              ) : null,
            )}
            {pageSize !== PAGE_SIZES[0] ? (
              <input type="hidden" name="size" value={pageSize} />
            ) : null}
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Search name, email, order ID, partner or agent…"
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </form>

          <a
            href={exportHref}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#820ad1]/20 bg-[#820ad1]/5 px-4 text-sm font-semibold text-[#820ad1] transition-colors hover:bg-[#820ad1]/10"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <FilterGroup
            label="Stage"
            options={[
              { ...STAGES[0], count: stageCounts[0] },
              { ...STAGES[1], count: stageCounts[1], dot: "bg-gray-400" },
              { ...STAGES[2], count: stageCounts[2] },
            ]}
            active={filters.stage}
            hrefFor={(value) => href({ stage: value as ApplicationFilters["stage"] })}
          />

          <FilterGroup
            label="Product"
            options={[
              { ...PRODUCTS[0], count: productCounts[0] },
              { ...PRODUCTS[1], count: productCounts[1], dot: "bg-blue-500" },
              { ...PRODUCTS[2], count: productCounts[2], dot: "bg-emerald-500" },
              { ...PRODUCTS[3], count: productCounts[3], dot: "bg-[#820ad1]" },
            ]}
            active={filters.product}
            hrefFor={(value) => href({ product: value as ApplicationFilters["product"] })}
          />

          <FilterGroup
            label="Source"
            options={[
              {
                ...SOURCES[0],
                count: sourceCount.direct + sourceCount.partner + sourceCount.agent,
              },
              { ...SOURCES[1], count: sourceCount.direct, dot: "bg-gray-700" },
              { ...SOURCES[2], count: sourceCount.partner, dot: "bg-[#820ad1]" },
              { ...SOURCES[3], count: sourceCount.agent, dot: "bg-amber-500" },
            ]}
            active={filters.source}
            hrefFor={(value) => href({ source: value as ApplicationFilters["source"] })}
          />

          <FilterGroup
            label="Sort"
            options={SORTS}
            active={filters.sort}
            hrefFor={(value) => href({ sort: value as ApplicationFilters["sort"] })}
          />

          <div className="xl:col-span-2">
            <FilterGroup
              label="Commission"
              options={COMMISSIONS.map((item) => ({
                value: item.value,
                label: item.label,
                count: item.status
                  ? commissionBy.get(item.status)?.count ?? 0
                  : commissionTotal,
              }))}
              active={filters.commission}
              hrefFor={(value) =>
                href({ commission: value as ApplicationFilters["commission"] })
              }
            />
          </div>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-500 sm:text-xs">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        Click an application for full details. Change a commission status
        straight from the list; it saves immediately.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No applications found</p>
          <p className="mt-1 text-xs text-gray-500">
            Try another search, period or filter.
          </p>
        </div>
      ) : (
        <>
          <ApplicationsTable initialRows={rows} />

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={total}
            hrefFor={({ page: nextPage, size }) => href({ page: nextPage, size })}
          />
        </>
      )}
    </div>
  );
}
