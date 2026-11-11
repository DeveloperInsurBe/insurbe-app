import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentTeamAdmin } from "@/lib/team/access";
import { getTeamDashboard } from "@/lib/team/data";

export const dynamic = "force-dynamic";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function TeamDashboardPage() {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const data = await getTeamDashboard(teamAdmin.id);
  const { totals, products, months } = data;
  const maxMonth = Math.max(1, ...months.map((month) => month.count));
  const topAgents = [...data.agents].sort((a, b) => b.applications - a.applications).slice(0, 5);

  const cards = [
    { label: "Agents", value: String(totals.agents), hint: `${totals.activeAgents} with applications` },
    { label: "Applications", value: String(totals.applications), hint: "submitted, all products" },
    { label: "Clients", value: String(totals.clients), hint: "client profiles" },
    { label: "Commission", value: euro.format(totals.commission.total), hint: "all statuses" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Hello, {teamAdmin.name}</h1>
        <p className="mt-0.5 text-sm text-gray-500">Your agents and the customers they brought in.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Commission by status</h2>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: "Pending", value: totals.commission.pending, tone: "text-amber-600" },
              { label: "Approved", value: totals.commission.approved, tone: "text-blue-600" },
              { label: "Paid", value: totals.commission.paid, tone: "text-emerald-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <dt className="text-xs text-gray-500">{item.label}</dt>
                <dd className={`mt-1 text-lg font-black ${item.tone}`}>{euro.format(item.value)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-gray-400">Payouts are approved and paid by InsurBe.</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Applications by product</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Private", value: products.private },
              { label: "TK", value: products.TK },
              { label: "DAK", value: products.DAK },
              { label: "Mawista", value: products.Mawista },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <dt className="text-xs text-gray-500">{item.label}</dt>
                <dd className="mt-1 text-lg font-black text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Applications, last 6 months</h2>
          <div className="mt-4 flex h-40 items-end gap-3" role="img" aria-label="Applications per month">
            {months.map((month) => (
              <div key={month.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-gray-700">{month.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#820ad1] to-[#a855f7]"
                  style={{ height: `${Math.max(4, (month.count / maxMonth) * 110)}px` }}
                />
                <span className="text-[11px] text-gray-500">{month.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Top agents</h2>
            <Link href="/team/agents" className="text-xs font-semibold text-[#820ad1] hover:underline">
              All agents
            </Link>
          </div>
          {topAgents.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No agents yet. Share your invite link from the Agents page.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100">
              {topAgents.map((agent) => (
                <li key={agent.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">{agent.name}</span>
                    <span className="block truncate text-xs text-gray-500">{agent.email}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-gray-500">
                    <span className="block font-bold text-gray-900">{agent.applications} applications</span>
                    {euro.format(agent.commission.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
