"use client";

import { type FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CalendarDays, CheckCircle2, ChevronDown, Download, Loader2, Paperclip, Send, X, XCircle } from "lucide-react";

import type { CustomerDakApplication } from "@/lib/dak/customer";

export type { CustomerDakApplication };

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data as T;
}

/** Uploads one file straight to secure storage and returns its reference. */
async function uploadFile(applicationNumber: string, file: File) {
  const { storagePath, uploadUrl } = await postJson<{ storagePath: string; uploadUrl: string }>(
    `/api/customer/dak/${encodeURIComponent(applicationNumber)}/uploads`,
    { name: file.name, type: file.type, size: file.size },
  );
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type, "x-upsert": "false" },
    body: file,
  });
  if (!response.ok) throw new Error(`${file.name} could not be uploaded. Please try again.`);
  return { storagePath, name: file.name };
}

/** Customer's answer to one DAK request: a message and optional files. */
function ReplyForm({
  applicationNumber,
  requestId,
  onSent,
  onCancel,
}: {
  applicationNumber: string;
  requestId: string;
  onSent: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (list: FileList | null) => {
    setError("");
    const picked = Array.from(list ?? []);
    const invalid = picked.find((file) => !ALLOWED_TYPES.includes(file.type) || file.size > MAX_BYTES);
    if (invalid) setError(`${invalid.name}: please use a PDF, JPG or PNG of at most 10 MB.`);
    const valid = picked.filter((file) => ALLOWED_TYPES.includes(file.type) && file.size <= MAX_BYTES);
    setFiles((current) => [...current, ...valid].slice(0, MAX_FILES));
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() && !files.length) return setError("Please write a message or attach a file.");
    setSending(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadFile(applicationNumber, file));
      await postJson(
        `/api/customer/dak/${encodeURIComponent(applicationNumber)}/requests/${requestId}/reply`,
        { message, files: uploaded },
      );
      onSent();
    } catch (sendError) {
      setError((sendError as Error).message);
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 border-t border-amber-100 pt-3">
      <label className="block">
        <span className="text-[11px] font-semibold text-gray-600">Your message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="Write your answer for DAK…"
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
        />
      </label>

      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
        {files.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {files.map((file, fileIndex) => (
              <li key={`${file.name}-${fileIndex}`} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                <span className="flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((current) => current.filter((_, index) => index !== fileIndex))}
                  aria-label={`Remove ${file.name}`}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {files.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            <Paperclip className="w-3.5 h-3.5" /> Attach file (PDF, JPG, PNG · max 10 MB)
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {sending ? "Sending…" : "Send to DAK"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={sending}
          className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Berlin",
      })
    : "—";

type Tone = { pill: string; dot: string; bar: string; box: string; boxTitle: string };

const TONES: Record<"progress" | "action" | "done" | "closed", Tone> = {
  progress: {
    pill: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
    box: "bg-blue-50",
    boxTitle: "text-blue-600",
  },
  action: {
    pill: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    box: "bg-amber-50",
    boxTitle: "text-amber-700",
  },
  done: {
    pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    box: "bg-emerald-50",
    boxTitle: "text-emerald-600",
  },
  closed: {
    pill: "bg-gray-100 border-gray-200 text-gray-600",
    dot: "bg-gray-400",
    bar: "bg-gray-300",
    box: "bg-gray-50",
    boxTitle: "text-gray-600",
  },
};

const toneFor = (status: CustomerDakApplication["status"]) =>
  status === "Information Required"
    ? TONES.action
    : status === "Active"
      ? TONES.done
      : status === "Cancelled" || status === "Not Eligible"
        ? TONES.closed
        : TONES.progress;

function DakCard({ app, index, onChanged }: { app: CustomerDakApplication; index: number; onChanged: () => void }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState(false);
  const tone = toneFor(app.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start sm:items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-600 font-bold text-sm">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">DAK Health Insurance</p>
            <p className="text-xs text-gray-400">
              {app.applicationNumber} · submitted {formatDate(app.submittedAt)}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full border ${tone.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
            {app.label}
          </span>
        </div>

        {/* Next step */}
        <div className={`mt-4 rounded-xl px-4 py-3 ${tone.box}`}>
          <p className={`text-[11px] font-semibold mb-0.5 ${tone.boxTitle}`}>
            {app.status === "Active" ? "All done" : app.reason !== null ? "Status" : "What happens next"}
          </p>
          <p className="text-xs text-gray-600">{app.nextStep}</p>
        </div>

        {/* Information DAK needs */}
        {app.requests.length > 0 && (
          <div className="mt-4 space-y-2">
            {app.requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-amber-200 bg-white px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {request.topic ? `DAK needs: ${request.topic}` : "DAK needs more information"}
                </p>
                <p className="mt-1 text-xs text-gray-700 whitespace-pre-line">{request.message}</p>
                {request.dueDate && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                    <CalendarDays className="w-3 h-3" /> Please send by {formatDate(request.dueDate)}
                  </p>
                )}
                {replyingTo === request.id ? (
                  <ReplyForm
                    applicationNumber={app.applicationNumber}
                    requestId={request.id}
                    onCancel={() => setReplyingTo(null)}
                    onSent={() => {
                      setReplyingTo(null);
                      setSentNotice(true);
                      onChanged();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(request.id)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {sentNotice && (
          <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4" /> Thank you. Your reply was sent to DAK.
          </p>
        )}

        {/* Membership */}
        {app.membership && (
          <div className="mt-4 rounded-xl border border-emerald-100 px-4 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Your membership
            </p>
            <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-gray-400">Membership number</dt>
                <dd className="font-semibold text-gray-900">{app.membership.number || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Insured from</dt>
                <dd className="font-semibold text-gray-900">{formatDate(app.membership.startDate)}</dd>
              </div>
            </dl>
            {app.letter && (
              <a
                href={`/api/customer/dak/letter/${app.letter.id}`}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download membership letter
              </a>
            )}
          </div>
        )}

        {/* Reason (cancelled / not accepted) */}
        {app.reason && (
          <div className="mt-4 rounded-xl border border-gray-200 px-4 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
              <XCircle className="w-3.5 h-3.5" /> Reason
            </p>
            <p className="mt-1 text-xs text-gray-700 whitespace-pre-line">{app.reason}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-400">Application progress</span>
            <span className="text-[11px] font-bold text-gray-500">{app.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${tone.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${app.progress}%` }}
              transition={{ delay: 0.3 + index * 0.06, duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Timeline */}
        {app.timeline.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowTimeline((value) => !value)}
              aria-expanded={showTimeline}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800"
            >
              {showTimeline ? "Hide history" : "Show history"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTimeline ? "rotate-180" : ""}`} />
            </button>
            {showTimeline && (
              <ol className="mt-3 space-y-2 border-l-2 border-gray-100 pl-4">
                {app.timeline.map((entry, entryIndex) => (
                  <li key={`${entry.at}-${entryIndex}`} className="text-xs">
                    <p className="font-medium text-gray-700">{entry.label}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(entry.at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** The customer's DAK applications with their live status from the DAK portal. */
export default function DakApplications({
  applications,
  onChanged,
}: {
  applications: CustomerDakApplication[];
  /** Reload after the customer replied. */
  onChanged: () => void;
}) {
  if (!applications.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          DAK {applications.length === 1 ? "Application" : "Applications"}
        </h2>
        <span className="text-xs text-gray-400">{applications.length} total</span>
      </div>
      <div className="space-y-3">
        {applications.map((app, index) => (
          <DakCard key={app.applicationNumber} app={app} index={index} onChanged={onChanged} />
        ))}
      </div>
    </motion.div>
  );
}
