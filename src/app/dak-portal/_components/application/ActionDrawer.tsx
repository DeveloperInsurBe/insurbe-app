"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronDown, FileText, Info, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { DAK_CATEGORIES, DAK_MAX_UPLOAD_BYTES, DAK_REQUEST_CATEGORIES, DAK_REQUEST_PRIORITIES } from "@/lib/dak/statuses";
import { api, fmtDateTime, fmtLongDate, fmtSize, todayInput, uploadToApplication, type DakCaseDetail } from "../../_lib/client";
import { Button, FormField, InfoRows, inputClass, SlideOver } from "../ui";

export type DrawerKind = "start_review" | "request_info" | "approve" | "allocate" | "cancel" | "not_eligible";

const TITLES: Record<DrawerKind, string> = {
  start_review: "Start Review",
  request_info: "Request Information",
  approve: "Approve Application",
  allocate: "Insurance Allocation",
  cancel: "Cancel Application",
  not_eligible: "Not Eligible",
};

const SUBMIT_LABELS: Record<DrawerKind, string> = {
  start_review: "Start Review",
  request_info: "Send Request",
  approve: "Confirm Approval",
  allocate: "Confirm Allocation",
  cancel: "Cancel Application",
  not_eligible: "Confirm Not Eligible",
};

const FORM_ID = "dak-action-form";

function Notice({ tone = "violet", children }: { tone?: "violet" | "amber" | "rose"; children: React.ReactNode }) {
  const styles = {
    violet: "border-violet-200 bg-violet-50/70 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
  };
  const Icon = tone === "violet" ? Info : AlertCircle;
  return (
    <div className={`flex gap-2.5 rounded-2xl border px-4 py-3.5 text-sm leading-6 ${styles[tone]}`}>
      <Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

function Select({ id, value, onChange, options, placeholder }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} h-11 cursor-pointer appearance-none pr-10`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
    </div>
  );
}

type Result = { emailSent?: boolean | null };

export default function ActionDrawer({
  kind,
  application,
  onClose,
  onDone,
}: {
  kind: DrawerKind | null;
  application: DakCaseDetail;
  onClose: () => void;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // request information
  const [category, setCategory] = useState<string>(DAK_REQUEST_CATEGORIES[0]);
  const [relatedField, setRelatedField] = useState("");
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<string>("Normal");
  // approve / close
  const [note, setNote] = useState("");
  // allocation
  const [membershipNumber, setMembershipNumber] = useState("");
  const [kvnr, setKvnr] = useState("");
  const [svnr, setSvnr] = useState("");
  const [startDate, setStartDate] = useState("");
  const [contribution, setContribution] = useState("");
  const [letter, setLetter] = useState<File | null>(null);
  const letterRef = useRef<HTMLInputElement>(null);

  // Fresh form every time a drawer opens.
  useEffect(() => {
    if (!kind) return;
    setSaving(false);
    setError("");
    setCategory(DAK_REQUEST_CATEGORIES[0]);
    setRelatedField("");
    setMessage("");
    setInternalNote("");
    setDueDate("");
    setPriority("Normal");
    setNote("");
    setMembershipNumber("");
    setKvnr("");
    setSvnr("");
    setStartDate(application.applicant.requestedStartDate?.slice(0, 10) ?? "");
    setContribution(application.applicant.category ?? "");
    setLetter(null);
  }, [kind, application]);

  const path = `/applications/${encodeURIComponent(application.id)}`;
  const pendingDocuments = application.documents.filter((document) => document.reviewStatus === "pending").length;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!kind) return;
    setError("");

    if (kind === "allocate" && letter && (letter.type !== "application/pdf" || letter.size > DAK_MAX_UPLOAD_BYTES)) {
      return setError("The membership letter must be a PDF of at most 10 MB.");
    }

    setSaving(true);
    try {
      let result: Result;
      if (kind === "request_info") {
        result = await api<Result>(`${path}/requests`, {
          method: "POST",
          json: { category, relatedField, message, internalNote, dueDate, priority },
        });
      } else if (kind === "allocate") {
        // The letter goes straight to storage first, so its size is not limited by the server.
        const uploaded = letter ? await uploadToApplication(application.id, letter) : null;
        result = await api<Result>(`${path}/allocate`, {
          method: "POST",
          json: {
            membershipNumber,
            kvnr,
            svnr,
            startDate,
            contributionCategory: contribution,
            letterPath: uploaded?.storagePath,
            letterName: uploaded?.name,
          },
        });
      } else {
        const closing = kind === "cancel" || kind === "not_eligible";
        result = await api<Result>(`${path}/actions`, {
          method: "POST",
          json: { action: kind, note: closing ? undefined : note, reason: closing ? note : undefined },
        });
      }

      toast.success(
        {
          start_review: "Review started",
          request_info: "Request sent to the customer",
          approve: "Application approved",
          allocate: "Insurance allocated — application is now Active",
          cancel: "Application cancelled",
          not_eligible: "Application marked as not eligible",
        }[kind],
      );
      if (result.emailSent === false) toast.warning("The status was saved, but the email to the customer could not be sent.");
      onDone();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const danger = kind === "cancel" || kind === "not_eligible";

  return (
    <SlideOver
      open={!!kind}
      onClose={onClose}
      title={kind ? TITLES[kind] : ""}
      subtitle={`${application.applicant.name} · ${application.id}`}
      footer={
        kind && (
          <>
            <Button onClick={onClose} className="h-12 w-full">
              Cancel
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              variant={danger ? "danger" : "primary"}
              loading={saving}
              className="h-12 w-full"
            >
              {SUBMIT_LABELS[kind]}
            </Button>
          </>
        )
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-6">
        {kind === "start_review" && (
          <>
            <Notice>
              This will move the application from <b>Submitted</b> to <b>In Review</b> and record your action in the audit log.
            </Notice>
            <InfoRows
              rows={[
                { label: "Applicant", value: application.applicant.name },
                { label: "Category", value: application.applicant.category },
                { label: "Submitted", value: fmtDateTime(application.submittedAt) },
                { label: "Requested start", value: application.applicant.requestedStartDate && fmtLongDate(application.applicant.requestedStartDate) },
                { label: "Documents", value: `${application.documents.length} attached` },
              ]}
            />
          </>
        )}

        {kind === "request_info" && (
          <>
            <FormField id="dak-request-category" label="Request category">
              <Select id="dak-request-category" value={category} onChange={setCategory} options={DAK_REQUEST_CATEGORIES} />
            </FormField>
            <FormField id="dak-request-field" label="Related document or field">
              <input
                id="dak-request-field"
                value={relatedField}
                onChange={(event) => setRelatedField(event.target.value)}
                placeholder="e.g. Passport, Enrolment Certificate…"
                maxLength={200}
                className={`${inputClass} h-11`}
              />
            </FormField>
            <FormField id="dak-request-message" label="Message to customer" required hint="Sent to the customer by email.">
              <textarea
                id="dak-request-message"
                required
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe exactly what the customer needs to provide…"
                rows={5}
                maxLength={4000}
                className={`${inputClass} py-3`}
              />
            </FormField>
            <FormField id="dak-request-note" label="Internal note (not shown to customer)">
              <textarea
                id="dak-request-note"
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Reviewer notes only…"
                rows={3}
                maxLength={4000}
                className={`${inputClass} py-3`}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField id="dak-request-due" label="Due date">
                <input
                  id="dak-request-due"
                  type="date"
                  min={todayInput()}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={`${inputClass} h-11`}
                />
              </FormField>
              <FormField id="dak-request-priority" label="Priority">
                <Select id="dak-request-priority" value={priority} onChange={setPriority} options={DAK_REQUEST_PRIORITIES} />
              </FormField>
            </div>
          </>
        )}

        {kind === "approve" && (
          <>
            {pendingDocuments > 0 && (
              <Notice tone="amber">
                {pendingDocuments} {pendingDocuments === 1 ? "document is" : "documents are"} not yet marked as reviewed.
              </Notice>
            )}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
              <InfoRows
                rows={[
                  { label: "Applicant", value: application.applicant.name },
                  { label: "Category", value: application.applicant.category },
                  { label: "Requested start", value: application.applicant.requestedStartDate && fmtLongDate(application.applicant.requestedStartDate) },
                ]}
              />
            </div>
            <FormField id="dak-approve-note" label="Internal approval note (optional)">
              <textarea
                id="dak-approve-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional notes for the audit record…"
                rows={4}
                maxLength={4000}
                className={`${inputClass} py-3`}
              />
            </FormField>
            <p className="text-sm text-slate-500">
              Approval sets the application to <b className="text-slate-700">Approved</b>. Insurance allocation details must be
              confirmed in a separate step before the customer is notified.
            </p>
          </>
        )}

        {kind === "allocate" && (
          <>
            <FormField id="dak-alloc-membership" label="DAK membership number" required>
              <input
                id="dak-alloc-membership"
                required
                value={membershipNumber}
                onChange={(event) => setMembershipNumber(event.target.value)}
                placeholder="DAK-M-0000000"
                maxLength={100}
                className={`${inputClass} h-11`}
              />
            </FormField>
            <FormField id="dak-alloc-kvnr" label="KVNR (health insurance number)">
              <input
                id="dak-alloc-kvnr"
                value={kvnr}
                onChange={(event) => setKvnr(event.target.value)}
                placeholder="A000000000"
                maxLength={100}
                className={`${inputClass} h-11`}
              />
            </FormField>
            <FormField id="dak-alloc-svnr" label="SVNR (social insurance number)">
              <input
                id="dak-alloc-svnr"
                value={svnr}
                onChange={(event) => setSvnr(event.target.value)}
                placeholder="Optional"
                maxLength={100}
                className={`${inputClass} h-11`}
              />
            </FormField>
            <FormField id="dak-alloc-start" label="Confirmed start date" required>
              <input
                id="dak-alloc-start"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={`${inputClass} h-11`}
              />
            </FormField>
            <FormField id="dak-alloc-category" label="Contribution / member category">
              <Select id="dak-alloc-category" value={contribution} onChange={setContribution} options={DAK_CATEGORIES} placeholder="Select…" />
            </FormField>

            <input
              ref={letterRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => setLetter(event.target.files?.[0] ?? null)}
            />
            {letter ? (
              <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 px-4 py-3">
                <FileText className="h-5 w-5 text-violet-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{letter.name}</p>
                  <p className="text-xs text-slate-500">{fmtSize(letter.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLetter(null);
                    if (letterRef.current) letterRef.current.value = "";
                  }}
                  aria-label="Remove letter"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => letterRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-violet-200 px-4 py-6 text-sm text-slate-600 transition hover:border-violet-300 hover:bg-violet-50/40"
              >
                <Upload className="h-5 w-5 text-slate-500" aria-hidden />
                Upload membership confirmation letter
                <span className="text-xs text-slate-400">PDF, max 10 MB</span>
              </button>
            )}

            <Notice tone="amber">
              The application becomes <b>Active</b> and can no longer be changed. The customer receives an email with these
              details{letter ? " and the letter" : ""}.
            </Notice>
          </>
        )}

        {danger && (
          <>
            <Notice tone="rose">
              {kind === "cancel"
                ? "The application will be cancelled. The customer can submit a new application later."
                : "The application will be closed as not eligible. The customer cannot apply again."}{" "}
              This cannot be undone.
            </Notice>
            <FormField id="dak-close-reason" label="Reason for the customer" required hint="This reason is emailed to the customer.">
              <textarea
                id="dak-close-reason"
                required
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={kind === "cancel" ? "Why is the application cancelled?" : "Why is the customer not eligible?"}
                rows={5}
                maxLength={4000}
                className={`${inputClass} py-3`}
              />
            </FormField>
          </>
        )}

        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
          </p>
        )}
      </form>
    </SlideOver>
  );
}
