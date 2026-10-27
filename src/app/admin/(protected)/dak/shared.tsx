import Link from "next/link";

import type { DakStatus } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

export const DAK_STATUS_TONE: Record<DakStatus, { badge: string; dot: string }> = {
  Submitted: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "In Review": { badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  "Information Required": { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  "Customer Responded": { badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  Approved: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Active: { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  "Not Eligible": { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  Cancelled: { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

export function DakStatusBadge({ status }: { status: DakStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DAK_STATUS_TONE[status].badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DAK_STATUS_TONE[status].dot}`} />
      {status}
    </span>
  );
}

const TZ = "Europe/Berlin";

export const formatDate = (value: Date | string | null | undefined, withTime = false) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

const TABS = [
  { key: "applications", label: "Applications", href: "/admin/dak" },
  { key: "reviewers", label: "Reviewers", href: "/admin/dak/reviewers" },
  { key: "support", label: "Support", href: "/admin/dak/support" },
] as const;

/** Header + tabs shared by the DAK section pages. */
export function DakHeader({
  active,
  title,
  subtitle,
  badges = {},
}: {
  active: (typeof TABS)[number]["key"];
  title: string;
  subtitle: string;
  badges?: Partial<Record<(typeof TABS)[number]["key"], number>>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">DAK Provider Portal</p>
        <h1 className="mt-1 text-xl font-black text-gray-900 sm:text-2xl">{title}</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{subtitle}</p>
      </div>
      <nav aria-label="DAK sections" className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 [scrollbar-width:none] sm:w-fit">
        {TABS.map((tab) => {
          const current = tab.key === active;
          const badge = badges[tab.key];
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                current ? "bg-white text-[#820ad1] shadow-sm ring-1 ring-[#820ad1]/15" : "text-gray-500 hover:bg-white/60 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {badge ? (
                <span className="rounded-md bg-[#820ad1] px-1.5 py-px text-[10px] font-bold text-white">{badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Open support tickets, shown as a badge on the Support tab. */
export const openTicketCount = () => prisma.dakSupportTicket.count({ where: { status: "open" } });
