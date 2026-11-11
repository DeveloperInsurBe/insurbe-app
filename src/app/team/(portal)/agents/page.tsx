import { redirect } from "next/navigation";

import { getCurrentTeamAdmin } from "@/lib/team/access";
import { getTeamAgents } from "@/lib/team/data";
import { InviteLink, RateEditor } from "./AgentsClient";

export const dynamic = "force-dynamic";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" });

export default async function TeamAgentsPage() {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const { agents, defaultRate } = await getTeamAgents(teamAdmin.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Agents</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Agents who joined through your invite link. New agents start on the InsurBe default rate of {euro.format(defaultRate)}.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">Your invite link for new agents</h2>
        <InviteLink inviteCode={teamAdmin.inviteCode} />
      </section>

      {agents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No agents yet</p>
          <p className="mt-1 text-xs text-gray-500">Agents appear here once they sign up with your invite link.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid">
            <span>Agent</span>
            <span className="text-right">Clients</span>
            <span className="text-right">Applications</span>
            <span>Rate / application</span>
            <span className="text-right">Commission</span>
          </div>
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="grid grid-cols-2 gap-3 border-t border-gray-100 px-4 py-3 first:border-t-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] lg:items-center lg:gap-4"
            >
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <p className="truncate text-sm font-semibold text-gray-900">{agent.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {[agent.companyName, agent.email].filter(Boolean).join(" · ")} · joined {formatDate(agent.joinedAt)}
                </p>
              </div>
              <p className="text-xs text-gray-500 lg:text-right lg:text-sm lg:font-semibold lg:text-gray-900">
                <span className="lg:hidden">Clients </span>
                {agent.clients}
              </p>
              <p className="text-right text-xs text-gray-500 lg:text-sm lg:font-semibold lg:text-gray-900">
                <span className="lg:hidden">Applications </span>
                {agent.applications}
              </p>
              <div className="col-span-2 lg:col-span-1">
                <RateEditor agent={agent} limit={teamAdmin.commissionLimit} />
              </div>
              <div className="col-span-2 text-xs text-gray-500 lg:col-span-1 lg:text-right">
                <p className="text-sm font-bold text-[#820ad1]">{euro.format(agent.commission.total)}</p>
                <p>
                  {euro.format(agent.commission.pending)} pending · {euro.format(agent.commission.paid)} paid
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
