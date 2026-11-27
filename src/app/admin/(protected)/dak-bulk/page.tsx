import Link from "next/link";
import { notFound } from "next/navigation";

import { DRAFT_STATUS_LABELS, dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatDate = (date: Date) =>
  date.toLocaleString("de-DE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });

const STATUS_FILTERS = ["all", "awaiting", "submitted", "problems"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
const AWAITING = ["imported", "sending", "invitation_sent", "started", "documents_pending", "ready", "submitting"];
const PROBLEMS = ["email_failed", "expired"];

/** Super Admin: every DAK bulk upload, held rows with their reason, and all drafts. */
export default async function AdminDakBulkPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  if (!dakBulkUploadEnabled()) notFound();
  const { show } = await searchParams;
  const filter: StatusFilter = STATUS_FILTERS.includes(show as StatusFilter) ? (show as StatusFilter) : "all";
  const statusWhere =
    filter === "awaiting" ? { in: AWAITING } : filter === "submitted" ? { in: ["submitted"] } : filter === "problems" ? { in: PROBLEMS } : undefined;

  const [batches, held, drafts, grouped] = await Promise.all([
    prisma.dakImportBatch.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.dakImportRow.findMany({
      where: { status: "held" },
      orderBy: { batch: { createdAt: "desc" } },
      take: 50,
      select: { id: true, rowNumber: true, data: true, errors: true, batch: { select: { fileName: true, partnerUserId: true, createdAt: true } } },
    }),
    prisma.dakDraft.findMany({
      where: statusWhere ? { status: statusWhere } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, reference: true, firstName: true, lastName: true, email: true, status: true, partnerUserId: true, inviteError: true, createdAt: true, applicationId: true },
    }),
    prisma.dakDraft.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const partnerIds = [...new Set([...batches.map((b) => b.partnerUserId), ...held.map((r) => r.batch.partnerUserId), ...drafts.map((d) => d.partnerUserId)])];
  const partners = await prisma.user.findMany({ where: { id: { in: partnerIds } }, select: { id: true, companyName: true, email: true } });
  const partnerName = (id: string) => {
    const partner = partners.find((item) => item.id === id);
    return partner?.companyName || partner?.email || "—";
  };
  const count = (statuses: string[]) => grouped.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + row._count._all, 0);

  const card = "rounded-2xl border border-gray-200 bg-white p-4 sm:p-5";

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">DAK bulk uploads</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Partner uploads and the drafts they created. Drafts reach the DAK portal only when the customer submits them.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Awaiting customer", value: count(AWAITING), tone: "text-amber-600" },
          { label: "Submitted", value: count(["submitted"]), tone: "text-emerald-600" },
          { label: "Email failed / expired", value: count(PROBLEMS), tone: "text-red-600" },
          { label: "On hold rows", value: held.length, tone: "text-gray-900" },
        ].map((item) => (
          <div key={item.label} className={card}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-black ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <section className={card}>
        <h2 className="text-sm font-bold text-gray-900">Uploads</h2>
        {batches.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No uploads yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Partner</th>
                  <th className="py-2 pr-3">File</th>
                  <th className="py-2 pr-3">Rows</th>
                  <th className="py-2 pr-3">New / held / errors</th>
                  <th className="py-2">Consent</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="border-t border-gray-100">
                    <td className="py-2 pr-3 text-gray-600">{formatDate(batch.createdAt)}</td>
                    <td className="py-2 pr-3 font-medium text-gray-900">{partnerName(batch.partnerUserId)}</td>
                    <td className="max-w-[180px] truncate py-2 pr-3 text-gray-600">{batch.fileName}</td>
                    <td className="py-2 pr-3">{batch.rowCount}</td>
                    <td className="py-2 pr-3">
                      <span className="text-emerald-700">{batch.importedCount}</span> / <span className="text-amber-700">{batch.heldCount}</span> /{" "}
                      <span className="text-red-700">{batch.errorCount}</span>
                    </td>
                    <td className="py-2 text-xs text-gray-500">
                      v{batch.consentVersion} · {formatDate(batch.consentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-gray-900">On hold (only InsurBe sees the reason)</h2>
        {held.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Nothing on hold.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {held.map((row) => {
              const data = (row.data ?? {}) as Record<string, string>;
              const reasons = Array.isArray(row.errors) ? (row.errors as string[]) : [];
              return (
                <li key={row.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-900">
                      {[data.first_name, data.last_name].filter(Boolean).join(" ") || "—"} · {data.email || "—"}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {partnerName(row.batch.partnerUserId)} · {row.batch.fileName} · row {row.rowNumber}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-amber-700">{reasons.join("; ") || "On hold"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-gray-900">Drafts</h2>
          <nav className="flex gap-1 text-xs font-semibold">
            {STATUS_FILTERS.map((item) => (
              <Link
                key={item}
                href={`/admin/dak-bulk?show=${item}`}
                className={`rounded-lg px-2.5 py-1.5 ${filter === item ? "bg-[#820ad1]/10 text-[#820ad1]" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {item === "all" ? "All" : item === "awaiting" ? "Awaiting customer" : item === "submitted" ? "Submitted" : "Problems"}
              </Link>
            ))}
          </nav>
        </div>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No drafts.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Partner</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id} className="border-t border-gray-100">
                    <td className="py-2 pr-3 font-mono text-xs text-gray-600">{draft.reference}</td>
                    <td className="py-2 pr-3">
                      <span className="block font-medium text-gray-900">{`${draft.firstName} ${draft.lastName}`.trim()}</span>
                      <span className="block text-xs text-gray-500">{draft.email}</span>
                    </td>
                    <td className="py-2 pr-3 text-gray-600">{partnerName(draft.partnerUserId)}</td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-[#f3e8ff] px-2 py-0.5 text-xs font-bold text-[#820ad1]">
                        {DRAFT_STATUS_LABELS[draft.status] ?? draft.status}
                      </span>
                      {draft.inviteError ? <span className="mt-1 block text-[11px] text-red-600">{draft.inviteError}</span> : null}
                    </td>
                    <td className="py-2 text-xs text-gray-500">{formatDate(draft.createdAt)}</td>
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
