"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileEdit } from "lucide-react";

type Draft = { id: string; reference: string; status: string; statusLabel: string; partnerName: string };

/** "Complete your DAK application" for drafts a partner prepared (DAK bulk upload). Hidden when there are none. */
export default function DakDraftsCard() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/customer/dak-drafts", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { drafts: [] }))
      .then((data) => active && setDrafts(Array.isArray(data.drafts) ? data.drafts : []))
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  if (!drafts.length) return null;

  return (
    <div className="mb-6 space-y-3">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="flex flex-col gap-3 rounded-2xl border border-[#e9d7ff] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white">
              <FileEdit size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900">Complete your DAK application</p>
              <p className="mt-0.5 text-sm text-gray-600">
                Prepared by {draft.partnerName} · <span className="font-mono text-xs">{draft.reference}</span>
              </p>
              <span className="mt-1.5 inline-flex rounded-full bg-[#f3e8ff] px-2 py-0.5 text-xs font-bold text-[#820ad1]">
                {draft.statusLabel}
              </span>
            </div>
          </div>
          {draft.status === "submitting" ? (
            <span className="text-sm font-semibold text-gray-500">Submitting…</span>
          ) : (
            <Link
              href={`/dashboard/dak-draft/${draft.id}`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white hover:bg-[#6d08b0]"
            >
              Continue <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
