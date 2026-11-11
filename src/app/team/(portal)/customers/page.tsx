import Link from "next/link";
import { redirect } from "next/navigation";

import { getApplicationRows } from "@/app/admin/(protected)/applications/query";
import { prisma } from "@/lib/prisma";
import { getCurrentTeamAdmin } from "@/lib/team/access";
import { getTeamAgentIds, getTeamMawistaRecords, teamApplicationWhere } from "@/lib/team/data";
import CustomersTable from "./CustomersTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const formatDate = (value: Date | string | null) =>
  value ? new Date(value).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" }) : "—";

export default async function TeamCustomersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  // Everything below is limited to this team admin's agents.
  const agentIds = await getTeamAgentIds(teamAdmin.id);
  const where = { AND: [teamApplicationWhere(agentIds), { status: { notIn: ["incomplete", "client_profile"] } }] };

  const total = agentIds.length ? await prisma.application.count({ where }) : 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const { page: pageParam } = await searchParams;
  const page = Math.min(Math.max(1, Math.floor(Number(pageParam)) || 1), pages);

  const [rows, mawista, agents] = await Promise.all([
    agentIds.length
      ? getApplicationRows(where, [{ createdAt: "desc" }], { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE })
      : [],
    getTeamMawistaRecords(agentIds),
    prisma.user.findMany({ where: { id: { in: agentIds } }, select: { id: true, firstName: true, lastName: true, email: true } }),
  ]);
  const agentName = (id: string | null) => {
    const agent = agents.find((item) => item.id === id);
    return agent ? [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() || agent.email : "—";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Customers</h1>
        <p className="mt-0.5 text-sm text-gray-500">Applications of customers who came through your agents. Click one for full details.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No applications yet</p>
          <p className="mt-1 text-xs text-gray-500">Applications appear here when your agents&apos; customers apply.</p>
        </div>
      ) : (
        <>
          <CustomersTable rows={rows} />
          {pages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-3 text-sm text-gray-600">
              <span>
                Page {page} of {pages} · {total} applications
              </span>
              <span className="flex gap-2">
                {page > 1 ? (
                  <Link href={`/team/customers?page=${page - 1}`} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold hover:bg-gray-50">
                    ← Prev
                  </Link>
                ) : null}
                {page < pages ? (
                  <Link href={`/team/customers?page=${page + 1}`} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold hover:bg-gray-50">
                    Next →
                  </Link>
                ) : null}
              </span>
            </nav>
          ) : null}
        </>
      )}

      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">Mawista policies ({mawista.length})</h2>
        {mawista.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No Mawista policies linked to your agents yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {mawista.map((record) => (
              <div key={record.id} className="grid gap-2 border-t border-gray-100 px-4 py-3 text-sm first:border-t-0 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-gray-900">{record.customerName}</span>
                  <span className="block truncate text-xs text-gray-500">{[record.email, record.phone].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="min-w-0 text-xs text-gray-600">
                  <span className="block truncate font-semibold text-gray-800">{[record.planName, record.planType].filter(Boolean).join(" · ")}</span>
                  {formatDate(record.startDate)} – {formatDate(record.endDate)}
                </span>
                <span className="text-xs text-gray-600">
                  <span className="block font-semibold text-gray-800">{record.status}</span>
                  {record.premiumAmount != null ? euro.format(record.premiumAmount) : "—"}
                </span>
                <span className="truncate text-xs text-gray-600">Agent: {agentName(record.agentId)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
