"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Mail, MapPin, Phone, X } from "lucide-react";

import type { ApplicationRow } from "@/app/admin/(protected)/applications/shared";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const COMMISSION_TONE: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "Not Eligible": "bg-gray-100 text-gray-600 border-gray-200",
};

const KIND_STYLE: Record<ApplicationRow["kind"], string> = {
  TK: "bg-blue-50 text-blue-700 border-blue-200",
  DAK: "bg-emerald-50 text-emerald-700 border-emerald-200",
  private: "bg-[#820ad1]/5 text-[#820ad1] border-[#820ad1]/20",
};

const formatDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Berlin",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

const formatStatus = (status: string) => status.replace(/[_-]+/g, " ").replace(/^./, (char) => char.toUpperCase());

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}>{children}</span>;
}

/** Applications of the team's customers. Read-only: payouts are handled by InsurBe. */
export default function CustomersTable({ rows }: { rows: ApplicationRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSelectedId(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_1.25rem] gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid">
          <span>Customer</span>
          <span>Product</span>
          <span>Agent</span>
          <span>Commission</span>
          <span />
        </div>
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setSelectedId(row.id)}
            className="flex w-full flex-col gap-2 border-t border-gray-100 px-4 py-3 text-left transition-colors first:border-t-0 hover:bg-[#820ad1]/[0.03] lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_1.25rem] lg:items-center lg:gap-4"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-gray-900">{row.name || "Unnamed"}</span>
              <span className="block truncate text-xs text-gray-500">{row.email || row.orderId}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Badge className={KIND_STYLE[row.kind]}>{row.kind === "private" ? "Private" : row.kind}</Badge>
              <span className="min-w-0">
                <span className="block truncate text-xs text-gray-700">{formatDate(row.createdAt)}</span>
                {row.dak ? <span className="block truncate text-[11px] text-gray-500">DAK: {row.dak.status}</span> : null}
              </span>
            </span>
            <span className="truncate text-xs text-gray-600">{row.referrer || "—"}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{euro.format(row.commission)}</span>
              <Badge className={COMMISSION_TONE[row.commissionStatus] ?? COMMISSION_TONE.Pending}>{row.commissionStatus}</Badge>
            </span>
            <ChevronRight className="hidden h-4 w-4 text-gray-300 lg:block" />
          </button>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
          <button aria-label="Close details" onClick={() => setSelectedId(null)} className="absolute inset-0 bg-black/40" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Application details"
            className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="truncate text-base font-black text-gray-900">{selected.name || "Unnamed"}</p>
                <p className="truncate font-mono text-xs text-gray-500">{selected.orderId}</p>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={KIND_STYLE[selected.kind]}>{selected.kind === "private" ? "Private" : selected.kind}</Badge>
                <Badge className="border-gray-200 bg-gray-50 text-gray-700">{formatStatus(selected.status)}</Badge>
                {selected.dak ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">DAK: {selected.dak.status}</Badge> : null}
                <span className="text-xs text-gray-500">{formatDate(selected.createdAt, true)}</span>
              </div>

              <section className="rounded-xl border border-gray-200 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Commission</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-[#820ad1]">{euro.format(selected.commission)}</span>
                  <Badge className={COMMISSION_TONE[selected.commissionStatus] ?? COMMISSION_TONE.Pending}>{selected.commissionStatus}</Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Agent: <span className="font-semibold text-gray-700">{selected.referrer || "—"}</span>
                </p>
              </section>

              <section className="space-y-2.5 rounded-xl border border-gray-200 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Contact</p>
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
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Application details</p>
                <dl className="mt-2 divide-y divide-gray-100">
                  {[["Product", selected.product], ...selected.extra].map(([label, value], index) => (
                    <div key={`${label}-${index}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 py-2 text-sm">
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
