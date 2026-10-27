"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, Loader2, Plus, Power, X } from "lucide-react";

export type ReviewerRow = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  actions: number;
  lastActionAt: string | null;
};

const formatDate = (iso: string | null, withTime = false) =>
  iso
    ? new Date(iso).toLocaleString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";

const inputClass =
  "h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10";

async function call<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Something went wrong");
  return data as T;
}

/** One-time display of a new password, to hand to the reviewer. */
function PasswordNotice({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-emerald-900">Password for {email}</p>
          <p className="mt-0.5 text-xs text-emerald-800">
            Shown only once. Give it to the reviewer securely; they can change it under Account & Security.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-gray-900">
          {password}
        </code>
        <button
          type="button"
          onClick={copy}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function ReviewersClient({ reviewers }: { reviewers: ReviewerRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ email: string; password: string } | null>(null);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("create");
    setError("");
    try {
      const data = await call<{ email: string; password: string }>("/api/admin/dak/reviewers", "POST", {
        email,
        firstName,
        lastName,
      });
      setNotice({ email: data.email, password: data.password });
      setEmail("");
      setFirstName("");
      setLastName("");
      setShowForm(false);
      router.refresh();
    } catch (createError) {
      setError((createError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const act = async (reviewer: ReviewerRow, action: "reset_password" | "disable" | "enable") => {
    if (action === "disable" && !window.confirm(`Disable ${reviewer.email}? They can no longer sign in to the DAK portal.`)) return;
    if (action === "reset_password" && !window.confirm(`Create a new password for ${reviewer.email}? The old one stops working.`)) return;
    setBusy(`${action}:${reviewer.id}`);
    setError("");
    try {
      const data = await call<{ password?: string }>(`/api/admin/dak/reviewers/${reviewer.id}`, "PATCH", { action });
      if (data.password) setNotice({ email: reviewer.email, password: data.password });
      router.refresh();
    } catch (actError) {
      setError((actError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {notice ? <PasswordNotice {...notice} onClose={() => setNotice(null)} /> : null}
      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        {showForm ? (
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <label className="text-xs font-semibold text-gray-600">
              Email *
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mt-1`} placeholder="name@dak.de" />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              First name *
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Last name
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={`${inputClass} mt-1`} />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy === "create"}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#820ad1] px-4 text-sm font-semibold text-white hover:bg-[#6d08b0] disabled:opacity-60"
              >
                {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create reviewer
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              {reviewers.filter((reviewer) => reviewer.active).length} active · {reviewers.filter((reviewer) => !reviewer.active).length} disabled
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#820ad1] px-4 text-sm font-semibold text-white hover:bg-[#6d08b0]"
            >
              <Plus className="h-4 w-4" /> Add reviewer
            </button>
          </div>
        )}
      </div>

      {reviewers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No DAK reviewers yet</p>
          <p className="mt-1 text-xs text-gray-500">Add the first reviewer to give DAK access to the portal.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="hidden border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] lg:gap-4">
            <span>Reviewer</span>
            <span>Status</span>
            <span>Actions</span>
            <span>Last action</span>
            <span className="w-[230px]" />
          </div>
          {reviewers.map((reviewer) => (
            <div
              key={reviewer.id}
              className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 first:border-t-0 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] lg:items-center lg:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{reviewer.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {reviewer.email} · added {formatDate(reviewer.createdAt)}
                </p>
              </div>
              <span
                className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  reviewer.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-100 text-gray-500"
                }`}
              >
                {reviewer.active ? "Active" : "Disabled"}
              </span>
              <p className="text-xs text-gray-600">{reviewer.actions} actions</p>
              <p className="text-xs text-gray-600">{formatDate(reviewer.lastActionAt, true)}</p>
              <div className="flex gap-2 lg:w-[230px] lg:justify-end">
                <button
                  type="button"
                  onClick={() => act(reviewer, "reset_password")}
                  disabled={!!busy}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {busy === `reset_password:${reviewer.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                  Reset password
                </button>
                <button
                  type="button"
                  onClick={() => act(reviewer, reviewer.active ? "disable" : "enable")}
                  disabled={!!busy}
                  className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold disabled:opacity-50 ${
                    reviewer.active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {busy?.endsWith(`:${reviewer.id}`) && !busy.startsWith("reset") ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Power className="h-3.5 w-3.5" />
                  )}
                  {reviewer.active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
