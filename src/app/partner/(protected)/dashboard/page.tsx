import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import CopyReferralButton from "@/app/components/CopyReferralButton";

export default async function PartnerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const partner: any = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { partnerProfile: true },
  });

  if (!partner || !partner.partnerId) {
    redirect("/");
  }

  const baseWhere = {
    partnerId: partner.partnerId,
    source: "partner",
  } as const;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    pendingCount,
    approvedCount,
    pendingCommissionAgg,
    approvedCommissionAgg,
    todayClicks,
    monthClicks,
    todayApprovedCommissionAgg,
    monthApprovedCommissionAgg,
  ] = await Promise.all([
    prisma.application.count({
      where: { ...baseWhere, commissionStatus: "Pending" },
    }),
    prisma.application.count({
      where: { ...baseWhere, commissionStatus: "Approved" },
    }),
    prisma.application.aggregate({
      where: { ...baseWhere, commissionStatus: "Pending" },
      _sum: { commission: true },
    }),
    prisma.application.aggregate({
      where: { ...baseWhere, commissionStatus: "Approved" },
      _sum: { commission: true },
    }),
    prisma.application.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),
    prisma.application.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    }),
    prisma.application.aggregate({
      where: {
        ...baseWhere,
        commissionStatus: "Approved",
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      _sum: { commission: true },
    }),
    prisma.application.aggregate({
      where: {
        ...baseWhere,
        commissionStatus: "Approved",
        createdAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      _sum: { commission: true },
    }),
  ]);

  const pendingCommission = pendingCommissionAgg._sum.commission || 0;
  const approvedCommission = approvedCommissionAgg._sum.commission || 0;
  const todayApprovedCommission = todayApprovedCommissionAgg._sum.commission || 0;
  const monthApprovedCommission = monthApprovedCommissionAgg._sum.commission || 0;

  const referralLink = `${process.env.NEXTAUTH_URL}/register?ref=${partner.partnerId}`;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-6 md:p-7 shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-[#820ad1]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
              Partner Dashboard
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#820ad1] to-[#a855f7] bg-clip-text text-transparent">
                {partner?.partnerProfile?.firstName || "Partner"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-[#667085] leading-relaxed">
              Track referrals, conversions and commission earnings in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="rounded-[28px] border border-white/50 bg-white/90 p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Revenue</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Commission</h2>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">EUR</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-[#f3e8ff] bg-[#faf7ff] p-5">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Pending</p>
                <p className="mt-1 text-xs text-[#667085]">Awaiting approval</p>
              </div>

              <div className="text-right">
                <h3 className="text-3xl font-black text-[#111827]">{pendingCount}</h3>
                <p className="mt-1 text-lg font-bold text-[#820ad1]">EUR {pendingCommission}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#f3e8ff] bg-white p-5">
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

        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#6d00c9] via-[#820ad1] to-[#a855f7] p-6 text-white shadow-[0_18px_55px_rgba(130,10,209,0.22)]">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-white/80 backdrop-blur-md">
                Referral Link
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight">Invite & Earn</h2>

              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Share your affiliate link and earn commission from successful insurance applications.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-4 backdrop-blur-md">
                <p className="truncate text-sm font-semibold text-white">{referralLink}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  target="_blank"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-bold text-[#820ad1] transition-all duration-200 hover:scale-[1.02]"
                >
                  Open Link
                </a>

                <CopyReferralButton referralLink={referralLink} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-[28px] border border-white/50 bg-white/90 p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Analytics</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Clicks</h2>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">Chart</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-[#faf7ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">Today</p>
                <p className="mt-1 text-xs text-[#667085]">Referral clicks</p>
              </div>

              <p className="text-4xl font-black text-[#820ad1]">{todayClicks}</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white border border-[#f3e8ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">This Month</p>
                <p className="mt-1 text-xs text-[#667085]">Monthly traffic</p>
              </div>

              <p className="text-4xl font-black text-[#820ad1]">{monthClicks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/50 bg-white/90 p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Earnings</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Conversions</h2>
            </div>

            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">Money</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-[#faf7ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">Today</p>
                <p className="mt-1 text-xs text-[#667085]">Approved Commission</p>
              </div>

              <p className="text-3xl font-black text-[#820ad1]">EUR {todayApprovedCommission}</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white border border-[#f3e8ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">This Month</p>
                <p className="mt-1 text-xs text-[#667085]">Approved Commission</p>
              </div>

              <p className="text-3xl font-black text-[#820ad1]">EUR {monthApprovedCommission}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
