import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeEuro,
  FileText,
  Hourglass,
  Send,
  ShieldCheck,
  UserX,
  Users,
} from "lucide-react";

import AnimatedNumber from "@/app/partner/(protected)/dashboard/AnimatedNumber";
import { PeriodSwitch, statusTone } from "../adminUi";
import { PERIODS, parsePeriod, periodHref } from "../partners/publicInsurance";
import { BarList, Reveal, StatusStack, TrendChart } from "./Charts";
import { getDashboardData } from "./data";
import { SERIES } from "./series";

const KIND_STYLE = {
  TK: "bg-blue-50 text-blue-700 border-blue-200",
  DAK: "bg-emerald-50 text-emerald-700 border-emerald-200",
  private: "bg-[#820ad1]/5 text-[#820ad1] border-[#820ad1]/20",
} as const;

const SOURCE_LABEL = { direct: "Direct", partner: "Partner", agent: "Agent" } as const;

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());

function Delta({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <span className="text-xs text-gray-400">{label}</span>;

  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%<span className="ml-1 font-normal text-gray-500">{label}</span>
    </span>
  );
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const data = await getDashboardData(period);

  const periodLabel = PERIODS.find((item) => item.value === period)?.label ?? "";
  const deltaLabel =
    period === "this-month" ? "vs last month" : period === "last-month" ? "vs month before" : "";

  const { applications, partners, commission, commissionAllTime } = data;
  const publicTotal = applications.byKind.TK + applications.byKind.DAK;
  const earned =
    commission.totals.Pending +
    commission.totals.Approved +
    commission.totals.Paid;
  const activeShare = partners.total
    ? Math.round((partners.active / partners.total) * 100)
    : 0;

  const kpis = [
    {
      label: "Applications",
      icon: FileText,
      value: applications.total,
      prefix: "",
      footer: <Delta value={applications.delta} label={deltaLabel || periodLabel} />,
      accent: "bg-[#820ad1]/10 text-[#820ad1]",
    },
    {
      label: "TK & DAK",
      icon: ShieldCheck,
      value: publicTotal,
      prefix: "",
      footer: (
        <div className="w-full">
          <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
            {publicTotal > 0 ? (
              <>
                <div className="bg-blue-500" style={{ width: `${(applications.byKind.TK / publicTotal) * 100}%` }} />
                <div className="bg-emerald-500" style={{ width: `${(applications.byKind.DAK / publicTotal) * 100}%` }} />
              </>
            ) : null}
          </div>
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-gray-600">
            <span>TK {applications.byKind.TK}</span>
            <span>DAK {applications.byKind.DAK}</span>
          </div>
        </div>
      ),
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active partners",
      icon: Users,
      value: partners.active,
      prefix: "",
      footer: (
        <div className="w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#820ad1]" style={{ width: `${activeShare}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {activeShare}% of {partners.total} partners sent applications
          </p>
        </div>
      ),
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: "Commission earned",
      icon: BadgeEuro,
      value: earned,
      prefix: "€",
      footer: (
        <span className="text-[11px] text-gray-500">
          €{commission.totals.Pending} pending · €{commission.totals.Approved} approved · €
          {commission.totals.Paid} paid
        </span>
      ),
      accent: "bg-emerald-50 text-emerald-600",
    },
  ];

  const attention = [
    {
      icon: Send,
      label: "TK/DAK awaiting hand-off",
      value: String(data.publicToForward),
      hint: "submissions still PENDING",
      href: "/admin/users",
      tone: "text-blue-600 bg-blue-50",
    },
    {
      icon: Hourglass,
      label: "Commissions to review",
      value: `€${commissionAllTime.totals.Pending}`,
      hint: `${commissionAllTime.counts.Pending} pending`,
      href: "/admin/applications?commission=pending&stage=any",
      tone: "text-amber-600 bg-amber-50",
    },
    {
      icon: BadgeEuro,
      label: "Approved, ready to pay",
      value: `€${commissionAllTime.totals.Approved}`,
      hint: `${commissionAllTime.counts.Approved} approved`,
      href: "/admin/reports?show=payable",
      tone: "text-[#820ad1] bg-[#820ad1]/10",
    },
    {
      icon: UserX,
      label: "Partners without applications",
      value: String(Math.max(partners.total - partners.active, 0)),
      hint: periodLabel.toLowerCase(),
      href: periodHref("/admin/partners", { show: "inactive", period }),
      tone: "text-gray-600 bg-gray-100",
    },
  ];

  const sources = [
    { label: "Direct", value: applications.bySource.direct },
    { label: "Partners", value: applications.bySource.partner, href: "/admin/partners" },
    { label: "Agents", value: applications.bySource.agent, href: "/admin/agents" },
  ];

  const products = SERIES.map((series) => ({
    label: series.label,
    value: applications.byKind[series.key],
  }));

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      {/* HEADER */}
      <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Dashboard</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              {periodLabel} overview of applications, partners and commission
            </p>
          </div>
          <PeriodSwitch
            periods={PERIODS}
            active={period}
            hrefFor={(value) => periodHref("/admin/dashboard", { period: value })}
          />
        </div>
      </Reveal>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <Reveal key={kpi.label} delay={0.05 + index * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {kpi.label}
                  </p>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpi.accent}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-3xl font-black text-gray-900">
                  <AnimatedNumber value={kpi.value} prefix={kpi.prefix} delay={200 + index * 60} />
                </p>
                <div className="mt-auto flex min-h-[28px] items-end pt-3">{kpi.footer}</div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* NEEDS ATTENTION */}
      <Reveal delay={0.25}>
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Needs attention
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {attention.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:-translate-y-0.5 hover:border-[#820ad1]/30 hover:shadow-sm"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-black leading-tight text-gray-900">
                      {item.value}
                    </span>
                    <span className="block truncate text-xs text-gray-500">{item.label}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#820ad1]" />
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* TREND + MIX */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Reveal delay={0.3} className="xl:col-span-2">
          <Card
            title="Applications per month"
            action={<span className="text-xs text-gray-400">Last 12 months</span>}
          >
            <TrendChart data={data.trend} />
          </Card>
        </Reveal>

        <Reveal delay={0.35}>
          <Card title="Where applications come from">
            <BarList items={sources} emptyText={`No applications ${periodLabel.toLowerCase()}`} />
            <div className="my-5 border-t border-gray-100" />
            <p className="mb-3 text-xs font-semibold text-gray-500">By product</p>
            <BarList items={products} color="#6b7280" emptyText="—" />
          </Card>
        </Reveal>
      </div>

      {/* COMMISSION + TOP PARTNERS + RECENT */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Reveal delay={0.4}>
          <Card
            title="Commission status"
            action={
              <Link href="/admin/reports" className="text-xs font-semibold text-[#820ad1] hover:underline">
                Report →
              </Link>
            }
          >
            <StatusStack
              items={[
                { label: "Pending", value: commission.totals.Pending, count: commission.counts.Pending, color: "#f59e0b" },
                { label: "Approved", value: commission.totals.Approved, count: commission.counts.Approved, color: "#820ad1" },
                { label: "Paid", value: commission.totals.Paid, count: commission.counts.Paid, color: "#10b981" },
                { label: "Rejected", value: commission.totals.Rejected, count: commission.counts.Rejected, color: "#ef4444" },
              ]}
            />
          </Card>
        </Reveal>

        <Reveal delay={0.45}>
          <Card
            title="Top partners"
            action={
              <Link
                href={periodHref("/admin/partners", { period })}
                className="text-xs font-semibold text-[#820ad1] hover:underline"
              >
                All →
              </Link>
            }
          >
            <BarList
              items={data.topPartners.map((partner) => ({
                label: partner.name,
                value: partner.count,
                hint: "apps",
                href: `/admin/partners/${encodeURIComponent(partner.partnerId)}`,
              }))}
              emptyText={`No partner applications ${periodLabel.toLowerCase()}`}
            />
          </Card>
        </Reveal>

        <Reveal delay={0.5} className="lg:col-span-2 xl:col-span-1">
          <Card
            title="Latest applications"
            action={
              <Link href="/admin/applications" className="text-xs font-semibold text-[#820ad1] hover:underline">
                All →
              </Link>
            }
          >
            {data.recent.length ? (
              <ul className="divide-y divide-gray-100">
                {data.recent.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span
                      className={`w-14 shrink-0 rounded-md border px-1.5 py-0.5 text-center text-[11px] font-semibold ${KIND_STYLE[item.kind]}`}
                    >
                      {item.kind === "private" ? "Private" : item.kind}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {item.name}
                      </span>
                      <span className="block truncate text-[11px] text-gray-500">
                        {SOURCE_LABEL[item.source]} · {timeAgo(item.createdAt)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(item.status)}`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-xs text-gray-400">No applications yet</p>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
