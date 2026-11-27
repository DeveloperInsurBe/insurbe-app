import { notFound, redirect } from "next/navigation";

import { getCurrentPartnerAccess } from "@/lib/applicationAccess";
import {
  BULK_CONSENT_TEXT,
  BULK_CONSENT_VERSION,
  BULK_MAX_ROWS,
  DRAFT_STATUS_LABELS,
  dakBulkUploadEnabled,
} from "@/lib/dak/bulk/config";
import { prisma } from "@/lib/prisma";
import BulkUploadClient from "./BulkUploadClient";
import ResendButton from "./ResendButton";

export const dynamic = "force-dynamic";

const formatDate = (date: Date) =>
  date.toLocaleString("de-DE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });

/** Partner portal: DAK bulk upload (partners only, behind DAK_BULK_UPLOAD). */
export default async function DakBulkUploadPage() {
  if (!dakBulkUploadEnabled()) notFound();
  const { partner } = await getCurrentPartnerAccess();
  if (!partner?.id || !partner.partnerId) redirect("/portal/dashboard");

  const [batches, drafts, reusedRows] = await Promise.all([
    prisma.dakImportBatch.findMany({
      where: { partnerUserId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, fileName: true, rowCount: true, importedCount: true, heldCount: true, errorCount: true, createdAt: true },
    }),
    prisma.dakDraft.findMany({
      where: { partnerRef: partner.partnerId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, reference: true, firstName: true, lastName: true, email: true, status: true, createdAt: true },
    }),
    // People in an upload who were already imported before (kept, not counted as new).
    prisma.dakImportRow.groupBy({
      by: ["batchId"],
      where: { status: "already_imported", batch: { partnerUserId: partner.id } },
      _count: { _all: true },
    }),
  ]);
  const alreadyImported = (batchId: string) => reusedRows.find((row) => row.batchId === batchId)?._count._all ?? 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-4 py-4 shadow-[0_12px_40px_rgba(130,10,209,0.08)] sm:px-5 sm:py-5">
        <span className="inline-flex rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">
          DAK only
        </span>
        <h1 className="mt-2 text-xl font-black tracking-tight text-[#111827] sm:text-2xl">Bulk DAK applications</h1>
        <p className="mt-0.5 max-w-2xl text-sm text-[#667085]">
          Upload several people at once. Each person gets an email from InsurBe to check their details, upload their documents
          and submit the DAK application themselves. Nothing is sent to DAK before that.
        </p>
      </section>

      <BulkUploadClient consentText={BULK_CONSENT_TEXT} consentVersion={BULK_CONSENT_VERSION} maxRows={BULK_MAX_ROWS} />

      <section className="rounded-2xl border border-[#f0e6fb] bg-white p-4 shadow-[0_10px_35px_rgba(130,10,209,0.06)] sm:p-5">
        <h2 className="text-lg font-black text-[#111827]">Your uploads</h2>
        {batches.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No uploads yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {batches.map((batch) => (
              <li key={batch.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-900">{batch.fileName}</span>
                  <span className="block text-xs text-gray-500">{formatDate(batch.createdAt)} · {batch.rowCount} rows</span>
                </span>
                <span className="flex gap-1.5 text-xs font-bold">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">{batch.importedCount} new</span>
                  {alreadyImported(batch.id) ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{alreadyImported(batch.id)} already imported</span>
                  ) : null}
                  {batch.heldCount ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">{batch.heldCount} on hold</span> : null}
                  {batch.errorCount ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">{batch.errorCount} errors</span> : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[#f0e6fb] bg-white p-4 shadow-[0_10px_35px_rgba(130,10,209,0.06)] sm:p-5">
        <h2 className="text-lg font-black text-[#111827]">Applications from your uploads</h2>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No applications yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className="border-t border-gray-100">
                    <td className="py-2 pr-3 font-mono text-xs text-gray-600">{draft.reference}</td>
                    <td className="py-2 pr-3 font-medium text-gray-900">{`${draft.firstName} ${draft.lastName}`}</td>
                    <td className="max-w-[220px] truncate py-2 pr-3 text-gray-600">{draft.email}</td>
                    <td className="py-2">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f3e8ff] px-2 py-0.5 text-xs font-bold text-[#820ad1]">
                          {DRAFT_STATUS_LABELS[draft.status] ?? draft.status}
                        </span>
                        {draft.status === "email_failed" || draft.status === "expired" ? <ResendButton draftId={draft.id} /> : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
