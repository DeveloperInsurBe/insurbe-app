import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MousePointerClick,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { getCurrentPartnerAccess } from "@/lib/applicationAccess";
import { getDefaultCommissionRate } from "@/lib/commission";
import { getPartnerDashboardSummary } from "@/lib/portalDashboardSummary";
import AnimatedNumber from "./AnimatedNumber";
import CreateApplicationButton from "./CreateApplicationButton";
import ReferralShareCard from "./ReferralShareCard";

type StatTileData = {
  label: string;
  hint: string;
  value: number;
  prefix?: string;
};

// A white panel with an icon header and two stat tiles (used for Clicks / Conversions).
function StatPanel({
  icon: Icon,
  eyebrow,
  title,
  tiles,
  delay,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  tiles: [StatTileData, StatTileData];
  delay: number;
}) {
  return (
    <div
      className="rise-in rounded-[24px] border border-[#f0e6fb] bg-white p-5 shadow-[0_10px_35px_rgba(130,10,209,0.06)] md:rounded-[30px] md:p-7"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/25">
          <Icon size={22} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black text-[#111827]">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:gap-4">
        {tiles.map((tile, index) => (
          <div
            key={tile.label}
            className={[
              "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(130,10,209,0.12)] sm:p-5",
              index === 0
                ? "border-[#e9d7ff] bg-gradient-to-br from-[#faf7ff] to-[#f3e8ff]"
                : "border-[#f0e6fb] bg-white",
            ].join(" ")}
          >
            <CalendarDays
              size={64}
              className="pointer-events-none absolute -right-3 -top-3 text-[#820ad1]/[0.06] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
            />

            <p className="relative text-sm font-semibold text-[#111827]">{tile.label}</p>
            <p className="relative mt-0.5 text-xs text-[#667085]">{tile.hint}</p>

            <p className="relative mt-4 text-3xl font-black text-[#820ad1] sm:text-4xl">
              <AnimatedNumber value={tile.value} prefix={tile.prefix} delay={delay + 200} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PartnerDashboard() {
  const { session, partner } = await getCurrentPartnerAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!partner || !partner.partnerId) {
    redirect("/");
  }

  const [
    {
      pendingCount,
      approvedCount,
      pendingCommission,
      approvedCommission,
      todayClicks,
      monthClicks,
      todayApprovedCommission,
      monthApprovedCommission,
    },
    commissionRate,
  ] = await Promise.all([
    getPartnerDashboardSummary(partner.partnerId),
    partner.commissionRate ?? getDefaultCommissionRate("partner"),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL || "https://insurbe.com";
  const referralLink = `${baseUrl}/insurance/public-health?ref=${partner.partnerId}#provider-comparison`;
  const partnerName =
    `${partner?.partnerProfile?.firstName || partner?.firstName || ""} ${
      partner?.partnerProfile?.lastName || partner?.lastName || ""
    }`.trim() || "Partner";

  // Presentation only: how the counted applications split between approved and pending.
  const totalCount = pendingCount + approvedCount;
  const approvedShare = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  const commissionRows: {
    label: string;
    hint: string;
    count: number;
    amount: number;
    icon: LucideIcon;
    tone: string;
  }[] = [
    {
      label: "Pending",
      hint: "Awaiting approval",
      count: pendingCount,
      amount: pendingCommission,
      icon: Clock,
      tone: "bg-amber-100 text-amber-600",
    },
    {
      label: "Approved",
      hint: "Successfully converted",
      count: approvedCount,
      amount: approvedCommission,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      {/* HERO */}
      <section className="rise-in relative overflow-hidden rounded-[28px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-5 py-5 text-[#111827] shadow-[0_12px_40px_rgba(130,10,209,0.08)] sm:px-7 sm:py-6 md:rounded-[32px] md:px-9 md:py-7">
        {/* animated background shapes */}
        <div className="float-slow pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#820ad1]/10 blur-2xl" />
        <div
          className="float-slow pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-[#a855f7]/15 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #820ad1 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <div
              className="rise-in inline-flex items-center gap-2.5 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[2px] text-[#820ad1]"
              style={{ animationDelay: "120ms" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Partner Dashboard
            </div>

            <h1
              className="rise-in mt-2 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl md:mt-2.5 md:text-[26px]"
              style={{ animationDelay: "200ms" }}
            >
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#820ad1] to-[#a855f7] bg-clip-text text-transparent">
                {partner?.partnerProfile?.firstName || "Partner"}
              </span>
            </h1>

            <p
              className="rise-in mt-1 max-w-xl text-[13px] leading-relaxed text-[#667085] md:mt-1.5 md:text-sm"
              style={{ animationDelay: "280ms" }}
            >
              Track referrals, conversions and commission earnings in real-time.
            </p>
          </div>

          <div
            className="rise-in w-full sm:w-auto"
            style={{ animationDelay: "360ms" }}
          >
            <CreateApplicationButton partnerRef={partner.partnerId} />
          </div>
        </div>
      </section>

      {/* COMMISSION + REFERRAL */}
      <div className="grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rise-in rounded-[24px] border border-[#f0e6fb] bg-white p-5 shadow-[0_10px_35px_rgba(130,10,209,0.06)] md:rounded-[30px] md:p-7"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/25">
                <Wallet size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Revenue</p>
                <h2 className="mt-1 text-2xl font-black text-[#111827]">Commission</h2>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">EUR</div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {commissionRows.map((row, index) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="rise-in group flex flex-col justify-between gap-4 rounded-2xl border border-[#f0e6fb] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e0c8fa] hover:bg-[#faf7ff] hover:shadow-[0_12px_30px_rgba(130,10,209,0.10)] sm:flex-row sm:items-center sm:p-5"
                  style={{ animationDelay: `${220 + index * 90}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${row.tone}`}
                    >
                      <Icon size={22} />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-[#111827]">{row.label}</p>
                      <p className="mt-0.5 text-xs text-[#667085]">{row.hint}</p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <h3 className="text-3xl font-black text-[#111827]">
                      <AnimatedNumber value={row.count} delay={320 + index * 90} />
                    </h3>
                    <p className="mt-1 text-lg font-bold text-[#820ad1]">
                      <AnimatedNumber value={row.amount} prefix="EUR " delay={320 + index * 90} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* approved vs pending share */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#667085]">
              <span>Approved vs pending</span>
              <span className="text-[#820ad1]">
                {totalCount > 0 ? `${Math.round(approvedShare)}% approved` : "No applications yet"}
              </span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-100">
              {totalCount > 0 ? (
                <>
                  <div
                    className="bar-grow h-full bg-gradient-to-r from-[#820ad1] to-[#a855f7]"
                    style={{ width: `${approvedShare}%`, animationDelay: "500ms" }}
                  />
                  <div
                    className="bar-grow h-full bg-amber-300"
                    style={{ width: `${100 - approvedShare}%`, animationDelay: "600ms" }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rise-in grid" style={{ animationDelay: "200ms" }}>
          <ReferralShareCard
            referralLink={referralLink}
            partnerName={partnerName}
            commissionRate={commissionRate}
          />
        </div>
      </div>

      {/* CLICKS + CONVERSIONS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <StatPanel
          icon={MousePointerClick}
          eyebrow="Analytics"
          title="Clicks"
          delay={280}
          tiles={[
            { label: "Today", hint: "Referral clicks", value: todayClicks },
            { label: "This Month", hint: "Monthly traffic", value: monthClicks },
          ]}
        />

        <StatPanel
          icon={Sparkles}
          eyebrow="Earnings"
          title="Conversions"
          delay={340}
          tiles={[
            {
              label: "Today",
              hint: "Approved Commission",
              value: todayApprovedCommission,
              prefix: "EUR ",
            },
            {
              label: "This Month",
              hint: "Approved Commission",
              value: monthApprovedCommission,
              prefix: "EUR ",
            },
          ]}
        />
      </div>
    </div>
  );
}
