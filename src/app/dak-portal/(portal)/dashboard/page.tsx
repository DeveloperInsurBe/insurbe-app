"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  Clock3,
  FileText,
  FolderOpen,
  Inbox,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { isDakStatus, type DakStatus } from "@/lib/dak/statuses";
import { api, applicationHref, BASE, fmtAgo, fmtDate, type DakListRow } from "../../_lib/client";
import { useReviewer } from "../../_components/PortalShell";
import { Avatar, CountUp, EmptyState, ErrorState, FadeIn, LoadingState, Panel, STATUS_META, StatusBadge } from "../../_components/ui";

type Dashboard = {
  counts: Record<DakStatus, number>;
  total: number;
  queue: DakListRow[];
  overdue: { id: string; name: string; open: number }[];
  recent: { id: string; applicationId: string; name: string; status: string | null; createdAt: string }[];
  pendingDocuments: number;
};

const STATS: { status: DakStatus; label: string; icon: LucideIcon; tint: string }[] = [
  { status: "Submitted", label: "New Submissions", icon: FileText, tint: "bg-blue-50 text-blue-600 ring-blue-100" },
  { status: "In Review", label: "In Review", icon: Clock3, tint: "bg-violet-50 text-violet-600 ring-violet-100" },
  { status: "Information Required", label: "Info Required", icon: AlertCircle, tint: "bg-amber-50 text-amber-600 ring-amber-100" },
  { status: "Customer Responded", label: "Customer Responded", icon: MessageSquare, tint: "bg-sky-50 text-sky-600 ring-sky-100" },
  { status: "Approved", label: "Pending Allocation", icon: CircleCheck, tint: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
];

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

/** The dashboard refreshes itself so new submissions and replies show up. */
const REFRESH_EVERY_MS = 60_000;

export default function DakDashboardPage() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const { name } = useReviewer();

  const load = useCallback(() => {
    api<Dashboard>("/dashboard")
      .then((next) => {
        setData(next);
        setError("");
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_EVERY_MS);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  if (error && !data) {
    return (
      <Panel>
        <ErrorState message={error} onRetry={load} />
      </Panel>
    );
  }
  if (!data) {
    return (
      <LoadingState label="Loading dashboard…" fill />
    );
  }

  const attention = data.counts.Submitted + data.counts["Customer Responded"] + data.overdue.length;

  return (
    <>
      {/* WELCOME */}
      <FadeIn>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2e1065] via-[#5b21b6] to-[#8b2be2] p-6 text-white shadow-xl shadow-violet-900/20 sm:p-8">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <motion.div
              className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl"
              animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
            />
          </div>
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {greeting()}
                {name ? `, ${name}` : ""}
              </h1>
              <p className="mt-2 max-w-lg text-sm text-violet-100/90">
                You have <span className="font-semibold text-white">{attention} items</span> waiting for your attention and{" "}
                <span className="font-semibold text-white">{data.pendingDocuments} documents</span> to review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`${BASE}/applications`}
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-50"
              >
                Review queue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href={`${BASE}/documents`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
              >
                <FolderOpen className="h-4 w-4" aria-hidden /> Documents
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <FadeIn key={stat.status} index={index + 1}>
              <Link
                href={`${BASE}/applications?status=${encodeURIComponent(stat.status)}`}
                className="group block h-full rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${stat.tint}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-violet-500" aria-hidden />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                  <CountUp value={data.counts[stat.status]} />
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{stat.label}</p>
              </Link>
            </FadeIn>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ACTION QUEUE */}
        <FadeIn index={6} className="lg:col-span-2">
          <Panel
            title="Action Queue"
            action={
              <Link href={`${BASE}/applications`} className="group inline-flex items-center gap-1 text-sm font-medium text-violet-700">
                All applications
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            }
            className="h-full"
          >
            {data.queue.length === 0 ? (
              <EmptyState icon={<Inbox className="h-6 w-6" />} title="All caught up" text="No new submissions or customer replies." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.queue.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={applicationHref(row.id)}
                      className="group flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
                    >
                      <Avatar name={row.name} />
                      <span className="min-w-[140px] flex-1">
                        <span className="block font-medium text-slate-900">{row.name}</span>
                        <span className="block text-xs text-slate-500">
                          {row.category ?? "—"} · {row.id}
                        </span>
                      </span>
                      <StatusBadge status={row.status} />
                      <span className="hidden text-sm text-slate-500 sm:block">Submitted {fmtDate(row.submittedAt)}</span>
                      {row.ageDays != null && (
                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{row.ageDays}d</span>
                      )}
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </FadeIn>

        {/* RECENT ACTIVITY */}
        <FadeIn index={7} className="lg:row-span-2">
          <Panel
            title="Recent Activity"
            className="h-full"
            action={
              <Link href={`${BASE}/activity-log`} className="text-sm font-medium text-violet-700 hover:underline">
                View all
              </Link>
            }
          >
            {data.recent.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ol className="px-5 py-3">
                {data.recent.map((item, index) => (
                  <li key={item.id} className="relative flex gap-3 pb-4 last:pb-1">
                    {index < data.recent.length - 1 && (
                      <span className="absolute left-[13px] top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200" aria-hidden />
                    )}
                    <Avatar name={item.name} size="sm" />
                    <Link href={applicationHref(item.applicationId)} className="min-w-0 flex-1 hover:underline">
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{isDakStatus(item.status) ? STATUS_META[item.status].label : item.status}</p>
                    </Link>
                    <span className="shrink-0 text-[11px] text-slate-400">{fmtAgo(item.createdAt)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </FadeIn>

        {/* OVERDUE */}
        <FadeIn index={8} className="lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-amber-50/60 to-white">
            <div className="flex items-center gap-2.5 border-b border-amber-200/60 px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertCircle className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="text-[15px] font-semibold text-amber-900">Overdue Information Requests</h2>
            </div>
            {data.overdue.length === 0 ? (
              <p className="px-5 py-6 text-sm text-amber-900/70">No overdue requests.</p>
            ) : (
              <ul className="divide-y divide-amber-200/50">
                {data.overdue.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={applicationHref(item.id)}
                      className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-amber-100/40"
                    >
                      <Avatar name={item.name} size="sm" />
                      <span className="flex-1">
                        <span className="font-medium text-slate-900">{item.name}</span>
                        <span className="ml-2 text-sm text-slate-500">{item.id}</span>
                      </span>
                      <span className="text-sm font-semibold text-amber-700">
                        {item.open} open {item.open === 1 ? "request" : "requests"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-amber-400 transition group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </FadeIn>

      </div>
    </>
  );
}
