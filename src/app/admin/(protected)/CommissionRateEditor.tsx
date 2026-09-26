"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X } from "lucide-react";

type Props = {
  role: "partner" | "agent";
  /** Omit to edit the default rate for the whole role */
  userId?: string;
  /** Shown in the dialog title, e.g. the partner's name */
  targetName: string;
  /** Custom rate, or null when on the default */
  customRate: number | null;
  defaultRate: number;
  /** Pending commissions that "apply to pending" would re-price */
  pendingCount: number;
  /** Number of partners/agents following the default (default editor only) */
  followersCount?: number;
  variant?: "button" | "icon";
};

export default function CommissionRateEditor({
  role,
  userId,
  targetName,
  customRate,
  defaultRate,
  pendingCount,
  followersCount,
  variant = "button",
}: Props) {
  const router = useRouter();
  const isDefaultEditor = !userId;
  const roleLabel = role === "agent" ? "agent" : "partner";

  const [open, setOpen] = useState(false);
  const [useDefault, setUseDefault] = useState(customRate === null);
  const [value, setValue] = useState(String(customRate ?? defaultRate));
  const [applyToPending, setApplyToPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setUseDefault(!isDefaultEditor && customRate === null);
    setValue(String(customRate ?? defaultRate));
    setApplyToPending(false);
    setError("");
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving]);

  const parsed = Number(value);
  const valueIsValid =
    value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= 1000;
  const nextRate = !isDefaultEditor && useDefault ? defaultRate : parsed;
  const canSave = (!isDefaultEditor && useDefault) || valueIsValid;

  const save = async () => {
    if (!canSave) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/commission-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          userId,
          rate: !isDefaultEditor && useDefault ? null : parsed,
          applyToPending,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.error || "Failed to save");

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(true);
          }}
          aria-label={`Edit commission for ${targetName}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-[#820ad1]/10 hover:text-[#820ad1]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 text-xs font-semibold text-[#820ad1] transition-colors hover:bg-[#820ad1]/10 sm:text-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          {isDefaultEditor ? `Default €${defaultRate}` : "Edit rate"}
        </button>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => !saving && setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit commission rate"
            className="relative w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#820ad1]">
                  Commission per application
                </p>
                <h3 className="mt-1 text-lg font-black text-gray-900">
                  {isDefaultEditor ? `Default for all ${roleLabel}s` : targetName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !saving && setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isDefaultEditor ? (
              <p className="mt-2 text-xs text-gray-500">
                Used by {followersCount ?? 0} {roleLabel}
                {followersCount === 1 ? "" : "s"} without a custom rate.{" "}
                {roleLabel[0].toUpperCase() + roleLabel.slice(1)}s with a custom
                rate keep theirs.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                {[
                  { value: true, label: `Default (€${defaultRate})` },
                  { value: false, label: "Custom rate" },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setUseDefault(option.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      useDefault === option.value
                        ? "bg-white text-[#820ad1] shadow-sm ring-1 ring-[#820ad1]/15"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {isDefaultEditor || !useDefault ? (
              <label className="mt-4 block">
                <span className="text-xs font-semibold text-gray-700">
                  Amount (whole euros)
                </span>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                    €
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={1000}
                    step={1}
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") save();
                    }}
                    className="h-12 w-full rounded-xl border border-gray-200 pl-8 pr-3 text-lg font-black text-gray-900 outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </div>
                {!valueIsValid ? (
                  <span className="mt-1 block text-xs text-red-600">
                    Enter a whole number from 0 to 1000.
                  </span>
                ) : null}
              </label>
            ) : null}

            <label
              className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${
                pendingCount === 0
                  ? "cursor-not-allowed border-gray-100 opacity-60"
                  : "cursor-pointer border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={applyToPending}
                disabled={pendingCount === 0}
                onChange={(e) => setApplyToPending(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#820ad1]"
              />
              <span className="text-sm text-gray-700">
                Also update {pendingCount} pending commission
                {pendingCount === 1 ? "" : "s"}
                {canSave ? ` to €${nextRate}` : ""}
                <span className="mt-0.5 block text-xs text-gray-500">
                  Approved, paid and rejected commissions never change.
                </span>
              </span>
            </label>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
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
                onClick={save}
                disabled={!canSave || saving}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#820ad1] text-sm font-semibold text-white hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-gray-400">
              New applications use the new rate straight away.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
