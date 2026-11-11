"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Superadmin: which team admin an agent (and their customers) belongs to. */
export default function TeamAdminSelect({
  agentId,
  value,
  options,
}: {
  agentId: string;
  value: string | null;
  options: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const change = async (next: string) => {
    setSaving(true);
    setError(false);
    try {
      const response = await fetch(`/api/admin/agents/${agentId}/team-admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamAdminId: next || null }),
      });
      if (!response.ok) throw new Error("failed");
      setCurrent(next);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <span className="mt-1 inline-flex items-center gap-1.5">
      <select
        aria-label="Team admin"
        value={current}
        disabled={saving}
        onChange={(event) => change(event.target.value)}
        className="h-7 max-w-[180px] cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-semibold text-gray-600 outline-none focus:border-[#820ad1] disabled:opacity-60"
      >
        <option value="">Superadmin (no team)</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            Team: {option.name}
          </option>
        ))}
      </select>
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : null}
      {error ? <span className="text-[11px] font-semibold text-red-600">Failed</span> : null}
    </span>
  );
}
