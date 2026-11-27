"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileText, Loader2, Trash2, Upload } from "lucide-react";

import {
  type DocumentKind,
  type DraftDocument,
  type DraftForm,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_TYPES,
  GENDERS,
  GERMAN_STATES,
  INSURED_BEFORE,
  MARITAL_STATUSES,
  PREVIOUS_INSURANCE_TYPES,
  REASONS,
  YES_NO,
  validateDraftForm,
} from "@/lib/dak/bulk/draftForm";

type Section = "personal" | "selectPlan";

async function sendJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error || "Something went wrong. Please try again."), { data });
  return data as T;
}

const inputClass =
  "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10";

export default function DraftFormClient({
  draftId,
  initialForm,
  initialDocuments,
  countries,
  documentKinds,
  declarations,
  submitError,
}: {
  draftId: string;
  initialForm: DraftForm;
  initialDocuments: Partial<Record<DocumentKind, DraftDocument>>;
  countries: string[];
  documentKinds: { key: DocumentKind; label: string }[];
  declarations: { key: string; text: string }[];
  submitError: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<DraftForm>(initialForm);
  const [documents, setDocuments] = useState(initialDocuments);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [uploading, setUploading] = useState<DocumentKind | null>(null);
  const [docError, setDocError] = useState<Partial<Record<DocumentKind, string>>>({});
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(submitError ?? "");
  const firstRender = useRef(true);

  const errors = useMemo(() => validateDraftForm(form), [form]);
  const errorFor = (key: string) => ((showAllErrors || touched[key]) && errors[key]) || "";

  // Autosave a moment after the last change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("saving");
    const timer = setTimeout(() => {
      sendJson(`/api/customer/dak-drafts/${draftId}`, "PATCH", { form })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 1000);
    return () => clearTimeout(timer);
  }, [form, draftId]);

  const set = (section: Section, key: string, value: string) =>
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));

  const field = (section: Section, key: string, label: string, options?: { required?: boolean; type?: string; readOnly?: boolean; hint?: string }) => {
    const id = `${section}.${key}`;
    const value = (form[section] as Record<string, string>)[key] ?? "";
    const message = errorFor(id);
    return (
      <label className="block" htmlFor={id}>
        <span className="mb-1 block text-sm font-semibold text-gray-700">
          {label}
          {options?.required === false ? <span className="font-normal text-gray-400"> (optional)</span> : null}
        </span>
        <input
          id={id}
          type={options?.type ?? "text"}
          value={value}
          readOnly={options?.readOnly}
          max={options?.type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
          onChange={(event) => set(section, key, event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, [id]: true }))}
          className={`${inputClass} ${message ? "border-red-300" : "border-[#efe3fb]"} ${options?.readOnly ? "bg-gray-50 text-gray-500" : ""}`}
        />
        {options?.hint ? <span className="mt-1 block text-xs text-gray-500">{options.hint}</span> : null}
        {message ? <span className="mt-1 block text-xs font-medium text-red-600">{message}</span> : null}
      </label>
    );
  };

  const select = (section: Section, key: string, label: string, choices: readonly string[], required = true) => {
    const id = `${section}.${key}`;
    const value = (form[section] as Record<string, string>)[key] ?? "";
    const message = errorFor(id);
    return (
      <label className="block" htmlFor={id}>
        <span className="mb-1 block text-sm font-semibold text-gray-700">
          {label}
          {!required ? <span className="font-normal text-gray-400"> (optional)</span> : null}
        </span>
        <select
          id={id}
          value={value}
          onChange={(event) => set(section, key, event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, [id]: true }))}
          className={`${inputClass} ${message ? "border-red-300" : "border-[#efe3fb]"}`}
        >
          <option value="">Please choose</option>
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
        {message ? <span className="mt-1 block text-xs font-medium text-red-600">{message}</span> : null}
      </label>
    );
  };

  const upload = async (kind: DocumentKind, file: File) => {
    setDocError((current) => ({ ...current, [kind]: "" }));
    if (!(DOCUMENT_TYPES as readonly string[]).includes(file.type) || file.size > DOCUMENT_MAX_BYTES) {
      setDocError((current) => ({ ...current, [kind]: "Please choose a PDF, JPG or PNG file of at most 10 MB." }));
      return;
    }
    setUploading(kind);
    try {
      const { storagePath, uploadUrl } = await sendJson<{ storagePath: string; uploadUrl: string }>(
        `/api/customer/dak-drafts/${draftId}/upload-url`,
        "POST",
        { kind, name: file.name, type: file.type, size: file.size },
      );
      const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type, "x-upsert": "false" }, body: file });
      if (!put.ok) throw new Error("The upload failed. Please try again.");
      const result = await sendJson<{ document: DraftDocument }>(`/api/customer/dak-drafts/${draftId}/documents`, "POST", {
        kind,
        storagePath,
        name: file.name,
      });
      setDocuments((current) => ({ ...current, [kind]: result.document }));
    } catch (uploadError) {
      setDocError((current) => ({ ...current, [kind]: (uploadError as Error).message }));
    } finally {
      setUploading(null);
    }
  };

  const remove = async (kind: DocumentKind) => {
    setUploading(kind);
    try {
      await sendJson(`/api/customer/dak-drafts/${draftId}/documents?kind=${kind}`, "DELETE");
      setDocuments((current) => {
        const next = { ...current };
        delete next[kind];
        return next;
      });
    } catch (removeError) {
      setDocError((current) => ({ ...current, [kind]: (removeError as Error).message }));
    } finally {
      setUploading(null);
    }
  };

  const formComplete = Object.keys(errors).length === 0;
  const documentsComplete = documentKinds.every((kind) => documents[kind.key]);
  const declarationsComplete = declarations.every((declaration) => accepted[declaration.key]);

  const submit = async () => {
    setShowAllErrors(true);
    setError("");
    if (!formComplete) {
      setError("Please complete the fields marked in red.");
      return;
    }
    if (!documentsComplete) {
      setError("Please upload all documents.");
      return;
    }
    if (!declarationsComplete) {
      setError("Please confirm all declarations.");
      return;
    }
    setSubmitting(true);
    try {
      // Make sure the latest answers are saved before submitting.
      await sendJson(`/api/customer/dak-drafts/${draftId}`, "PATCH", { form });
      const result = await sendJson<{ applicationNumber?: string }>(`/api/customer/dak-drafts/${draftId}/submit`, "POST", {
        declarations: accepted,
      });
      const successUrl = new URL("/insurance/success", window.location.origin);
      successUrl.searchParams.set("appId", result.applicationNumber || "");
      successUrl.searchParams.set("provider", "dak");
      successUrl.searchParams.set("email", form.personal.email);
      router.push(successUrl.toString());
    } catch (submitFailure) {
      setError((submitFailure as Error).message);
      setSubmitting(false);
    }
  };

  const card = "mt-4 rounded-2xl border border-[#f0e6fb] bg-white p-4 shadow-[0_10px_35px_rgba(130,10,209,0.05)] sm:p-5";
  const grid = "mt-3 grid gap-3 sm:grid-cols-2";
  const reason = form.selectPlan.reason;

  return (
    <div>
      <p className="mt-3 text-right text-xs text-gray-500" aria-live="polite">
        {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved – check your connection" : "All changes saved"}
      </p>

      <section className={card}>
        <h2 className="text-lg font-black text-gray-900">1. About you</h2>
        <div className={grid}>
          {field("personal", "firstName", "First name")}
          {field("personal", "lastName", "Last name")}
          {select("personal", "gender", "Gender", GENDERS)}
          {field("selectPlan", "dob", "Date of birth", { type: "date" })}
          {select("personal", "nationality", "Nationality", countries)}
          {select("personal", "countryOfBirth", "Country of birth", countries)}
          {field("personal", "placeOfBirth", "Place of birth")}
          {form.personal.countryOfBirth === "Germany" ? select("personal", "birthState", "Federal state of birth", GERMAN_STATES) : null}
          {field("personal", "passportNumber", "Passport number")}
          {select("personal", "maritalStatus", "Marital status", MARITAL_STATUSES)}
          {field("personal", "email", "Email", { readOnly: true, hint: "Your invited email address" })}
          <div className="grid grid-cols-[90px_1fr] gap-2">
            {field("personal", "countryCode", "Code")}
            {field("personal", "phoneNumber", "Phone")}
          </div>
        </div>
        <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-gray-500">Address in Germany</h3>
        <div className={grid}>
          {field("personal", "streetNo", "Street and house number")}
          {field("personal", "additionalInfo", "Address addition", { required: false })}
          {field("personal", "postalCode", "Postal code")}
          {field("personal", "city", "City")}
          {select("personal", "country", "Country", countries.length ? countries : ["Germany"])}
          {select("personal", "includeFamilyMembers", "Include family members?", YES_NO)}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-black text-gray-900">2. Your stay</h2>
        <div className={grid}>
          {select("selectPlan", "reason", "Reason for your stay", REASONS)}
          {field(
            "selectPlan",
            "institutionName",
            reason === "Employee" ? "Company name" : reason === "Trainee" ? "Company / training provider" : "University name",
          )}
          {field("personal", "startDate", "Requested insurance start", { type: "date", required: false })}
          {select("selectPlan", "insuredBefore", "Where were you insured before?", INSURED_BEFORE, false)}
          {form.selectPlan.insuredBefore ? (
            <>
              {select("selectPlan", "previousInsuranceType", "Previous insurance type", PREVIOUS_INSURANCE_TYPES)}
              {field("selectPlan", "previousProviderName", "Previous insurance provider")}
            </>
          ) : null}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-black text-gray-900">3. Documents</h2>
        <p className="mt-1 text-sm text-gray-500">PDF, JPG or PNG, up to 10 MB each.</p>
        <div className="mt-3 space-y-2">
          {documentKinds.map((kind) => {
            const document = documents[kind.key];
            return (
              <div key={kind.key} className="rounded-xl border border-gray-200 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    {document ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <FileText size={18} className="shrink-0 text-gray-400" />}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">{kind.label}</span>
                      <span className="block truncate text-xs text-gray-500">
                        {document ? `${document.name} · ${(document.size / 1024 / 1024).toFixed(1)} MB` : "Not uploaded yet"}
                      </span>
                    </span>
                  </span>
                  {uploading === kind.key ? (
                    <Loader2 size={18} className="animate-spin text-[#820ad1]" />
                  ) : (
                    <span className="flex gap-2">
                      <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#e9d7ff] px-3 text-xs font-semibold text-[#820ad1] hover:bg-[#faf7ff]">
                        <Upload size={14} /> {document ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) upload(kind.key, file);
                          }}
                        />
                      </label>
                      {document ? (
                        <button
                          type="button"
                          onClick={() => remove(kind.key)}
                          aria-label={`Remove ${kind.label}`}
                          className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </span>
                  )}
                </div>
                {docError[kind.key] ? <p className="mt-2 text-xs font-medium text-red-600">{docError[kind.key]}</p> : null}
                {showAllErrors && !document ? <p className="mt-2 text-xs font-medium text-red-600">This document is required.</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-black text-gray-900">4. Declarations and submit</h2>
        <div className="mt-3 space-y-2.5">
          {declarations.map((declaration) => (
            <label key={declaration.key} className="flex items-start gap-3 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={!!accepted[declaration.key]}
                onChange={(event) => setAccepted((current) => ({ ...current, [declaration.key]: event.target.checked }))}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#820ad1]"
              />
              <span>{declaration.text}</span>
            </label>
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitting ? "Submitting to DAK…" : "Submit my DAK application"}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">After submitting, you can follow your application in your dashboard.</p>
      </section>
    </div>
  );
}
