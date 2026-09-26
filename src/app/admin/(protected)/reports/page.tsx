import Link from "next/link";
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Landmark,
  Search,
} from "lucide-react";

import Pagination, { PAGE_SIZES, parsePage, parsePageSize } from "../Pagination";
import { FilterGroup, euro, initials, pick } from "../adminUi";
import { periodHref } from "../partners/publicInsurance";
import MarkPaidButton from "./MarkPaidButton";
import { getCommissionReport, parseRange, type ReportRow } from "./report";
import CountUp from "../CountUp";

const WHO = [
  { value: "all", label: "Everyone" },
  { value: "partner", label: "Partners" },
  { value: "agent", label: "Agents" },
] as const;

const SHOW = [
  { value: "all", label: "All" },
  { value: "payable", label: "To pay" },
  { value: "pending", label: "Pending review" },
] as const;

const SORTS = [
  { value: "payable", label: "Payable" },
  { value: "total", label: "Total" },
  { value: "name", label: "Name A–Z" },
] as const;

const STATUS_COLORS = {
  pending: "bg-amber-400",
  approved: "bg-[#820ad1]",
  paid: "bg-emerald-500",
  rejected: "bg-red-400",
} as const;

function StatusBar({
  row,
  className = "h-1.5",
}: {
  row: Pick<ReportRow, "pending" | "approved" | "paid" | "rejected">;
  className?: string;
}) {
  const total = row.pending + row.approved + row.paid + row.rejected;

  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
      {total > 0
        ? (Object.keys(STATUS_COLORS) as (keyof typeof STATUS_COLORS)[]).map((key) =>
            row[key] > 0 ? (
              <div
                key={key}
                className={STATUS_COLORS[key]}
                style={{ width: `${(row[key] / total) * 100}%` }}
              />
            ) : null,
          )
        : null}
    </div>
  );
}

function BankLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 py-1 text-xs">
      <dt className="text-gray-500">{label}</dt>
      <dd className="break-all font-mono text-gray-900">{value}</dd>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    from?: string;
    to?: string;
    who?: string;
    show?: string;
    sort?: string;
    q?: string;
    page?: string;
    size?: string;
  }>;
}) {
  const params = await searchParams;
  const range = parseRange(params);
  const who = pick(WHO, params.who);
  const show = pick(SHOW, params.show);
  const sort = pick(SORTS, params.sort);
  const q = (params.q || "").trim();

  const report = await getCommissionReport(range);

  /**
   * FILTERS (search + who apply to the summary; show only to the list)
   */
  const searched = report.filter((row) =>
    q
      ? [row.name, row.company, row.email, row.code]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      : true,
  );

  const whoCounts = {
    all: searched.length,
    partner: searched.filter((row) => row.source === "partner").length,
    agent: searched.filter((row) => row.source === "agent").length,
  };

  const scoped = searched.filter((row) => who === "all" || row.source === who);

  const summary = scoped.reduce(
    (acc, row) => ({
      applications: acc.applications + row.applications,
      total: acc.total + row.total,
      pending: acc.pending + row.pending,
      approved: acc.approved + row.approved,
      paid: acc.paid + row.paid,
      rejected: acc.rejected + row.rejected,
      notEligible: acc.notEligible + row.notEligible,
      drafts: acc.drafts + row.drafts,
      payableCount: acc.payableCount + (row.approved > 0 ? 1 : 0),
      pendingCount: acc.pendingCount + (row.pending > 0 ? 1 : 0),
    }),
    {
      applications: 0,
      total: 0,
      pending: 0,
      approved: 0,
      paid: 0,
      rejected: 0,
      notEligible: 0,
      drafts: 0,
      payableCount: 0,
      pendingCount: 0,
    },
  );

  const rows = scoped
    .filter((row) =>
      show === "payable" ? row.approved > 0 : show === "pending" ? row.pending > 0 : true,
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "total") return b.total - a.total;
      return b.approved - a.approved || b.total - a.total;
    });

  const pageSize = parsePageSize(params.size);
  const page = parsePage(params.page, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  /**
   * LINKS
   */
  const rangeParams: Record<string, string> =
    range.mode === "custom"
      ? { from: range.from, to: range.to }
      : range.mode === "all"
        ? { range: "all" }
        : { month: range.month };

  const href = (overrides: {
    month?: string;
    allTime?: boolean;
    who?: string;
    show?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const nextSize = overrides.size ?? pageSize;
    const nextPage = overrides.page ?? 1;
    const nextSort = overrides.sort ?? sort;

    return periodHref("/admin/reports", {
      ...(overrides.allTime
        ? { range: "all" }
        : overrides.month
          ? { month: overrides.month }
          : rangeParams),
      who: overrides.who ?? who,
      show: overrides.show ?? show,
      sort: nextSort === "payable" ? undefined : nextSort,
      q: q || undefined,
      size: nextSize === PAGE_SIZES[0] ? undefined : String(nextSize),
      page: nextPage === 1 ? undefined : String(nextPage),
    });
  };

  const exportHref = periodHref("/api/admin/reports/partner-commissions", {
    ...rangeParams,
    who,
    format: "csv",
  });

  const currentMonth = new Date().toISOString().slice(0, 7);

  const cards = [
    {
      label: "Total commission",
      value: summary.total,
      hint: `${summary.applications} applications${
        summary.drafts ? ` · ${summary.drafts} drafts` : ""
      }`,
      className: "border-gray-200 bg-white",
      tone: "text-gray-900",
    },
    {
      label: "Pending review",
      value: summary.pending,
      hint: `${summary.pendingCount} referrers waiting`,
      className: "border-gray-200 bg-white",
      tone: "text-amber-600",
    },
    {
      label: "To pay now",
      value: summary.approved,
      hint: `${summary.payableCount} approved payouts`,
      className: "border-[#820ad1]/30 bg-[#820ad1]/[0.04]",
      tone: "text-[#820ad1]",
    },
    {
      label: "Paid",
      value: summary.paid,
      hint:
        summary.rejected > 0
          ? `${euro.format(summary.rejected)} rejected`
          : "in this period",
      className: "border-gray-200 bg-white",
      tone: "text-emerald-600",
    },
  ];

  return (
    <div className="min-w-0 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">
            Commission Report
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            What partners and agents earned, what is approved and what is paid
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* MONTH SWITCHER */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
            <Link
              href={href({ month: range.prevMonth })}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="min-w-0 flex-1 truncate px-2 text-center text-sm font-bold text-gray-900 sm:min-w-[9.5rem]">
              {range.label}
            </span>
            {range.nextMonth ? (
              <Link
                href={href({ month: range.nextMonth })}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center text-gray-200">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            {range.mode !== "month" || range.month !== currentMonth ? (
              <Link
                href={href({ month: currentMonth })}
                className="flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 sm:flex-none sm:text-sm"
              >
                This month
              </Link>
            ) : null}

            <Link
              href={href({ allTime: true })}
              aria-current={range.mode === "all" ? "true" : undefined}
              className={`flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-xl border px-3 text-xs font-semibold sm:flex-none sm:text-sm ${
                range.mode === "all"
                  ? "border-[#820ad1]/30 bg-[#820ad1]/5 text-[#820ad1]"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All time
            </Link>

            {/* CUSTOM RANGE */}
            <details className="group relative flex-1 sm:flex-none">
              <summary
                className={`flex h-10 cursor-pointer list-none items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold sm:text-sm [&::-webkit-details-marker]:hidden ${
                  range.mode === "custom"
                    ? "border-[#820ad1]/30 bg-[#820ad1]/5 text-[#820ad1]"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <CalendarRange className="h-4 w-4" />
                Custom
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <form
                action="/admin/reports"
                className="absolute right-0 z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
              >
                {who !== "all" ? <input type="hidden" name="who" value={who} /> : null}
                <label className="block text-xs font-semibold text-gray-600">
                  From
                  <input
                    type="date"
                    name="from"
                    required
                    defaultValue={range.from}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </label>
                <label className="block text-xs font-semibold text-gray-600">
                  To
                  <input
                    type="date"
                    name="to"
                    required
                    defaultValue={range.to}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </label>
                <button
                  type="submit"
                  className="h-10 w-full rounded-lg bg-[#820ad1] text-sm font-semibold text-white hover:bg-[#6f08b2]"
                >
                  Show range
                </button>
              </form>
            </details>

            <a
              href={exportHref}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/10 sm:flex-none sm:text-sm"
            >
              <Download className="h-4 w-4" />
              CSV
            </a>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${card.className}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className={`mt-1 text-xl font-black sm:text-2xl ${card.tone}`}>
              <CountUp value={card.value} format="euro" delay={150 + index * 60} />
            </p>
            <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {summary.total > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          <StatusBar row={summary} className="h-2.5" />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-gray-600">
            {[
              { key: "pending", label: "Pending", value: summary.pending },
              { key: "approved", label: "To pay", value: summary.approved },
              { key: "paid", label: "Paid", value: summary.paid },
              { key: "rejected", label: "Rejected", value: summary.rejected },
            ].map((item) => (
              <span key={item.key} className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_COLORS[item.key as keyof typeof STATUS_COLORS]}`}
                />
                {item.label} {euro.format(item.value)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* TOOLBAR */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <form action="/admin/reports" className="relative">
          {Object.entries(rangeParams).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          {who !== "all" ? <input type="hidden" name="who" value={who} /> : null}
          {show !== "all" ? <input type="hidden" name="show" value={show} /> : null}
          {sort !== "payable" ? <input type="hidden" name="sort" value={sort} /> : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search partner or agent name, email, company or ID…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
          />
        </form>

        <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-6">
          <FilterGroup
            label="Who"
            options={[
              { ...WHO[0], count: whoCounts.all },
              { ...WHO[1], count: whoCounts.partner, dot: "bg-[#820ad1]" },
              { ...WHO[2], count: whoCounts.agent, dot: "bg-amber-500" },
            ]}
            active={who}
            hrefFor={(value) => href({ who: value })}
          />
          <FilterGroup
            label="Show"
            options={[
              { ...SHOW[0], count: scoped.length },
              { ...SHOW[1], count: summary.payableCount, dot: "bg-[#820ad1]" },
              { ...SHOW[2], count: summary.pendingCount, dot: "bg-amber-400" },
            ]}
            active={show}
            hrefFor={(value) => href({ show: value })}
          />
          <div className="xl:ml-auto">
            <FilterGroup
              label="Sort"
              options={SORTS}
              active={sort}
              hrefFor={(value) => href({ sort: value })}
            />
          </div>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-500 sm:text-xs">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        Shows every commission in the period, whatever its status, including
        drafts. &quot;To pay&quot;
        is approved commission; use Mark paid after sending the transfer. Click a
        row for the breakdown and bank details.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No commission in this period</p>
          <p className="mt-1 text-xs text-gray-500">
            Try another month, filter or search.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,0.7fr)_minmax(0,1.8fr)_minmax(0,1fr)_7.5rem_1rem] gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid">
              <span>Partner / agent</span>
              <span className="text-right">Apps</span>
              <span>Commission split</span>
              <span className="text-right">To pay</span>
              <span />
              <span />
            </div>

            {pagedRows.map((row) => (
              <details
                key={row.key}
                className="group border-t border-gray-100 first:border-t-0"
              >
                <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 transition-colors hover:bg-[#820ad1]/[0.03] group-open:bg-[#820ad1]/[0.04] lg:grid-cols-[minmax(0,2.2fr)_minmax(0,0.7fr)_minmax(0,1.8fr)_minmax(0,1fr)_7.5rem_1rem] lg:items-center lg:gap-4 [&::-webkit-details-marker]:hidden">
                  {/* REFERRER */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        row.source === "agent"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[#820ad1]/10 text-[#820ad1]"
                      }`}
                    >
                      {initials(row.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        <span className="truncate">{row.name}</span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold uppercase ${
                            row.source === "agent"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-[#820ad1]/10 text-[#820ad1]"
                          }`}
                        >
                          {row.source}
                        </span>
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {[row.company, row.email].filter(Boolean).join(" · ") || row.code}
                      </p>
                    </div>
                  </div>

                  {/* TO PAY (MOBILE, TOP RIGHT) */}
                  <div className="text-right lg:hidden">
                    <p className="text-base font-black text-[#820ad1]">
                      {euro.format(row.approved)}
                    </p>
                    <p className="text-[11px] text-gray-500">to pay</p>
                  </div>

                  {/* APPS */}
                  <p className="hidden text-right text-sm font-semibold text-gray-900 lg:block">
                    {row.applications}
                  </p>

                  {/* SPLIT */}
                  <div className="col-span-2 min-w-0 lg:col-span-1">
                    <StatusBar row={row} />
                    <div className="mt-1 flex justify-between gap-2 text-[11px] text-gray-500">
                      <span>
                        {euro.format(row.total)} total
                        <span className="lg:hidden"> · {row.applications} apps</span>
                        {row.drafts ? (
                          <span className="text-gray-400"> · {row.drafts} drafts</span>
                        ) : null}
                      </span>
                      <span>
                        {row.pending > 0 ? (
                          <span className="text-amber-600">
                            {euro.format(row.pending)} pending
                          </span>
                        ) : null}
                        {row.pending > 0 && row.paid > 0 ? " · " : ""}
                        {row.paid > 0 ? (
                          <span className="text-emerald-600">
                            {euro.format(row.paid)} paid
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>

                  {/* TO PAY (DESKTOP) */}
                  <p className="hidden text-right text-base font-black text-[#820ad1] lg:block">
                    {euro.format(row.approved)}
                  </p>

                  {/* ACTION */}
                  <div className="col-span-2 flex items-center justify-between gap-2 lg:col-span-1 lg:justify-end">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 lg:hidden">
                      <Landmark className="h-3.5 w-3.5" />
                      {row.bank ? "Bank details on file" : "No bank details"}
                    </span>
                    <MarkPaidButton
                      source={row.source}
                      referrerKey={row.referrerKey}
                      name={row.name}
                      amount={row.approved}
                      count={row.approvedCount}
                      from={range.from}
                      to={range.to}
                      periodLabel={range.label}
                    />
                  </div>

                  <ChevronDown className="hidden h-4 w-4 text-gray-300 transition-transform group-open:rotate-180 lg:block" />
                </summary>

                {/* EXPANDED */}
                <div className="grid gap-3 border-t border-gray-100 bg-gray-50/60 px-4 py-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Breakdown · €{row.rate} per application
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        { label: "Pending", value: row.pending, tone: "text-amber-600" },
                        { label: "Approved", value: row.approved, tone: "text-[#820ad1]" },
                        { label: "Paid", value: row.paid, tone: "text-emerald-600" },
                        { label: "Rejected", value: row.rejected, tone: "text-red-600" },
                        { label: "Not eligible", value: row.notEligible, tone: "text-gray-500" },
                        {
                          label: row.drafts ? `Apps (${row.drafts} drafts)` : "Applications",
                          value: null,
                          count: row.applications,
                          tone: "text-gray-900",
                        },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg bg-gray-50 p-2">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            {item.label}
                          </dt>
                          <dd className={`mt-0.5 text-sm font-bold ${item.tone}`}>
                            {item.value === null ? item.count : euro.format(item.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <Link
                        href={periodHref("/admin/applications", {
                          q: row.source === "partner" ? row.code : row.name,
                          source: row.source,
                        })}
                        className="text-xs font-semibold text-[#820ad1] hover:underline"
                      >
                        View applications →
                      </Link>
                      {row.source === "partner" && row.code ? (
                        <Link
                          href={`/admin/partners/${encodeURIComponent(row.code)}`}
                          className="text-xs font-semibold text-[#820ad1] hover:underline"
                        >
                          Open partner →
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      <Landmark className="h-3.5 w-3.5" />
                      Payout details
                    </p>
                    {row.bank ? (
                      <dl className="mt-2 divide-y divide-gray-100">
                        <BankLine label="Account holder" value={row.bank.holder} />
                        <BankLine label="IBAN" value={row.bank.iban} />
                        <BankLine label="BIC / SWIFT" value={row.bank.bic} />
                        <BankLine label="Account no." value={row.bank.accountNumber} />
                        <BankLine label="IFSC" value={row.bank.ifsc} />
                        <BankLine label="Bank" value={row.bank.bankName} />
                        <BankLine label="Currency" value={row.bank.currency} />
                      </dl>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500">
                        No bank details on file. Ask the {row.source} to add them
                        in their profile before paying.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={rows.length}
            hrefFor={({ page: nextPage, size }) => href({ page: nextPage, size })}
          />
        </>
      )}
    </div>
  );
}
