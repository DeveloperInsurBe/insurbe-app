import Link from "next/link";
import { redirect } from "next/navigation";

import { PARTNER_CATEGORY_LABELS } from "@/lib/partnerCategory";
import { getCurrentTeamAdmin } from "@/lib/team/access";
import { getTeamDashboard } from "@/lib/team/data";
import { CustomerLink } from "../partners/PartnersClient";

export const dynamic = "force-dynamic";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" });

export default async function TeamDashboardPage() {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const data = await getTeamDashboard(teamAdmin.id, teamAdmin.commissionRate);
  const { direct, activity, totals, products, months } = data;
  const maxMonth = Math.max(1, ...months.map((month) => month.count));
  const topPartners = [...data.members].sort((a, b) => b.applications - a.applications).slice(0, 5);

  const cards = [
    { label: "Partners", value: String(totals.partners), hint: `${totals.activePartners} with applications` },
    { label: "Partners' applications", value: String(totals.applications), hint: "submitted, all products" },
    { label: "Partners' clients", value: String(totals.clients), hint: "client profiles" },
    { label: "Partners' commission", value: euro.format(totals.commission.total), hint: "earned by your partners" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Hello, {teamAdmin.name}</h1>
        <p className="mt-0.5 text-sm text-gray-500">Your own customers, your partners and the customers they brought in.</p>
      </div>

      {/* Own customers: the only commission the Sales Leader earns. */}
      <section className="rounded-2xl border border-[#820ad1]/20 bg-[#820ad1]/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#820ad1]">My direct customers</h2>
          <p className="text-xs text-gray-500">
            Your rate: <span className="font-bold text-gray-900">{euro.format(direct.rate)}</span> per application
            {direct.customRate === null ? " (InsurBe default)" : ""}
          </p>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Applications", value: String(direct.applications), tone: "text-gray-900" },
            { label: "Pending", value: euro.format(direct.commission.pending), tone: "text-amber-600" },
            { label: "Approved", value: euro.format(direct.commission.approved), tone: "text-blue-600" },
            { label: "Paid", value: euro.format(direct.commission.paid), tone: "text-emerald-600" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
              <dt className="text-xs text-gray-500">{item.label}</dt>
              <dd className={`mt-1 text-lg font-black ${item.tone}`}>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-600">Share this link with customers. Everyone who applies through it is your direct customer.</p>
          <CustomerLink teamAdminId={teamAdmin.id} />
        </div>
        <p className="mt-3 text-[11px] text-gray-400">You earn commission on your direct customers only. Payouts are approved and paid by InsurBe.</p>
      </section>

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
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Applications by product (all your customers)</h2>
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

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Applications, last 6 months</h2>
          <div className="mt-4 flex h-32 items-end gap-3" role="img" aria-label="Applications per month">
            {months.map((month) => (
              <div key={month.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-gray-700">{month.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#820ad1] to-[#a855f7]"
                  style={{ height: `${Math.max(4, (month.count / maxMonth) * 90)}px` }}
                />
                <span className="text-[11px] text-gray-500">{month.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Top partners</h2>
            <Link href="/team/partners" className="text-xs font-semibold text-[#820ad1] hover:underline">
              All partners
            </Link>
          </div>
          {topPartners.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No partners yet. Share your invite link from the Partners page.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100">
              {topPartners.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">{member.name}</span>
                    <span className="block truncate text-xs text-gray-500">{PARTNER_CATEGORY_LABELS[member.category]}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-gray-500">
                    <span className="block font-bold text-gray-900">{member.applications} applications</span>
                    {euro.format(member.commission.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Recent activity</h2>
            <Link href="/team/customers" className="text-xs font-semibold text-[#820ad1] hover:underline">
              All customers
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No applications yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">{item.customer}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {item.product} · {item.direct ? "your customer" : "via a partner"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-gray-500">
                    <span className="block font-semibold capitalize text-gray-800">{item.status.replace(/_/g, " ")}</span>
                    {formatDate(item.createdAt)}
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
