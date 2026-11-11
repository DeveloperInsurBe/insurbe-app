"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, Loader2, Pencil, X } from "lucide-react";

import type { TeamAgentRow } from "@/lib/team/data";

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function InviteLink({ inviteCode }: { inviteCode: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!inviteCode) {
    return <p className="text-sm text-gray-500">No invite link yet. Please contact InsurBe.</p>;
  }
  const url = () => `${window.location.origin}/partner-access/signup?type=agent&invite=${encodeURIComponent(inviteCode)}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Link2 className="hidden h-4 w-4 shrink-0 text-gray-400 sm:block" />
      <p className="min-w-0 flex-1 truncate font-mono text-xs text-gray-600">
        …/partner-access/signup?type=agent&amp;invite={inviteCode}
      </p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#820ad1] px-4 text-xs font-semibold text-white hover:bg-[#6d08b0]"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy invite link"}
      </button>
    </div>
  );
}

/** Rate per application for one agent, up to the team admin's limit. */
export function RateEditor({ agent, limit }: { agent: TeamAgentRow; limit: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Math.min(agent.rate, limit)));
  const [applyToPending, setApplyToPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#820ad1]"
        title="Change this agent's rate"
      >
        {euro.format(agent.rate)}
        <span className={`rounded px-1.5 py-px text-[10px] font-bold uppercase ${agent.customRate !== null ? "bg-[#820ad1]/10 text-[#820ad1]" : "bg-gray-100 text-gray-500"}`}>
          {agent.customRate !== null ? "Custom" : "Default"}
        </span>
        <Pencil className="h-3.5 w-3.5 text-gray-400" />
      </button>
    );
  }

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/team/agents/${agent.id}/rate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: Number(value), applyToPending }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not update the rate");
      setEditing(false);
      router.refresh();
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-500">€</span>
        <input
          type="number"
          min={0}
          max={limit}
          step={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-8 w-20 rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-[#820ad1]"
          aria-label={`Rate for ${agent.name} in EUR`}
        />
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#820ad1] p-1.5 text-white disabled:opacity-60" aria-label="Save">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500" aria-label="Cancel">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-[11px] text-gray-400">Your limit: {euro.format(limit)} per application</p>
      {agent.pendingCount > 0 ? (
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <input type="checkbox" checked={applyToPending} onChange={(event) => setApplyToPending(event.target.checked)} />
          Also update {agent.pendingCount} pending {agent.pendingCount === 1 ? "commission" : "commissions"}
        </label>
      ) : null}
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
