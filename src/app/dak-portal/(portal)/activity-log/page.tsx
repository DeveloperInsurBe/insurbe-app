"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Download, History } from "lucide-react";

import { DAK_ACTIVITY_LOG, DAK_APPLICATIONS, type DakApplication } from "../../_data/mock";
import ApplicationDrawer from "../../_components/ApplicationDrawer";
import {
  Avatar,
  Button,
  downloadCsv,
  EmptyState,
  FilterChips,
  PageHeader,
  Panel,
  SearchInput,
  StatusBadge,
} from "../../_components/ui";

type ActorFilter = "all" | "reviewer" | "customer";

const isReviewer = (actor: string) => actor === "DAK Reviewer";

export default function DakActivityLogPage() {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState<ActorFilter>("all");
  const [selected, setSelected] = useState<DakApplication | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DAK_ACTIVITY_LOG.filter(
      (entry) =>
        (actor === "all" || (actor === "reviewer") === isReviewer(entry.actor)) &&
        (!q ||
          [entry.actor, entry.applicant, entry.applicationId, entry.event, entry.timestamp].some((value) =>
            value.toLowerCase().includes(q),
          )),
    );
  }, [query, actor]);

  // Group by day ("01. Sept. 2026, 14:00 CEST" -> "01. Sept. 2026").
  const groups = useMemo(() => {
    const map = new Map<string, typeof rows>();
    rows.forEach((entry) => {
      const [day] = entry.timestamp.split(",");
      map.set(day, [...(map.get(day) ?? []), entry]);
    });
    return [...map.entries()];
  }, [rows]);

  const exportCsv = () =>
    downloadCsv("dak-activity-log.csv", [
      ["Timestamp", "Actor", "Applicant", "Application ID", "Event", "From status", "To status"],
      ...rows.map((entry) => [entry.timestamp, entry.actor, entry.applicant, entry.applicationId, entry.event, entry.from ?? "", entry.to]),
    ]);

  const reviewerCount = DAK_ACTIVITY_LOG.filter((entry) => isReviewer(entry.actor)).length;

  return (
    <>
      <PageHeader
        title="Activity Log"
        subtitle="Immutable audit trail of all DAK application events"
        actions={
          <Button onClick={exportCsv}>
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
            { value: "all", label: "All events", count: DAK_ACTIVITY_LOG.length },
            { value: "reviewer", label: "DAK Reviewer", count: reviewerCount },
            { value: "customer", label: "Customers", count: DAK_ACTIVITY_LOG.length - reviewerCount },
          ]}
        />
      </div>

      {groups.length === 0 ? (
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
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : groupIndex * 0.06 }}
              >
                <h2 className="sticky top-16 z-10 -mx-1 mb-3 flex items-center gap-2 bg-[#f6f6fa]/90 px-1 py-1.5 text-sm font-semibold text-slate-700 backdrop-blur">
                  <CalendarDays className="h-4 w-4 text-violet-500" aria-hidden />
                  {day}
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {entries.length}
                  </span>
                </h2>

                <ol className="relative space-y-3 border-l-2 border-dashed border-slate-200 pl-6 sm:ml-2">
                  {entries.map((entry) => {
                    const time = entry.timestamp.split(",")[1]?.trim() ?? "";
                    const app = DAK_APPLICATIONS.find((item) => item.id === entry.applicationId) ?? null;
                    return (
                      <li key={entry.timestamp + entry.event} className="relative">
                        <span
                          className={`absolute -left-[33px] top-5 h-4 w-4 rounded-full border-[3px] border-[#f6f6fa] ${
                            isReviewer(entry.actor) ? "bg-violet-500" : "bg-sky-500"
                          }`}
                          aria-hidden
                        />
                        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-violet-200 hover:shadow-md">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <Avatar name={entry.actor} />
                              <div className="min-w-0">
                                <p className="text-sm text-slate-900">
                                  <span className="font-semibold">{entry.actor}</span>{" "}
                                  <span className="text-slate-600">· {entry.event}</span>
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setSelected(app)}
                                  disabled={!app}
                                  className="mt-0.5 text-sm font-medium text-violet-700 hover:underline disabled:no-underline"
                                >
                                  {entry.applicant}
                                  <span className="ml-1.5 font-mono text-xs font-normal text-slate-500">{entry.applicationId}</span>
                                </button>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs text-slate-400">{time}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                            {entry.from && (
                              <>
                                <StatusBadge status={entry.from} />
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                              </>
                            )}
                            <StatusBadge status={entry.to} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ApplicationDrawer application={selected} onClose={() => setSelected(null)} />
    </>
  );
}
