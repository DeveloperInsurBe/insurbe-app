import { getDefaultCommissionRate, type CommissionRole } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import CommissionRateEditor from "./CommissionRateEditor";

const rateLabel = (rate: number | null, fallback: string) =>
  rate === null ? fallback : `€${rate}`;

/**
 * Commission rate of one partner/agent with edit button and recent changes.
 */
export default async function CommissionRateCard({
  role,
  userId,
  referrerKey,
  name,
  commissionRate,
}: {
  role: CommissionRole;
  userId: string;
  /** Application.partnerId value: partner code, or agent user id */
  referrerKey: string;
  name: string;
  commissionRate: number | null;
}) {
  const [defaultRate, pendingCount, history] = await Promise.all([
    getDefaultCommissionRate(role),
    prisma.application.count({
      where: { source: role, partnerId: referrerKey, commissionStatus: "Pending" },
    }),
    prisma.commissionRateChange.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const rate = commissionRate ?? defaultRate;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Commission per application
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-black text-[#820ad1]">€{rate}</span>
            <span
              className={`rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${
                commissionRate === null
                  ? "bg-gray-100 text-gray-500"
                  : "bg-[#820ad1]/10 text-[#820ad1]"
              }`}
            >
              {commissionRate === null ? "Default" : "Custom"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {commissionRate === null
              ? `Follows the ${role} default. Changes when the default changes.`
              : `Custom rate. The ${role} default is €${defaultRate}.`}{" "}
            {pendingCount} pending commission{pendingCount === 1 ? "" : "s"}.
          </p>
        </div>

        <CommissionRateEditor
          role={role}
          userId={userId}
          targetName={name}
          customRate={commissionRate}
          defaultRate={defaultRate}
          pendingCount={pendingCount}
        />
      </div>

      {history.length ? (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Recent changes
          </p>
          <ul className="mt-2 space-y-1.5">
            {history.map((change) => (
              <li
                key={change.id}
                className="flex flex-col gap-0.5 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span>
                  {rateLabel(change.oldRate, "Default")} →{" "}
                  <span className="font-semibold text-gray-900">
                    {rateLabel(change.newRate, "Default")}
                  </span>
                  {change.pendingUpdated
                    ? ` · ${change.pendingUpdated} pending updated`
                    : ""}
                </span>
                <span className="text-gray-400">
                  {change.changedBy} ·{" "}
                  {change.createdAt.toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
