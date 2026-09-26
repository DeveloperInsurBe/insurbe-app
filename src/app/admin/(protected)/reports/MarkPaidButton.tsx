"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function MarkPaidButton({
  source,
  referrerKey,
  name,
  amount,
  count,
  from,
  to,
  periodLabel,
}: {
  source: "partner" | "agent";
  referrerKey: string;
  name: string;
  amount: number;
  count: number;
  from: string;
  to: string;
  periodLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving]);

  if (count === 0) return null;

  const confirm = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/reports/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, referrerKey, from, to }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.error || "Failed to update");

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setError("");
          setOpen(true);
        }}
        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Mark paid
      </button>

      {open
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => !saving && setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mark commissions as paid"
            className="relative w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <h3 className="mt-3 text-center text-lg font-black text-gray-900">
              Mark €{amount} as paid?
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600">
              {count} approved commission{count === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-gray-900">{name}</span> from{" "}
              {periodLabel} will move to <b>Paid</b>. Do this after the transfer
              has been sent.
            </p>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={saving}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Mark paid
              </button>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
