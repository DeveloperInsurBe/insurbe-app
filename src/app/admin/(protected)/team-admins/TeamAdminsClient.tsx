"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, Link2, Loader2, Pencil, Plus, Power, RefreshCw, X } from "lucide-react";

export type TeamAdminRow = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  commissionLimit: number;
  inviteCode: string | null;
  createdAt: string;
  agents: number;
  applications: number;
  commission: number;
};

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const inputClass =
  "h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10";

/** Agent signup link for a team admin. */
const inviteUrl = (code: string) => `${window.location.origin}/partner-access/signup?type=agent&invite=${encodeURIComponent(code)}`;

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

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** One-time display of a new password. */
function PasswordNotice({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
  return (
    <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-emerald-900">Password for {email}</p>
          <p className="mt-0.5 text-xs text-emerald-800">
            Shown only once. Share it securely; they sign in at /team/login.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-gray-900">{password}</code>
        <CopyButton text={password} label="Copy" />
      </div>
    </div>
  );
}

function LimitEditor({ row, onSaved }: { row: TeamAdminRow; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(row.commissionLimit));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#820ad1]"
        title="Change the commission limit"
      >
        {euro.format(row.commissionLimit)} <Pencil className="h-3.5 w-3.5 text-gray-400" />
      </button>
    );
  }

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await call(`/api/admin/team-admins/${row.id}`, "PATCH", { action: "set_limit", commissionLimit: Number(value) });
      setEditing(false);
      onSaved();
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-500">€</span>
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-8 w-20 rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-[#820ad1]"
          aria-label="Commission limit in EUR"
        />
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#820ad1] p-1.5 text-white disabled:opacity-60" aria-label="Save">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500" aria-label="Cancel">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {error ? <p className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

export default function TeamAdminsClient({ rows }: { rows: TeamAdminRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", commissionLimit: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ email: string; password: string } | null>(null);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("create");
    setError("");
    try {
      const data = await call<{ email: string; password: string }>("/api/admin/team-admins", "POST", {
        ...form,
        commissionLimit: Number(form.commissionLimit),
      });
      setNotice({ email: data.email, password: data.password });
      setForm({ email: "", firstName: "", lastName: "", commissionLimit: "" });
      setShowForm(false);
      router.refresh();
    } catch (createError) {
      setError((createError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const act = async (row: TeamAdminRow, action: "reset_password" | "new_invite" | "disable" | "enable") => {
    const confirmText = {
      reset_password: `Create a new password for ${row.email}? The old one stops working.`,
      new_invite: `Create a new invite link for ${row.name}? The old link stops working; agents who already joined stay.`,
      disable: `Disable ${row.email}? They can no longer sign in and their invite link stops working.`,
      enable: null,
    }[action];
    if (confirmText && !window.confirm(confirmText)) return;

    setBusy(`${action}:${row.id}`);
    setError("");
    try {
      const data = await call<{ password?: string }>(`/api/admin/team-admins/${row.id}`, "PATCH", { action });
      if (data.password) setNotice({ email: row.email, password: data.password });
      router.refresh();
    } catch (actError) {
      setError((actError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const spinning = (action: string, row: TeamAdminRow) => busy === `${action}:${row.id}`;

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
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] lg:items-end">
            <label className="text-xs font-semibold text-gray-600">
              Email *
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              First name *
              <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Last name
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-gray-600">
              Commission limit (€) *
              <input
                type="number"
                required
                min={0}
                step={1}
                value={form.commissionLimit}
                onChange={(e) => setForm({ ...form, commissionLimit: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy === "create"}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#820ad1] px-4 text-sm font-semibold text-white hover:bg-[#6d08b0] disabled:opacity-60"
              >
                {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              The commission limit is the highest rate per application a team admin may give their agents.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#820ad1] px-4 text-sm font-semibold text-white hover:bg-[#6d08b0]"
            >
              <Plus className="h-4 w-4" /> Add team admin
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No team admins yet</p>
          <p className="mt-1 text-xs text-gray-500">Add one, then share their invite link with new agents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900">{row.name}</h2>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        row.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{row.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => act(row, "reset_password")}
                    disabled={!!busy}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {spinning("reset_password", row) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                    Reset password
                  </button>
                  <button
                    type="button"
                    onClick={() => act(row, row.active ? "disable" : "enable")}
                    disabled={!!busy}
                    className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold disabled:opacity-50 ${
                      row.active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {spinning("disable", row) || spinning("enable", row) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                    {row.active ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-gray-400">Commission limit</dt>
                  <dd className="mt-1">
                    <LimitEditor row={row} onSaved={() => router.refresh()} />
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">Agents</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">{row.agents}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Applications</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">{row.applications}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Commission</dt>
                  <dd className="mt-1 text-sm font-bold text-[#820ad1]">{euro.format(row.commission)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-col gap-2 rounded-xl bg-gray-50 p-3 sm:flex-row sm:items-center">
                <Link2 className="hidden h-4 w-4 shrink-0 text-gray-400 sm:block" />
                <p className="min-w-0 flex-1 truncate font-mono text-xs text-gray-600">
                  {row.inviteCode ? `…/partner-access/signup?type=agent&invite=${row.inviteCode}` : "No invite link"}
                </p>
                <div className="flex gap-2">
                  {row.inviteCode && row.active ? <CopyButton text={inviteUrl(row.inviteCode)} label="Copy invite link" /> : null}
                  <button
                    type="button"
                    onClick={() => act(row, "new_invite")}
                    disabled={!!busy}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
                  >
                    {spinning("new_invite", row) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    New link
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
