import { redirect } from "next/navigation";

import { getCurrentPartnerAccess } from "@/lib/applicationAccess";
import { getPartnerDashboardSummary } from "@/lib/portalDashboardSummary";
import ReferralShareCard from "./ReferralShareCard";

export default async function PartnerDashboard() {
  const { session, partner } = await getCurrentPartnerAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!partner || !partner.partnerId) {
    redirect("/");
  }

  const {
    pendingCount,
    approvedCount,
    pendingCommission,
    approvedCommission,
    todayClicks,
    monthClicks,
    todayApprovedCommission,
    monthApprovedCommission,
  } = await getPartnerDashboardSummary(partner.partnerId);

  const baseUrl = process.env.NEXTAUTH_URL || "https://insurbe.com";
  const referralLink = `${baseUrl}/insurance/public-health?ref=${partner.partnerId}#provider-comparison`;
  const partnerName =
    `${partner?.partnerProfile?.firstName || partner?.firstName || ""} ${
      partner?.partnerProfile?.lastName || partner?.lastName || ""
    }`.trim() || "Partner";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 sm:p-6 md:p-7 shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-[#820ad1]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
              Partner Dashboard
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#820ad1] to-[#a855f7] bg-clip-text text-transparent">
                {partner?.partnerProfile?.firstName || "Partner"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-[#667085] leading-relaxed">
              Track referrals, conversions and commission earnings in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-full sm:max-w-[320px]">
            <div className="rounded-2xl bg-white/80 border border-[#f3e8ff] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Pending</p>
              <h3 className="mt-2 text-3xl font-black text-[#111827]">{pendingCount}</h3>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] p-4 text-white shadow-lg shadow-[#820ad1]/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Approved</p>
              <h3 className="mt-2 text-3xl font-black">{approvedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 md:gap-6">
        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Revenue</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Commission</h2>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">EUR</div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#f3e8ff] bg-[#faf7ff] p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Pending</p>
                <p className="mt-1 text-xs text-[#667085]">Awaiting approval</p>
              </div>

              <div className="text-right">
                <h3 className="text-3xl font-black text-[#111827]">{pendingCount}</h3>
                <p className="mt-1 text-lg font-bold text-[#820ad1]">EUR {pendingCommission}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#f3e8ff] bg-white p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Approved</p>
                <p className="mt-1 text-xs text-[#667085]">Successfully converted</p>
              </div>

              <div className="text-right">
                <h3 className="text-3xl font-black text-[#111827]">{approvedCount}</h3>
                <p className="mt-1 text-lg font-bold text-[#820ad1]">EUR {approvedCommission}</p>
              </div>
            </div>
          </div>
        </div>

        <ReferralShareCard referralLink={referralLink} partnerName={partnerName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Analytics</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Clicks</h2>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">Chart</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf7ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">Today</p>
                <p className="mt-1 text-xs text-[#667085]">Referral clicks</p>
              </div>

              <p className="text-3xl sm:text-4xl font-black text-[#820ad1]">{todayClicks}</p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-[#f3e8ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">This Month</p>
                <p className="mt-1 text-xs text-[#667085]">Monthly traffic</p>
              </div>

              <p className="text-3xl sm:text-4xl font-black text-[#820ad1]">{monthClicks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Earnings</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Conversions</h2>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">Money</div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#faf7ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">Today</p>
                <p className="mt-1 text-xs text-[#667085]">Approved Commission</p>
              </div>

              <p className="text-2xl sm:text-3xl font-black text-[#820ad1]">EUR {todayApprovedCommission}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white border border-[#f3e8ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">This Month</p>
                <p className="mt-1 text-xs text-[#667085]">Approved Commission</p>
              </div>

              <p className="text-2xl sm:text-3xl font-black text-[#820ad1]">EUR {monthApprovedCommission}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
