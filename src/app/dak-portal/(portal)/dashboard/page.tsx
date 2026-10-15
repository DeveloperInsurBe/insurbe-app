"use client";

import { useMemo, useState } from "react";
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
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import {
  DAK_ACTION_QUEUE,
  DAK_APPLICATIONS,
  DAK_DASHBOARD_STATS,
  DAK_DOCUMENTS,
  DAK_OVERDUE_REQUESTS,
  DAK_RECENT_ACTIVITY,
  DAK_REVIEWER,
  type DakApplication,
  type DakStatus,
} from "../../_data/mock";
import ApplicationDrawer from "../../_components/ApplicationDrawer";
import { Avatar, CountUp, FadeIn, Panel, STATUS_META, StatusBadge } from "../../_components/ui";

const STAT_STYLE: Record<
  (typeof DAK_DASHBOARD_STATS)[number]["tone"],
  { icon: LucideIcon; tint: string; status?: DakStatus }
> = {
  blue: { icon: FileText, tint: "bg-blue-50 text-blue-600 ring-blue-100", status: "Submitted" },
  violet: { icon: Clock3, tint: "bg-violet-50 text-violet-600 ring-violet-100", status: "In Review" },
  amber: { icon: AlertCircle, tint: "bg-amber-50 text-amber-600 ring-amber-100", status: "Information Required" },
  sky: { icon: MessageSquare, tint: "bg-sky-50 text-sky-600 ring-sky-100", status: "Customer Responded" },
  emerald: { icon: CircleCheck, tint: "bg-emerald-50 text-emerald-600 ring-emerald-100", status: "Approved" },
};

function StatusDonut() {
  const reduceMotion = useReducedMotion();
  const segments = useMemo(() => {
    const counts = new Map<DakStatus, number>();
    DAK_APPLICATIONS.forEach((app) => counts.set(app.status, (counts.get(app.status) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);
  const total = DAK_APPLICATIONS.length;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map(([status, count], index) => {
            const length = (count / total) * circumference;
            const dash = `${Math.max(length - 3, 0)} ${circumference}`;
            const circle = (
              <motion.circle
                key={status}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={STATUS_META[status].color}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-slate-900">
            <CountUp value={total} />
          </span>
          <span className="text-xs text-slate-500">applications</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {segments.map(([status, count]) => (
          <li key={status} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_META[status].color }} aria-hidden />
            <span className="flex-1 text-slate-600">{STATUS_META[status].label}</span>
            <span className="font-medium text-slate-900">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DakDashboardPage() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<DakApplication | null>(null);

  const pendingDocs = DAK_DOCUMENTS.filter((document) => document.review === "Pending").length;
  const attention = DAK_OVERDUE_REQUESTS.reduce((sum, item) => sum + item.open, 0) + DAK_ACTION_QUEUE.length;
  const openApp = (id: string) => setSelected(DAK_APPLICATIONS.find((app) => app.id === id) ?? null);

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
              <p className="text-sm text-violet-200">Last login {DAK_REVIEWER.lastLogin}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, {DAK_REVIEWER.name}</h1>
              <p className="mt-2 max-w-lg text-sm text-violet-100/90">
                You have <span className="font-semibold text-white">{attention} items</span> waiting for your attention and{" "}
                <span className="font-semibold text-white">{pendingDocs} documents</span> to review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dak-portal/applications"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-50"
              >
                Review queue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/dak-portal/documents"
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
        {DAK_DASHBOARD_STATS.map((stat, index) => {
          const style = STAT_STYLE[stat.tone];
          const Icon = style.icon;
          return (
            <FadeIn key={stat.key} index={index + 1}>
              <Link
                href={`/dak-portal/applications${style.status ? `?status=${encodeURIComponent(style.status)}` : ""}`}
                className="group block h-full rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${style.tint}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-violet-500" aria-hidden />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                  <CountUp value={stat.value} />
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
              <Link href="/dak-portal/applications" className="group inline-flex items-center gap-1 text-sm font-medium text-violet-700">
                All applications
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            }
            className="h-full"
          >
            <ul className="divide-y divide-slate-100">
              {DAK_ACTION_QUEUE.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => openApp(row.id)}
                    className="group flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
                  >
                    <Avatar name={row.name} />
                    <span className="min-w-[140px] flex-1">
                      <span className="block font-medium text-slate-900">{row.name}</span>
                      <span className="block text-xs text-slate-500">
                        {row.category} · {row.id}
                      </span>
                    </span>
                    <StatusBadge status={row.status} />
                    <span className="hidden text-sm text-slate-500 sm:block">Starts {row.startDate}</span>
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{row.age}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </FadeIn>

        {/* STATUS DONUT */}
        <FadeIn index={7}>
          <Panel title="Status overview" padded className="h-full">
            <StatusDonut />
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
            <ul className="divide-y divide-amber-200/50">
              {DAK_OVERDUE_REQUESTS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openApp(item.id)}
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
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </FadeIn>

        {/* RECENT ACTIVITY */}
        <FadeIn index={9} className="lg:row-span-1">
          <Panel
            title="Recent Activity"
            action={
              <Link href="/dak-portal/activity-log" className="text-sm font-medium text-violet-700 hover:underline">
                View all
              </Link>
            }
          >
            <ol className="px-5 py-3">
              {DAK_RECENT_ACTIVITY.map((item, index) => (
                <li key={`${item.name}-${item.event}-${index}`} className="relative flex gap-3 pb-4 last:pb-1">
                  {index < DAK_RECENT_ACTIVITY.length - 1 && (
                    <span className="absolute left-[13px] top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200" aria-hidden />
                  )}
                  <Avatar name={item.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.event}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">{item.ago}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </FadeIn>
      </div>

      <ApplicationDrawer application={selected} onClose={() => setSelected(null)} />
    </>
  );
}
