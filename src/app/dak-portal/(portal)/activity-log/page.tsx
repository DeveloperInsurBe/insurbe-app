"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Download, History } from "lucide-react";

import type { DakStatus } from "@/lib/dak/statuses";
import { api, applicationHref, dayKey, fmtDateTime } from "../../_lib/client";
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
  StatusBadge,
} from "../../_components/ui";

const PAGE_SIZE = 20;

type ActorFilter = "all" | "reviewer" | "customer";

type ActivityEvent = {
  id: string;
  createdAt: string;
  actorType: "customer" | "reviewer" | "system";
  actorName: string;
  applicationId: string;
  applicant: string;
  event: string;
  note: string | null;
  fromStatus: DakStatus | null;
  toStatus: DakStatus | null;
};

const timeOf = (value: string) => fmtDateTime(value).split(", ")[1] ?? "";

export default function DakActivityLogPage() {
  const reduceMotion = useReducedMotion();
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState<ActorFilter>("all");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setError("");
    api<{ events: ActivityEvent[] }>("/activity")
      .then((data) => setEvents(data.events))
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(load, [load]);

  const all = useMemo(() => events ?? [], [events]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (entry) =>
        (actor === "all" || entry.actorType === actor) &&
        (!q ||
          [entry.actorName, entry.applicant, entry.applicationId, entry.event, fmtDateTime(entry.createdAt)].some((value) =>
            value.toLowerCase().includes(q),
          )),
    );
  }, [all, query, actor]);

  // Back to the first page whenever the result set changes.
  useEffect(() => setPage(1), [query, actor]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  // Group the current page by day ("20. Aug. 2026").
  const groups = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).forEach((entry) => {
      const day = dayKey(entry.createdAt);
      map.set(day, [...(map.get(day) ?? []), entry]);
    });
    return [...map.entries()];
  }, [rows, currentPage]);

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportCsv = () =>
    downloadCsv("dak-activity-log.csv", [
      ["Timestamp", "Actor", "Applicant", "Application ID", "Event", "From status", "To status"],
      ...rows.map((entry) => [
        fmtDateTime(entry.createdAt),
        entry.actorName,
        entry.applicant,
        entry.applicationId,
        entry.event,
        entry.fromStatus ?? "",
        entry.toStatus ?? "",
      ]),
    ]);

  const reviewerCount = all.filter((entry) => entry.actorType === "reviewer").length;
  const customerCount = all.filter((entry) => entry.actorType === "customer").length;

  return (
    <>
      <PageHeader
        title="Activity Log"
        subtitle="Immutable audit trail of all DAK application events"
        actions={
          <Button onClick={exportCsv} disabled={!rows.length}>
            <Download className="h-4 w-4" aria-hidden /> Export
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search events…" className="md:max-w-sm md:flex-1" />
        <FilterChips
          label="actor"
          value={actor}
          onChange={setActor}
          options={[
            { value: "all", label: "All events", count: all.length },
            { value: "reviewer", label: "DAK Reviewer", count: reviewerCount },
            { value: "customer", label: "Customers", count: customerCount },
          ]}
        />
      </div>

      {error && !events ? (
        <Panel>
          <ErrorState message={error} onRetry={load} />
        </Panel>
      ) : !events ? (
        <LoadingState label="Loading activity…" />
      ) : groups.length === 0 ? (
        <Panel>
          <EmptyState icon={<History className="h-6 w-6" />} title="No events found" text="Try a different search or filter." />
        </Panel>
      ) : (
        <div className="space-y-8">
          <AnimatePresence initial={false}>
            {groups.map(([day, entries], groupIndex) => (
              <motion.section
                key={day}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(groupIndex * 0.06, 0.3) }}
              >
                <h2 className="sticky top-16 z-10 -mx-1 mb-3 flex items-center gap-2 bg-[#f6f6fa]/90 px-1 py-1.5 text-sm font-semibold text-slate-700 backdrop-blur">
                  <CalendarDays className="h-4 w-4 text-violet-500" aria-hidden />
                  {day}
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {entries.length}
                  </span>
                </h2>

                <ol className="relative space-y-3 border-l-2 border-dashed border-slate-200 pl-6 sm:ml-2">
                  {entries.map((entry) => (
                    <li key={entry.id} className="relative">
                      <span
                        className={`absolute -left-[33px] top-5 h-4 w-4 rounded-full border-[3px] border-[#f6f6fa] ${
                          entry.actorType === "customer" ? "bg-sky-500" : "bg-violet-500"
                        }`}
                        aria-hidden
                      />
                      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-violet-200 hover:shadow-md">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <Avatar name={entry.actorName} />
                            <div className="min-w-0">
                              <p className="text-sm text-slate-900">
                                <span className="font-semibold">{entry.actorName}</span>{" "}
                                <span className="text-slate-600">· {entry.event}</span>
                              </p>
                              <Link
                                href={applicationHref(entry.applicationId)}
                                className="mt-0.5 inline-block text-sm font-medium text-violet-700 hover:underline"
                              >
                                {entry.applicant}
                                <span className="ml-1.5 font-mono text-xs font-normal text-slate-500">{entry.applicationId}</span>
                              </Link>
                            </div>
                          </div>
                          <span className="shrink-0 text-xs text-slate-400">{timeOf(entry.createdAt)}</span>
                        </div>
                        {entry.toStatus && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                            {entry.fromStatus && entry.fromStatus !== entry.toStatus && (
                              <>
                                <StatusBadge status={entry.fromStatus} />
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                              </>
                            )}
                            <StatusBadge status={entry.toStatus} />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </motion.section>
            ))}
          </AnimatePresence>
          <Pagination page={currentPage} pageSize={PAGE_SIZE} total={rows.length} onChange={changePage} />
        </div>
      )}
    </>
  );
}
