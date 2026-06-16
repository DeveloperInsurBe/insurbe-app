import { prisma } from "@/lib/prisma";

function cardClass(color: "purple" | "blue" | "green" | "amber") {
  if (color === "purple") return "from-[#820ad1] to-[#9f3cff] text-white";
  if (color === "blue") return "from-blue-600 to-blue-500 text-white";
  if (color === "green") return "from-emerald-600 to-emerald-500 text-white";
  return "from-amber-500 to-amber-400 text-white";
}

export default async function AdminDashboardPage() {
  const [
    partnerCount,
    totalApplications,
    partnerApplications,
    userApplications,
    commissionAgg,
    pendingCommissionAgg,
    approvedCommissionAgg,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "partner" } }),
    prisma.application.count(),
    prisma.application.count({
      where: { source: "partner", status: { not: "incomplete" } },
    }),
    prisma.application.count({
      where: { source: "user", status: { not: "incomplete" } },
    }),
    prisma.application.aggregate({
      where: { source: "partner" },
      _sum: { commission: true },
    }),
    prisma.application.aggregate({
      where: { source: "partner", commissionStatus: "Pending" },
      _sum: { commission: true },
    }),
    prisma.application.aggregate({
      where: { source: "partner", commissionStatus: "Approved" },
      _sum: { commission: true },
    }),
  ]);

  const cards = [
    {
      title: "Total Partners Enrolled",
      value: String(partnerCount),
      color: "purple" as const,
    },
    {
      title: "Partner Applications",
      value: String(partnerApplications),
      color: "blue" as const,
    },
    {
      title: "User Applications",
      value: String(userApplications),
      color: "green" as const,
    },
    {
      title: "Total Applications",
      value: String(totalApplications),
      color: "amber" as const,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Central analytics for partner enrollments, user enrollments, and
          commission tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl bg-gradient-to-br p-4 shadow-sm sm:p-5 ${cardClass(card.color)}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              {card.title}
            </p>
            <p className="mt-3 text-3xl font-black sm:text-4xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[1.5px] text-gray-500">
            Commission
          </p>
          <h2 className="mt-2 text-xl font-black text-gray-900 sm:text-2xl">
            Total Partner Commission
          </h2>
          <p className="mt-4 text-2xl font-black text-[#820ad1] sm:text-3xl">
            EUR {commissionAgg._sum.commission ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[1.5px] text-gray-500">
            Pending
          </p>
          <h2 className="mt-2 text-xl font-black text-gray-900 sm:text-2xl">
            Pending Commission
          </h2>
          <p className="mt-4 text-2xl font-black text-amber-600 sm:text-3xl">
            EUR {pendingCommissionAgg._sum.commission ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[1.5px] text-gray-500">
            Approved
          </p>
          <h2 className="mt-2 text-xl font-black text-gray-900 sm:text-2xl">
            Approved Commission
          </h2>
          <p className="mt-4 text-2xl font-black text-emerald-600 sm:text-3xl">
            EUR {approvedCommissionAgg._sum.commission ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
