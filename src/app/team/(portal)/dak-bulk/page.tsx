import { notFound, redirect } from "next/navigation";

import { DRAFT_STATUS_LABELS, dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { prisma } from "@/lib/prisma";
import { getCurrentTeamAdmin } from "@/lib/team/access";
import { getTeamScope } from "@/lib/team/data";

export const dynamic = "force-dynamic";

const formatDate = (date: Date) =>
  date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" });

/** Sales Leader: DAK applications their partners started with a bulk upload (their team only). */
export default async function TeamDakBulkPage() {
  if (!dakBulkUploadEnabled()) notFound();
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const scope = await getTeamScope(teamAdmin.id);
  const drafts = scope.partnerCodes.length
    ? await prisma.dakDraft.findMany({
        where: { partnerRef: { in: scope.partnerCodes } },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, reference: true, firstName: true, lastName: true, status: true, partnerUserId: true, createdAt: true },
      })
    : [];
  const partners = await prisma.user.findMany({
    where: { id: { in: [...new Set(drafts.map((draft) => draft.partnerUserId))] } },
    select: { id: true, companyName: true, firstName: true, lastName: true },
  });
  const partnerName = (id: string) => {
    const partner = partners.find((item) => item.id === id);
    return partner?.companyName || [partner?.firstName, partner?.lastName].filter(Boolean).join(" ") || "—";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">DAK bulk uploads</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          DAK applications your partners started for their customers. Customers complete and submit them themselves.
        </p>
      </div>
      {drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No bulk uploads from your partners yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50/70 text-[11px] font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.id} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{draft.reference}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{`${draft.firstName} ${draft.lastName}`.trim()}</td>
                  <td className="px-4 py-2.5 text-gray-600">{partnerName(draft.partnerUserId)}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-[#f3e8ff] px-2 py-0.5 text-xs font-bold text-[#820ad1]">
                      {DRAFT_STATUS_LABELS[draft.status] ?? draft.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{formatDate(draft.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
