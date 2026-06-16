import { redirect } from "next/navigation";

import { getCurrentAgentAccess } from "@/lib/agentAccess";
import { prisma } from "@/lib/prisma";

export default async function AgentCommissionsPage() {
  const { session, agent } = await getCurrentAgentAccess();

  if (!session?.user?.email) {
    redirect("/agent/login");
  }

  if (!agent || session.user.role !== "agent") {
    redirect("/");
  }

  const grouped = await prisma.application.groupBy({
    by: ["commissionStatus"],
    where: {
      source: "agent",
      partnerId: agent.id,
      status: { not: "client_profile" },
    },
    _sum: { commission: true },
    _count: { _all: true },
  });

  const find = (status: string) =>
    grouped.find((item) => item.commissionStatus === status);

  const pending = find("Pending");
  const approved = find("Approved");
  const paid = find("Paid");

  const pendingValue = pending?._sum.commission || 0;
  const approvedValue = approved?._sum.commission || 0;
  const paidValue = paid?._sum.commission || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Agent Workflow
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">Commissions</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Track pending, approved, and paid commission amounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          title="Pending"
          count={pending?._count._all || 0}
          amount={pendingValue}
          tone="bg-amber-50 border-amber-100 text-amber-700"
        />
        <Card
          title="Approved"
          count={approved?._count._all || 0}
          amount={approvedValue}
          tone="bg-emerald-50 border-emerald-100 text-emerald-700"
        />
        <Card
          title="Paid"
          count={paid?._count._all || 0}
          amount={paidValue}
          tone="bg-sky-50 border-sky-100 text-sky-700"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  count,
  amount,
  tone,
}: {
  title: string;
  count: number;
  amount: number;
  tone: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/50 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
        {title}
      </div>
      <p className="mt-4 text-3xl font-black text-[#111827]">EUR {amount}</p>
      <p className="mt-1 text-sm text-[#667085]">{count} applications</p>
    </div>
  );
}

