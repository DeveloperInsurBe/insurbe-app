import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import { ensureDakCases, listInclude, serializeListRow } from "@/lib/dak/cases";
import { DAK_FINAL_STATUSES, DAK_STATUSES, isDakStatus, type DakStatus } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";
import { FilterGroup, initials } from "../adminUi";
import CountUp from "../CountUp";
import Pagination, { PAGE_SIZES, parsePage, parsePageSize } from "../Pagination";
import { periodHref } from "../partners/publicInsurance";
import { DAK_STATUS_TONE, DakHeader, DakStatusBadge, formatDate, openTicketCount } from "./shared";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

type Params = { status?: string; q?: string; page?: string; size?: string };

export default async function AdminDakPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const status: DakStatus | "all" | "overdue" =
    params.status === "overdue" ? "overdue" : isDakStatus(params.status) ? params.status : "all";
  const q = (params.q || "").trim().toLowerCase();

  await ensureDakCases();
  const now = new Date();

  const [cases, activations, tickets] = await Promise.all([
    prisma.dakCase.findMany({
      include: {
        ...listInclude,
        events: {
          where: { actorType: "reviewer" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { actorName: true, createdAt: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.dakEvent.findMany({
      where: { toStatus: "Active" },
      select: { createdAt: true, case: { select: { submittedAt: true } } },
    }),
    openTicketCount(),
  ]);

  const all = cases.map((item) => ({
    ...serializeListRow(item, now),
    lastReviewer: item.events[0]?.actorName ?? null,
    lastActionAt: item.events[0]?.createdAt.toISOString() ?? null,
  }));

  /* ------------------------------ STATS ------------------------------ */
  const counts = Object.fromEntries(DAK_STATUSES.map((value) => [value, 0])) as Record<DakStatus, number>;
  all.forEach((row) => (counts[row.status] += 1));
  const open = all.filter((row) => !DAK_FINAL_STATUSES.includes(row.status)).length;
  const overdue = all.filter((row) => row.due === "overdue").length;
  const avgDays = activations.length
    ? Math.round(
        activations.reduce((sum, event) => sum + (event.createdAt.getTime() - event.case.submittedAt.getTime()), 0) /
          activations.length /
          DAY_MS,
      )
    : null;

  const stats = [
    { label: "Applications", value: all.length, hint: `${open} still open`, tone: "text-gray-900" },
    { label: "Waiting for DAK", value: counts.Submitted + counts["Customer Responded"], hint: "new or customer replied", tone: "text-blue-600" },
    { label: "Overdue requests", value: overdue, hint: "customer past due date", tone: "text-red-600" },
    { label: "Active", value: counts.Active, hint: avgDays === null ? "none yet" : `Ø ${avgDays} days to active`, tone: "text-emerald-600" },
  ];

  /* ------------------------------ FILTER ----------------------------- */
  const filtered = all.filter(
    (row) =>
      (status === "all" || (status === "overdue" ? row.due === "overdue" : row.status === status)) &&
      (!q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)),
  );

  const pageSize = parsePageSize(params.size);
  const page = parsePage(params.page, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const href = (overrides: { status?: string; page?: number; size?: number }) => {
    const nextSize = overrides.size ?? pageSize;
    const nextPage = overrides.page ?? 1;
    return periodHref("/admin/dak", {
      status: overrides.status ?? status,
      q: params.q || undefined,
      size: nextSize === PAGE_SIZES[0] ? undefined : String(nextSize),
      page: nextPage === 1 ? undefined : String(nextPage),
    });
  };

  return (
    <div className="min-w-0 space-y-4">
      <DakHeader
        active="applications"
        title="DAK applications"
        subtitle="Live status of every DAK application. Read-only: DAK reviewers make all decisions in their portal."
        badges={{ support: tickets }}
      />

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((card, index) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className={`mt-1 text-xl font-black sm:text-2xl ${card.tone}`}>
              <CountUp value={card.value} delay={150 + index * 60} />
            </p>
            <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <form action="/admin/dak" className="relative">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          {pageSize !== PAGE_SIZES[0] ? <input type="hidden" name="size" value={pageSize} /> : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Search name, email or application ID (IB-DAK-…)"
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
          />
        </form>

        <FilterGroup
          label="Status"
          options={[
            { value: "all", label: "All", count: all.length },
            ...DAK_STATUSES.map((value) => ({ value, label: value, count: counts[value], dot: DAK_STATUS_TONE[value].dot })),
            { value: "overdue", label: "Overdue", count: overdue, dot: "bg-red-500" },
          ]}
          active={status}
          hrefFor={(value) => href({ status: value })}
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No DAK applications found</p>
          <p className="mt-1 text-xs text-gray-500">Try another search or status.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="hidden border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,1.3fr)_1.25rem] lg:gap-4">
              <span>Applicant</span>
              <span>Application</span>
              <span>Submitted</span>
              <span>Status</span>
              <span>Requests</span>
              <span>Last reviewer action</span>
              <span />
            </div>

            {rows.map((row) => (
              <Link
                key={row.id}
                href={`/admin/dak/${encodeURIComponent(row.id)}`}
                className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 transition-colors first:border-t-0 hover:bg-[#820ad1]/[0.03] lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,1.3fr)_1.25rem] lg:items-center lg:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-xs font-black text-[#820ad1]">
                    {initials(row.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{row.name}</p>
                    <p className="truncate text-xs text-gray-500">{row.email || "—"}</p>
                  </div>
                  <div className="shrink-0 lg:hidden">
                    <DakStatusBadge status={row.status} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-gray-700">{row.id}</p>
                  <p className="truncate text-[11px] text-gray-500">{row.category ?? "—"}</p>
                </div>
                <p className="text-xs text-gray-600">{formatDate(row.submittedAt)}</p>
                <div className="hidden items-center gap-1.5 lg:flex">
                  <DakStatusBadge status={row.status} />
                  {row.due === "overdue" ? (
                    <span className="rounded-full bg-red-50 px-1.5 py-px text-[10px] font-bold text-red-600">Overdue</span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-600">{row.openRequests ? `${row.openRequests} open` : "—"}</p>
                <div className="min-w-0 text-xs">
                  {row.lastReviewer ? (
                    <>
                      <p className="truncate font-semibold text-gray-700">{row.lastReviewer}</p>
                      <p className="text-[11px] text-gray-500">{formatDate(row.lastActionAt, true)}</p>
                    </>
                  ) : (
                    <span className="text-gray-400">Not picked up yet</span>
                  )}
                </div>
                <ChevronRight className="hidden h-4 w-4 text-gray-300 lg:block" />
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            hrefFor={({ page: nextPage, size }) => href({ page: nextPage, size })}
          />
        </>
      )}
    </div>
  );
}
