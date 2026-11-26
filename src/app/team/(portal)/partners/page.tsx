import { redirect } from "next/navigation";

import { PARTNER_CATEGORY_LABELS, SHOW_PARTNER_CATEGORIES } from "@/lib/partnerCategory";
import { getCurrentTeamAdmin } from "@/lib/team/access";
import { getTeamMembers } from "@/lib/team/data";
import { InviteLink, RateEditor } from "./PartnersClient";

export const dynamic = "force-dynamic";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" });

const CATEGORY_TONE = {
  agent: "bg-emerald-50 text-emerald-700",
  referral: "bg-[#820ad1]/10 text-[#820ad1]",
  institutional: "bg-sky-50 text-sky-700",
} as const;

export default async function TeamPartnersPage() {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const { members, defaults } = await getTeamMembers(teamAdmin.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Partners</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Partners who joined through your invite link. New agents start on the InsurBe default of {euro.format(defaults.agent)},
          other partners on {euro.format(defaults.partner)} per application.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Your invite link for new partners</h2>
        <p className="mb-3 mt-1 text-xs text-gray-500">
          {SHOW_PARTNER_CATEGORIES
            ? "Partners choose their category (Agent, Referral or Institutional Partner) when they sign up."
            : "New partners who sign up with this link join your team as Referral Partners."}
        </p>
        <InviteLink inviteCode={teamAdmin.inviteCode} />
      </section>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No partners yet</p>
          <p className="mt-1 text-xs text-gray-500">Partners appear here once they sign up with your invite link.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid">
            <span>Partner</span>
            <span className="text-right">Clients</span>
            <span className="text-right">Applications</span>
            <span>Rate / application</span>
            <span className="text-right">Their commission</span>
          </div>
          {members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-2 gap-3 border-t border-gray-100 px-4 py-3 first:border-t-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,1.2fr)] lg:items-center lg:gap-4"
            >
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <p className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">{member.name}</span>
                  <span className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold uppercase ${CATEGORY_TONE[member.category]}`}>
                    {PARTNER_CATEGORY_LABELS[member.category]}
                  </span>
                </p>
                <p className="truncate text-xs text-gray-500">
                  {[member.companyName, member.email].filter(Boolean).join(" · ")} · joined {formatDate(member.joinedAt)}
                </p>
              </div>
              <p className="text-xs text-gray-500 lg:text-right lg:text-sm lg:font-semibold lg:text-gray-900">
                <span className="lg:hidden">Clients </span>
                {member.clients}
              </p>
              <p className="text-right text-xs text-gray-500 lg:text-sm lg:font-semibold lg:text-gray-900">
                <span className="lg:hidden">Applications </span>
                {member.applications}
              </p>
              <div className="col-span-2 lg:col-span-1">
                <RateEditor member={member} limit={teamAdmin.commissionLimit} />
              </div>
              <div className="col-span-2 text-xs text-gray-500 lg:col-span-1 lg:text-right">
                <p className="text-sm font-bold text-[#820ad1]">{euro.format(member.commission.total)}</p>
                <p>
                  {euro.format(member.commission.pending)} pending · {euro.format(member.commission.paid)} paid
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
