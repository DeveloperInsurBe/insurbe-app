"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowDownUp, ArrowUp, ChevronDown, ChevronRight, Download, LayoutGrid, Rows3, SearchX } from "lucide-react";

import { DAK_CATEGORIES, DAK_STATUSES, isDakStatus, type DakCategory, type DakStatus } from "@/lib/dak/statuses";
import { api, applicationHref, fmtDate, type DakListRow } from "../../_lib/client";
import {
  Avatar,
  Button,
  downloadCsv,
  EmptyState,
  ErrorState,
  FilterChips,
  LoadingState,
  PageHeader,
  Pagination,
  Panel,
  SearchInput,
  Segmented,
  STATUS_META,
  StatusBadge,
  TD,
  TH,
} from "../../_components/ui";

const PAGE_SIZE = 10;

type SortKey = "submitted" | "start" | "age";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;
type View = "table" | "cards";

const ageTone = (app: DakListRow) =>
  app.due === "overdue"
    ? "bg-rose-50 text-rose-700"
    : app.due === "due_soon" || app.status === "Submitted" || app.status === "Customer Responded"
      ? "bg-amber-50 text-amber-700"
      : "bg-slate-100 text-slate-600";

function AgePill({ app }: { app: DakListRow }) {
  if (app.ageDays == null) return <span className="text-slate-300">—</span>;
  return (
    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${ageTone(app)}`} title={app.due === "overdue" ? "Request overdue" : undefined}>
      {app.ageDays}d
    </span>
  );
}

function RequestsPill({ count }: { count: number }) {
  if (!count) return <span className="text-slate-300">—</span>;
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-800">
      {count}
    </span>
  );
}

export default function DakApplicationsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [applications, setApplications] = useState<DakListRow[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DakStatus | "all">("all");
  const [category, setCategory] = useState<DakCategory | "">("");
  const [sort, setSort] = useState<Sort>(null);
  const [view, setView] = useState<View>("table");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setError("");
    api<{ applications: DakListRow[] }>("/applications")
      .then((data) => setApplications(data.applications))
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(load, [load]);

  // Deep links from the dashboard (?status=…).
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("status");
    if (isDakStatus(value)) setStatus(value);
  }, []);

  const all = useMemo(() => applications ?? [], [applications]);

  const statusChips = useMemo(() => {
    const counts = new Map<DakStatus, number>();
    all.forEach((app) => counts.set(app.status, (counts.get(app.status) ?? 0) + 1));
    return [
      { value: "all" as const, label: "All", count: all.length },
      ...DAK_STATUSES.filter((value) => counts.has(value) || value === status).map((value) => ({
        value,
        label: STATUS_META[value].label,
        count: counts.get(value) ?? 0,
      })),
    ];
  }, [all, status]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter(
      (app) =>
        (!q || app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q) || app.email.toLowerCase().includes(q)) &&
        (status === "all" || app.status === status) &&
        (!category || app.category === category),
    );
    if (!sort) return filtered;
    const value = (app: DakListRow) =>
      sort.key === "submitted" ? app.submittedAt : sort.key === "start" ? app.startDate ?? "" : app.ageDays ?? -1;
    return [...filtered].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      const result = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? result : -result;
    });
  }, [all, query, status, category, sort]);

  // Back to the first page whenever the result set changes.
  useEffect(() => setPage(1), [query, status, category, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSort = (key: SortKey) =>
    setSort((current) => (current?.key !== key ? { key, dir: "desc" } : current.dir === "desc" ? { key, dir: "asc" } : null));

  const SortTh = ({ label, sortKey, right }: { label: string; sortKey: SortKey; right?: boolean }) => {
    const active = sort?.key === sortKey;
    const Icon = !active ? ArrowDownUp : sort.dir === "desc" ? ArrowDown : ArrowUp;
    return (
      <th className={`${TH} ${right ? "text-right" : ""}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => toggleSort(sortKey)}
          className={`inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-slate-900 ${active ? "text-violet-700" : ""}`}
        >
          {label}
          <Icon className="h-3 w-3" aria-hidden />
        </button>
      </th>
    );
  };

  const exportCsv = () =>
    downloadCsv("dak-applications.csv", [
      ["Applicant", "Email", "Date of birth", "Application ID", "Category", "Submitted", "Start date", "Status", "Open requests", "Age (days)"],
      ...rows.map((app) => [
        app.name,
        app.email,
        fmtDate(app.birthDate),
        app.id,
        app.category ?? "",
        fmtDate(app.submittedAt),
        fmtDate(app.startDate),
        app.status,
        app.openRequests,
        app.ageDays ?? "",
      ]),
    ]);

  const empty = (
    <EmptyState icon={<SearchX className="h-6 w-6" />} title="No applications found" text="Try a different search or filter." />
  );

  const body = error ? (
    <Panel>
      <ErrorState message={error} onRetry={load} />
    </Panel>
  ) : !applications ? (
    <LoadingState label="Loading applications…" />
  ) : null;

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle={applications ? `${applications.length} total registrations in the DAK queue` : "DAK queue"}
        actions={
          <Button onClick={exportCsv} disabled={!rows.length}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      {/* TOOLBAR */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name, email or ID…" className="md:max-w-sm md:flex-1" />
        <label className="relative block md:w-56">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as DakCategory | "")}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-sm text-slate-700 transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
          >
            <option value="">All categories</option>
            {DAK_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        </label>
        <div className="hidden md:ml-auto md:block">
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "table", label: "Table view", icon: <Rows3 className="h-4 w-4" /> },
              { value: "cards", label: "Card view", icon: <LayoutGrid className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      <div className="mb-5">
        <FilterChips label="status" options={statusChips} value={status} onChange={setStatus} />
      </div>

      {body}

      {/* TABLE (desktop) */}
      {!body && view === "table" && (
        <Panel className="hidden md:block">
          {rows.length === 0 ? (
            empty
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="border-b border-slate-100 bg-slate-50/60">
                  <tr>
                    <th className={TH}>Applicant</th>
                    <th className={TH}>Application ID</th>
                    <th className={TH}>Category</th>
                    <SortTh label="Submitted" sortKey="submitted" />
                    <SortTh label="Start" sortKey="start" />
                    <th className={TH}>Status</th>
                    <th className={`${TH} text-center`}>Requests</th>
                    <SortTh label="Age" sortKey="age" right />
                    <th className="w-10" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {pageRows.map((app, index) => (
                      <motion.tr
                        key={app.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.3) }}
                        onClick={() => router.push(applicationHref(app.id))}
                        className="group cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-violet-50/40"
                      >
                        <td className={TD}>
                          <Link
                            href={applicationHref(app.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="flex items-center gap-3 text-left"
                          >
                            <Avatar name={app.name} />
                            <span>
                              <span className="block font-medium text-slate-900 group-hover:text-violet-800">{app.name}</span>
                              <span className="block text-xs text-slate-500">{fmtDate(app.birthDate)}</span>
                            </span>
                          </Link>
                        </td>
                        <td className={`${TD} font-mono text-[13px] text-slate-500`}>{app.id}</td>
                        <td className={`${TD} text-slate-600`}>{app.category ?? "—"}</td>
                        <td className={`${TD} text-slate-700`}>{fmtDate(app.submittedAt)}</td>
                        <td className={`${TD} text-slate-700`}>{fmtDate(app.startDate)}</td>
                        <td className={TD}>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className={`${TD} text-center`}>
                          <RequestsPill count={app.openRequests} />
                        </td>
                        <td className={`${TD} text-right`}>
                          <AgePill app={app} />
                        </td>
                        <td className="pr-4">
                          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" aria-hidden />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {/* CARDS (mobile always, desktop when selected) */}
      {!body && (
        <div className={view === "table" ? "md:hidden" : ""}>
          {rows.length === 0 ? (
            <Panel>{empty}</Panel>
          ) : (
            <motion.ul layout={!reduceMotion} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {pageRows.map((app, index) => (
                  <motion.li
                    key={app.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.3) }}
                  >
                    <Link
                      href={applicationHref(app.id)}
                      className="group block h-full w-full rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={app.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{app.name}</p>
                          <p className="font-mono text-xs text-slate-500">{app.id}</p>
                        </div>
                        <AgePill app={app} />
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <StatusBadge status={app.status} />
                        {app.category && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{app.category}</span>
                        )}
                      </div>
                      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                        <div>
                          <dt className="text-slate-400">Submitted</dt>
                          <dd className="mt-0.5 font-medium text-slate-700">{fmtDate(app.submittedAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Start</dt>
                          <dd className="mt-0.5 font-medium text-slate-700">{fmtDate(app.startDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Requests</dt>
                          <dd className="mt-0.5">
                            <RequestsPill count={app.openRequests} />
                          </dd>
                        </div>
                      </dl>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      )}

      {!body && <Pagination page={currentPage} pageSize={PAGE_SIZE} total={rows.length} onChange={changePage} />}
    </>
  );
}
