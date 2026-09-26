"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Mail, MapPin, Phone, X } from "lucide-react";

import { initials, statusTone } from "../adminUi";
import { COMMISSION_STATUSES, type ApplicationRow } from "./shared";

const KIND_STYLE: Record<ApplicationRow["kind"], string> = {
  TK: "bg-blue-50 text-blue-700 border-blue-200",
  DAK: "bg-emerald-50 text-emerald-700 border-emerald-200",
  private: "bg-[#820ad1]/5 text-[#820ad1] border-[#820ad1]/20",
};

const SOURCE_LABEL: Record<ApplicationRow["source"], string> = {
  direct: "Direct",
  partner: "Partner",
  agent: "Agent",
};

const COMMISSION_TONE: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "Not Eligible": "bg-gray-100 text-gray-600 border-gray-200",
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formatStatus = (status: string) =>
  status.replace(/[_-]+/g, " ").replace(/^./, (char) => char.toUpperCase());

const formatDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

function KindBadge({ kind }: { kind: ApplicationRow["kind"] }) {
  return (
    <span
      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${KIND_STYLE[kind]}`}
    >
      {kind === "private" ? "Private" : kind}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function CommissionSelect({
  row,
  onChange,
}: {
  row: ApplicationRow;
  onChange: (id: string, status: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <select
          aria-label="Commission status"
          disabled={saving}
          value={row.commissionStatus}
          onChange={async (e) => {
            setSaving(true);
            setError(false);
            try {
              await onChange(row.id, e.target.value);
            } catch {
              setError(true);
            } finally {
              setSaving(false);
            }
          }}
          className={`h-7 cursor-pointer appearance-none rounded-full border py-0 pl-2.5 pr-6 text-[11px] font-semibold outline-none transition-all focus:ring-4 focus:ring-[#820ad1]/10 disabled:cursor-wait disabled:opacity-60 ${
            COMMISSION_TONE[row.commissionStatus] ?? COMMISSION_TONE.Pending
          }`}
        >
          {COMMISSION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 opacity-60" />
      </div>
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : null}
      {error ? (
        <span className="text-[11px] font-semibold text-red-600">Failed</span>
      ) : null}
    </div>
  );
}

export default function ApplicationsTable({
  initialRows,
}: {
  initialRows: ApplicationRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => setRows(initialRows), [initialRows]);

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const updateCommissionStatus = async (id: string, commissionStatus: string) => {
    const response = await fetch(`/api/admin/applications/${id}/commission`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionStatus }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Failed to update status");
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, commissionStatus: data.commissionStatus } : row,
      ),
    );

    // Refresh summary cards and filter counts
    router.refresh();
  };

  const gridCols =
    "lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_1.25rem] lg:items-center lg:gap-4";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* DESKTOP HEADER */}
        <div
          className={`hidden border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 ${gridCols}`}
        >
          <span>Applicant</span>
          <span>Product</span>
          <span>Came via</span>
          <span>Commission</span>
          <span>Status</span>
          <span />
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedId(row.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter") setSelectedId(row.id);
            }}
            className={`flex cursor-pointer flex-col gap-3 border-t border-gray-100 px-4 py-3 transition-colors first:border-t-0 hover:bg-[#820ad1]/[0.03] focus-visible:bg-[#820ad1]/[0.05] focus-visible:outline-none ${gridCols}`}
          >
            {/* APPLICANT */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-xs font-black text-[#820ad1]">
                {initials(row.name || row.email || "?")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {row.name || "Unnamed"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {row.email || row.orderId}
                </p>
              </div>
              <div className="shrink-0 lg:hidden">
                <StatusBadge status={row.status} />
              </div>
            </div>

            {/* PRODUCT */}
            <div className="flex min-w-0 items-center gap-2">
              <KindBadge kind={row.kind} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-700">
                  {row.kind === "private" ? row.product : "Public insurance"}
                </p>
                <p className="truncate font-mono text-[11px] text-gray-400">
                  {row.orderId}
                </p>
              </div>
            </div>

            {/* SOURCE */}
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-semibold text-gray-700">
                {SOURCE_LABEL[row.source]}
              </p>
              {row.referrer ? (
                <p className="truncate text-[11px] text-gray-500">{row.referrer}</p>
              ) : null}
            </div>

            {/* COMMISSION */}
            <div className="flex items-center justify-between gap-3 lg:justify-start">
              <span className="text-xs text-gray-500 lg:hidden">
                {SOURCE_LABEL[row.source]}
                {row.referrer ? ` · ${row.referrer}` : ""}
              </span>
              <div className="flex items-center gap-2">
                <span className="w-12 text-right text-sm font-bold text-gray-900 lg:text-left">
                  {euro.format(row.commission)}
                </span>
                <CommissionSelect row={row} onChange={updateCommissionStatus} />
              </div>
            </div>

            {/* STATUS + DATE */}
            <div className="hidden lg:block">
              <StatusBadge status={row.status} />
              <p className="mt-1 text-[11px] text-gray-500">{formatDate(row.createdAt)}</p>
            </div>

            <ChevronRight className="hidden h-4 w-4 text-gray-300 lg:block" />
          </div>
        ))}
      </div>

      {/* DETAIL DRAWER */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
          <button
            aria-label="Close details"
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Application details"
            className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-sm font-black text-[#820ad1]">
                  {initials(selected.name || selected.email || "?")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-gray-900">
                    {selected.name || "Unnamed"}
                  </p>
                  <p className="truncate font-mono text-xs text-gray-500">
                    {selected.orderId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={selected.kind} />
                <StatusBadge status={selected.status} />
                <span className="text-xs text-gray-500">
                  {formatDate(selected.createdAt, true)}
                </span>
              </div>

              <section className="rounded-xl border border-gray-200 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Commission
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-[#820ad1]">
                    {euro.format(selected.commission)}
                  </span>
                  <CommissionSelect row={selected} onChange={updateCommissionStatus} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Came via{" "}
                  <span className="font-semibold text-gray-700">
                    {SOURCE_LABEL[selected.source]}
                  </span>
                  {selected.referrer ? ` · ${selected.referrer}` : ""}
                </p>
              </section>

              <section className="space-y-2.5 rounded-xl border border-gray-200 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Contact
                </p>
                {[
                  { icon: Mail, value: selected.email },
                  { icon: Phone, value: selected.phone },
                  { icon: MapPin, value: selected.location },
                ].map(({ icon: Icon, value }, index) => (
                  <p key={index} className="flex items-start gap-2 text-sm text-gray-900">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="break-all">{value || "-"}</span>
                  </p>
                ))}
              </section>

              <section className="rounded-xl border border-gray-200 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Application details
                </p>
                <dl className="mt-2 divide-y divide-gray-100">
                  {[
                    ["Product", selected.product],
                    ...selected.extra,
                  ].map(([label, value], index) => (
                    <div
                      key={`${label}-${index}`}
                      className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 py-2 text-sm"
                    >
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="break-words text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
