import { redirect } from "next/navigation";
import { Users, FileText, Euro } from "lucide-react";

import { getCurrentAgentAccess } from "@/lib/agentAccess";
import { prisma } from "@/lib/prisma";
import AgentReferralShareCard from "./AgentReferralShareCard";

export default async function AgentDashboardPage() {
  const { session, agent } = await getCurrentAgentAccess();

  if (!session?.user?.email) {
    redirect("/agent/login");
  }

  if (!agent || session.user.role !== "agent") {
    redirect("/");
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const applicationWhere = {
    source: "agent" as const,
    partnerId: agent.id,
    status: { not: "client_profile" },
  };

  const [
    clientCount,
    applicationAggregate,
    commissionGrouped,
    todayAggregate,
    monthAggregate,
    todayApprovedAggregate,
    monthApprovedAggregate,
  ] = await Promise.all([
    prisma.application.count({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: "client_profile",
      },
    }),
    prisma.application.aggregate({
      where: applicationWhere,
      _count: { _all: true },
      _sum: { commission: true },
    }),
    prisma.application.groupBy({
      by: ["commissionStatus"],
      where: applicationWhere,
      _count: { _all: true },
      _sum: { commission: true },
    }),
    prisma.application.aggregate({
      where: {
        ...applicationWhere,
        createdAt: { gte: todayStart },
      },
      _count: { _all: true },
    }),
    prisma.application.aggregate({
      where: {
        ...applicationWhere,
        createdAt: { gte: monthStart },
      },
      _count: { _all: true },
    }),
    prisma.application.aggregate({
      where: {
        ...applicationWhere,
        createdAt: { gte: todayStart },
        commissionStatus: "Approved",
      },
      _sum: { commission: true },
    }),
    prisma.application.aggregate({
      where: {
        ...applicationWhere,
        createdAt: { gte: monthStart },
        commissionStatus: "Approved",
      },
      _sum: { commission: true },
    }),
  ]);

  const findCommissionStatus = (status: string) =>
    commissionGrouped.find((item) => item.commissionStatus === status);

  const pending = findCommissionStatus("Pending");
  const approved = findCommissionStatus("Approved");

  const applicationCount = applicationAggregate._count._all || 0;
  const totalCommission = applicationAggregate._sum.commission || 0;
  const pendingCount = pending?._count._all || 0;
  const approvedCount = approved?._count._all || 0;
  const pendingCommission = pending?._sum.commission || 0;
  const approvedCommission = approved?._sum.commission || 0;
  const todayApps = todayAggregate._count._all || 0;
  const monthApps = monthAggregate._count._all || 0;
  const todayApprovedCommission = todayApprovedAggregate._sum.commission || 0;
  const monthApprovedCommission = monthApprovedAggregate._sum.commission || 0;

  const fullName =
    `${agent?.firstName || ""} ${agent?.lastName || ""}`.trim() || "Agent";
  const baseUrl = process.env.NEXTAUTH_URL || "https://insurbe.com";
  const referralLink = `${baseUrl}/insurance/public-health?ref=${agent.id}#provider-comparison`;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 sm:p-6 md:p-7 shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-[#820ad1]/10 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
            Agent Dashboard
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-[#820ad1] to-[#a855f7] bg-clip-text text-transparent">
              {fullName}
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm md:text-base text-[#667085] leading-relaxed">
            Germany insurance agent portal is now live as a separate dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-5 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#667085]">Clients</p>
            <Users size={18} className="text-[#820ad1]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#111827]">{clientCount}</p>
          <p className="mt-1 text-xs text-[#667085]">Profiles managed</p>
        </div>

        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-5 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#667085]">Applications</p>
            <FileText size={18} className="text-[#820ad1]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#111827]">{applicationCount}</p>
          <p className="mt-1 text-xs text-[#667085]">Submitted this month</p>
        </div>

        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-5 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#667085]">Commission</p>
            <Euro size={18} className="text-[#820ad1]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#111827]">
            EUR {totalCommission}
          </p>
          <p className="mt-1 text-xs text-[#667085]">Current payable amount</p>
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

        <AgentReferralShareCard referralLink={referralLink} agentName={fullName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-4 sm:p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Analytics</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Applications</h2>
            </div>
            <div className="rounded-2xl bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">Flow</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf7ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">Today</p>
                <p className="mt-1 text-xs text-[#667085]">Attributed applications</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#820ad1]">{todayApps}</p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-[#f3e8ff] p-4">
              <div>
                <p className="font-semibold text-[#111827]">This Month</p>
                <p className="mt-1 text-xs text-[#667085]">Attributed applications</p>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-[#820ad1]">{monthApps}</p>
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
