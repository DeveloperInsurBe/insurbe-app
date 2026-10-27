"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Mail, RotateCcw } from "lucide-react";

export type TicketRow = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
  reviewerName: string;
  reviewerEmail: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function SupportClient({ tickets }: { tickets: TicketRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const setStatus = async (ticket: TicketRow, status: "open" | "resolved") => {
    setBusy(ticket.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/dak/support/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not update the message");
      router.refresh();
    } catch (updateError) {
      setError((updateError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-gray-900">No messages here</p>
        <p className="mt-1 text-xs text-gray-500">Messages from DAK reviewers appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {tickets.map((ticket) => (
        <article key={ticket.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">{ticket.subject}</h2>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    ticket.status === "open"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {ticket.status === "open" ? "Open" : "Resolved"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {ticket.reviewerName} · {ticket.reviewerEmail} · {formatDate(ticket.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <a
                href={`mailto:${ticket.reviewerEmail}?subject=${encodeURIComponent(`Re: ${ticket.subject}`)}`}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Mail className="h-3.5 w-3.5" /> Reply
              </a>
              <button
                type="button"
                disabled={busy === ticket.id}
                onClick={() => setStatus(ticket, ticket.status === "open" ? "resolved" : "open")}
                className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold disabled:opacity-60 ${
                  ticket.status === "open"
                    ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {busy === ticket.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : ticket.status === "open" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                {ticket.status === "open" ? "Mark resolved" : "Reopen"}
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800">{ticket.message}</p>
        </article>
      ))}
    </div>
  );
}
