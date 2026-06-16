import { redirect } from "next/navigation";
import { Users, FileText, Euro } from "lucide-react";

import { getCurrentAgentAccess } from "@/lib/agentAccess";
import { prisma } from "@/lib/prisma";

export default async function AgentDashboardPage() {
  const { session, agent } = await getCurrentAgentAccess();

  if (!session?.user?.email) {
    redirect("/agent/login");
  }

  if (!agent || session.user.role !== "agent") {
    redirect("/");
  }

  const [clientCount, applicationCount, commissionAgg, statusAgg] = await Promise.all([
    prisma.application.count({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: "client_profile",
      },
    }),
    prisma.application.count({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: { not: "client_profile" },
      },
    }),
    prisma.application.aggregate({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: { not: "client_profile" },
      },
      _sum: {
        commission: true,
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: {
        source: "agent",
        partnerId: agent.id,
        status: {
          in: ["created", "documents_pending", "submitted", "processed"],
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const createdCount =
    statusAgg.find((item) => item.status === "created")?._count._all || 0;
  const submittedCount =
    statusAgg.find((item) => item.status === "submitted")?._count._all || 0;
  const totalCommission = commissionAgg._sum.commission || 0;

  const fullName =
    `${agent?.firstName || ""} ${agent?.lastName || ""}`.trim() || "Agent";

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

      {/* <div className="rounded-[22px] md:rounded-[28px] border border-white/50 bg-white/90 p-5 md:p-6 shadow-[0_10px_35px_rgba(130,10,209,0.06)]">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Next Integration
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#111827]">
          Agent Workflow Module
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#f3e8ff] bg-[#faf7ff] px-4 py-3">
            <p className="text-xs font-semibold text-[#667085]">Created</p>
            <p className="mt-1 text-2xl font-black text-[#111827]">{createdCount}</p>
          </div>
          <div className="rounded-2xl border border-[#f3e8ff] bg-white px-4 py-3">
            <p className="text-xs font-semibold text-[#667085]">Submitted</p>
            <p className="mt-1 text-2xl font-black text-[#111827]">{submittedCount}</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
