"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Link2,
  Loader2,
  Mail,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import CountUp from "../CountUp";

type DocRef = {
  name: string;
  url?: string;
  type: string;
  size: number | null;
  uploadedAt: string;
  source: "external-link" | "supabase";
  bucket?: string;
  storagePath?: string;
};

type MawsitaRow = {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  planName: string;
  planType: string | null;
  startDate: string | null;
  endDate: string | null;
  premiumAmount: number | null;
  status: string;
  notes: string | null;
  documents: unknown;
  createdByEmail: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const STATUSES = ["Purchased", "Pending Docs", "On Hold", "Cancelled"] as const;

const emptyDoc = {
  name: "",
  url: "",
  type: "",
  size: "",
  source: "external-link" as const,
  bucket: "",
  storagePath: "",
};

type DocDraft = {
  name: string;
  url: string;
  type: string;
  size: string;
  source: "external-link" | "supabase";
  bucket: string;
  storagePath: string;
};

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  planName: string;
  planType: string;
  startDate: string;
  endDate: string;
  premiumAmount: string;
  status: (typeof STATUSES)[number];
  notes: string;
  documents: DocDraft[];
};

const initialForm: FormState = {
  customerName: "",
  email: "",
  phone: "",
  planName: "",
  planType: "",
  startDate: "",
  endDate: "",
  premiumAmount: "",
  status: "Purchased",
  notes: "",
  documents: [{ ...emptyDoc }],
};

function normalizeDocs(input: unknown): DocRef[] {
  const docs = Array.isArray(input) ? input : [];

  return docs
    .map((doc) => {
      const candidate = (doc || {}) as Record<string, unknown>;
      const name = String(candidate.name || "").trim();
      const url = String(candidate.url || "").trim();
      const source =
        String(candidate.source || "").trim() === "supabase"
          ? ("supabase" as const)
          : ("external-link" as const);
      const bucket = String(candidate.bucket || "").trim();
      const storagePath = String(candidate.storagePath || "").trim();
      if (!name) return null;
      if (source === "external-link" && !url) return null;
      if (source === "supabase" && (!bucket || !storagePath)) return null;

      return {
        name,
        url: String(candidate.url || "").trim() || undefined,
        type: String(candidate.type || "").trim() || "external-link",
        size:
          typeof candidate.size === "number"
            ? candidate.size
            : Number.parseInt(String(candidate.size || ""), 10) || null,
        uploadedAt: String(candidate.uploadedAt || "").trim() || new Date().toISOString(),
        source,
        bucket: bucket || undefined,
        storagePath: storagePath || undefined,
      };
    })
    .filter(Boolean) as DocRef[];
}

export default function MawsitaClient({ initialRows }: { initialRows: MawsitaRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [openingDocKey, setOpeningDocKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;

      const haystack = [
        row.customerName,
        row.email,
        row.phone || "",
        row.planName,
        row.planType || "",
        row.status,
        row.notes || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, rows, statusFilter]);

  const summary = useMemo(() => {
    const total = rows.length;
    const purchased = rows.filter((row) => row.status === "Purchased").length;
    const pendingDocs = rows.filter((row) => row.status === "Pending Docs").length;
    return { total, purchased, pendingDocs };
  }, [rows]);

  const setFormField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setDocField = (index: number, field: keyof DocDraft, value: string) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc,
      ),
    }));
  };

  const addDoc = () => {
    setForm((prev) => ({ ...prev, documents: [...prev.documents, { ...emptyDoc }] }));
  };

  const removeDoc = (index: number) => {
    setForm((prev) => {
      const next = prev.documents.filter((_, i) => i !== index);
      return { ...prev, documents: next.length ? next : [{ ...emptyDoc }] };
    });
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const openEdit = (row: MawsitaRow) => {
    const docs = normalizeDocs(row.documents);
    setEditId(row.id);
    setEditForm({
      customerName: row.customerName,
      email: row.email,
      phone: row.phone || "",
      planName: row.planName,
      planType: row.planType || "",
      startDate: row.startDate || "",
      endDate: row.endDate || "",
      premiumAmount:
        typeof row.premiumAmount === "number" ? String(row.premiumAmount) : "",
      status: STATUSES.includes(row.status as (typeof STATUSES)[number])
        ? (row.status as (typeof STATUSES)[number])
        : "Purchased",
      notes: row.notes || "",
      documents: docs.length
        ? docs.map((doc) => ({
            name: doc.name,
            url: doc.url || "",
            type: doc.type,
            size: doc.size != null ? String(doc.size) : "",
            source: doc.source,
            bucket: doc.bucket || "",
            storagePath: doc.storagePath || "",
          }))
        : [{ ...emptyDoc }],
    });
  };

  const closeEdit = () => {
    setEditId("");
    setEditForm(null);
  };

  const setEditField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const setEditDocField = (index: number, field: keyof DocDraft, value: string) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.map((doc, i) =>
          i === index ? { ...doc, [field]: value } : doc,
        ),
      };
    });
  };

  const addEditDoc = () => {
    setEditForm((prev) =>
      prev ? { ...prev, documents: [...prev.documents, { ...emptyDoc }] } : prev,
    );
  };

  const removeEditDoc = (index: number) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const next = prev.documents.filter((_, i) => i !== index);
      return { ...prev, documents: next.length ? next : [{ ...emptyDoc }] };
    });
  };

  const uploadToSupabase = async (files: FileList | null) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    const response = await fetch("/api/admin/mawsita/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || "Failed to upload files");
    }

    const uploaded = Array.isArray(data?.uploaded)
      ? (data.uploaded as Record<string, unknown>[])
      : [];
    return uploaded.map((doc) => ({
      name: String(doc.name || "").trim(),
      url: "",
      type: String(doc.type || "").trim(),
      size: String(doc.size || ""),
      source: "supabase" as const,
      bucket: String(doc.bucket || "").trim(),
      storagePath: String(doc.storagePath || "").trim(),
    }));
  };

  const handleCreateUpload = async (files: FileList | null) => {
    setUploadingCreate(true);
    setError("");
    try {
      const uploaded = await uploadToSupabase(files);
      if (!uploaded.length) return;
      setForm((prev) => ({
        ...prev,
        documents: [
          ...prev.documents.filter((doc) => doc.name || doc.url || doc.storagePath),
          ...uploaded,
        ],
      }));
      setSuccess("File uploaded to Supabase storage.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setUploadingCreate(false);
    }
  };

  const handleEditUpload = async (files: FileList | null) => {
    setUploadingEdit(true);
    setError("");
    try {
      const uploaded = await uploadToSupabase(files);
      if (!uploaded.length) return;
      setEditForm((prev) =>
        prev
          ? {
              ...prev,
              documents: [
                ...prev.documents.filter(
                  (doc) => doc.name || doc.url || doc.storagePath,
                ),
                ...uploaded,
              ],
            }
          : prev,
      );
      setSuccess("File uploaded to Supabase storage.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setUploadingEdit(false);
    }
  };

  const openDocument = async (doc: DocRef) => {
    if (doc.source === "external-link" && doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (doc.source !== "supabase" || !doc.bucket || !doc.storagePath) {
      setError("Document reference is invalid.");
      return;
    }

    const docKey = `${doc.bucket}:${doc.storagePath}`;
    setOpeningDocKey(docKey);
    setError("");
    try {
      const response = await fetch("/api/admin/mawsita/document-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: doc.bucket,
          storagePath: doc.storagePath,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.signedUrl) {
        throw new Error(data?.error || "Unable to open document");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open document");
    } finally {
      setOpeningDocKey("");
    }
  };

  const createRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const documents = form.documents
        .map((doc) => ({
          name: doc.name.trim(),
          type: doc.type.trim(),
          size: doc.size.trim(),
          source: doc.source,
          url: doc.url.trim(),
          bucket: doc.bucket.trim(),
          storagePath: doc.storagePath.trim(),
          uploadedAt: new Date().toISOString(),
        }))
        .filter(
          (doc) =>
            doc.name &&
            ((doc.source === "external-link" && doc.url) ||
              (doc.source === "supabase" && doc.bucket && doc.storagePath)),
        );

      const response = await fetch("/api/admin/mawsita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          documents,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to save record");
      }

      setRows((prev) => [data, ...prev]);
      resetForm();
      setSuccess("Mawsita record saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/mawsita/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update status");
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: data.status, updatedAt: data.updatedAt } : row,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setUpdatingId("");
    }
  };

  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editId || !editForm) return;

    setEditing(true);
    setError("");
    setSuccess("");

    try {
      const documents = editForm.documents
        .map((doc) => ({
          name: doc.name.trim(),
          type: doc.type.trim(),
          size: doc.size.trim(),
          source: doc.source,
          url: doc.url.trim(),
          bucket: doc.bucket.trim(),
          storagePath: doc.storagePath.trim(),
          uploadedAt: new Date().toISOString(),
        }))
        .filter(
          (doc) =>
            doc.name &&
            ((doc.source === "external-link" && doc.url) ||
              (doc.source === "supabase" && doc.bucket && doc.storagePath)),
        );

      const response = await fetch(`/api/admin/mawsita/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          documents,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update record");
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === editId
            ? {
                ...row,
                customerName: data.customerName,
                email: data.email,
                phone: data.phone,
                planName: data.planName,
                planType: data.planType,
                startDate: data.startDate,
                endDate: data.endDate,
                premiumAmount: data.premiumAmount,
                status: data.status,
                notes: data.notes,
                documents: data.documents,
                updatedAt: data.updatedAt,
              }
            : row,
        ),
      );
      closeEdit();
      setSuccess("Mawsita record updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update record");
    } finally {
      setEditing(false);
    }
  };

  const deleteRecord = async (id: string) => {
    const ok = window.confirm("Delete this Mawsita record permanently?");
    if (!ok) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/mawsita/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete record");
      }

      setRows((prev) => prev.filter((row) => row.id !== id));
      if (editId === id) closeEdit();
      setSuccess("Mawsita record deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record");
    } finally {
      setDeletingId("");
    }
  };

  const statusCount = (status: string) =>
    rows.filter((row) => row.status === status).length;

  const recordFieldsCreate = {
    form,
    setField: setFormField,
    setDocField,
    addDoc,
    removeDoc,
    uploading: uploadingCreate,
    onUpload: handleCreateUpload,
  };

  return (
    <div className="min-w-0 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">Mawsita</h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Purchased Mawsita plans, premiums and customer documents
          </p>
        </div>
        <p className="text-xs text-gray-400">{summary.total} records</p>
      </div>

      {/* MESSAGES */}
      {error || success ? (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{error || success}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
            }}
            aria-label="Dismiss"
            className="rounded p-0.5 opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* STATUS TILES (also filter the list) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatusTile
          label="All records"
          value={summary.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
          dot="bg-gray-400"
        />
        {STATUSES.map((status) => (
          <StatusTile
            key={status}
            label={status}
            value={
              status === "Purchased"
                ? summary.purchased
                : status === "Pending Docs"
                  ? summary.pendingDocs
                  : statusCount(status)
            }
            active={statusFilter === status}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            dot={STATUS_STYLE[status].dot}
          />
        ))}
      </div>

      {/* CREATE */}
      <details
        open
        className="group rounded-2xl border border-gray-200 bg-white"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#820ad1]/10 text-[#820ad1]">
              <Plus className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-bold text-gray-900 sm:text-base">
                Add manual record
              </span>
              <span className="block text-xs text-gray-500">
                Customer, plan, premium and documents
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>

        <form
          onSubmit={createRecord}
          className="border-t border-gray-100 p-4 sm:p-5"
        >
          <RecordFields {...recordFieldsCreate} />

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Clear
            </button>
            <button
              disabled={saving}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save record"}
            </button>
          </div>
        </form>
      </details>

      {/* SEARCH */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, plan or notes…"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
        />
      </div>

      {/* RECORDS */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No Mawsita records found</p>
          <p className="mt-1 text-xs text-gray-500">
            Try another search or status, or add a record above.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_9.5rem_5rem] gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 xl:grid">
            <span>Customer</span>
            <span>Plan</span>
            <span>Premium</span>
            <span>Documents</span>
            <span>Status</span>
            <span />
          </div>

          {filtered.map((row) => {
            const docs = normalizeDocs(row.documents);

            return (
              <div
                key={row.id}
                className="grid grid-cols-1 gap-3 border-t border-gray-100 p-4 first:border-t-0 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_9.5rem_5rem] xl:items-center xl:gap-4 xl:px-4 xl:py-3"
              >
                {/* CUSTOMER */}
                <div className="flex min-w-0 items-start gap-3 sm:col-span-2 xl:col-span-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-xs font-black text-[#820ad1]">
                    {initials(row.customerName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {row.customerName}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{row.email}</span>
                    </p>
                    {row.phone ? (
                      <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                        <Phone className="h-3 w-3 shrink-0" />
                        {row.phone}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1 xl:hidden">
                    <RowActions
                      onEdit={() => openEdit(row)}
                      onDelete={() => deleteRecord(row.id)}
                      deleting={deletingId === row.id}
                    />
                  </div>
                </div>

                {/* PLAN */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{row.planName}</p>
                  <p className="truncate text-xs text-gray-500">
                    {row.planType || "No plan type"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(row.startDate)} → {formatDate(row.endDate)}
                  </p>
                </div>

                {/* PREMIUM */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 xl:hidden">
                    Premium
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {row.premiumAmount != null ? `€${row.premiumAmount}` : "—"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Added {formatDate(String(row.createdAt))}
                  </p>
                </div>

                {/* DOCUMENTS */}
                <div className="min-w-0">
                  {docs.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {docs.slice(0, 3).map((doc, index) => {
                        const opening =
                          openingDocKey === `${doc.bucket}:${doc.storagePath}`;

                        return (
                          <button
                            key={`${doc.storagePath || doc.url || doc.name}-${index}`}
                            type="button"
                            onClick={() => void openDocument(doc)}
                            title={doc.name}
                            className="inline-flex max-w-[11rem] items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:border-[#820ad1]/30 hover:bg-[#820ad1]/5 hover:text-[#820ad1]"
                          >
                            {opening ? (
                              <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                            ) : doc.source === "supabase" ? (
                              <FileText className="h-3 w-3 shrink-0" />
                            ) : (
                              <Link2 className="h-3 w-3 shrink-0" />
                            )}
                            <span className="truncate">{opening ? "Opening..." : doc.name}</span>
                          </button>
                        );
                      })}
                      {docs.length > 3 ? (
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-100"
                        >
                          +{docs.length - 3} more
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Paperclip className="h-3 w-3" />
                      No documents
                    </span>
                  )}
                  {row.notes ? (
                    <p className="mt-1.5 line-clamp-2 text-[11px] italic text-gray-500" title={row.notes}>
                      {row.notes}
                    </p>
                  ) : null}
                </div>

                {/* STATUS */}
                <div className="sm:col-span-2 xl:col-span-1">
                  <StatusSelect
                    value={row.status}
                    disabled={updatingId === row.id}
                    onChange={(status) => updateStatus(row.id, status)}
                  />
                </div>

                {/* ACTIONS (DESKTOP) */}
                <div className="hidden justify-end gap-1 xl:flex">
                  <RowActions
                    onEdit={() => openEdit(row)}
                    onDelete={() => deleteRecord(row.id)}
                    deleting={deletingId === row.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT */}
      {editForm ? (
        <EditDialog onClose={closeEdit} busy={editing}>
          <form onSubmit={saveEdit} className="flex max-h-[92vh] flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#820ad1]">
                  Edit record
                </p>
                <h3 className="truncate text-lg font-black text-gray-900">
                  {editForm.customerName || "Mawsita record"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <RecordFields
                form={editForm}
                setField={setEditField}
                setDocField={setEditDocField}
                addDoc={addEditDoc}
                removeDoc={removeEditDoc}
                uploading={uploadingEdit}
                onUpload={handleEditUpload}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={closeEdit}
                className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editing}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </EditDialog>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

const STATUS_STYLE: Record<(typeof STATUSES)[number], { dot: string; pill: string }> = {
  Purchased: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "Pending Docs": {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "On Hold": {
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Cancelled: {
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
};

const fieldClass =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 disabled:bg-gray-100 disabled:text-gray-400";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusTile({
  label,
  value,
  active,
  onClick,
  dot,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  dot: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
        active
          ? "border-[#820ad1]/30 bg-white shadow-sm ring-2 ring-[#820ad1]/15"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <span className={`mt-1 block text-2xl font-black ${active ? "text-[#820ad1]" : "text-gray-900"}`}>
        <CountUp value={value} />
      </span>
    </button>
  );
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (status: string) => void;
}) {
  const style =
    STATUS_STYLE[value as (typeof STATUSES)[number]]?.pill ??
    "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className="relative inline-flex w-full items-center sm:w-auto xl:w-full">
      <select
        aria-label="Status"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 w-full cursor-pointer appearance-none rounded-full border py-0 pl-3 pr-8 text-xs font-semibold outline-none focus:ring-4 focus:ring-[#820ad1]/10 disabled:cursor-wait disabled:opacity-60 ${style}`}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {disabled ? (
        <Loader2 className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 animate-spin opacity-70" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 opacity-60" />
      )}
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit record"
        title="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#820ad1]/10 hover:text-[#820ad1]"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        aria-label="Delete record"
        title="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </>
  );
}

function EditDialog({
  children,
  onClose,
  busy,
}: {
  children: React.ReactNode;
  onClose: () => void;
  busy: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Mawsita record"
        className="relative w-full max-w-3xl overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function RecordFields({
  form,
  setField,
  setDocField,
  addDoc,
  removeDoc,
  uploading,
  onUpload,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  setDocField: (index: number, field: keyof DocDraft, value: string) => void;
  addDoc: () => void;
  removeDoc: (index: number) => void;
  uploading: boolean;
  onUpload: (files: FileList | null) => Promise<void>;
}) {
  return (
    <div className="space-y-5">
      <Section title="Customer">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Customer name *"
            value={form.customerName}
            onChange={(value) => setField("customerName", value)}
            placeholder="Full name"
          />
          <Input
            label="Email *"
            value={form.email}
            onChange={(value) => setField("email", value)}
            placeholder="name@example.com"
            type="email"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(value) => setField("phone", value)}
            placeholder="+49..."
          />
        </div>
      </Section>

      <Section title="Plan">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Plan name *"
            value={form.planName}
            onChange={(value) => setField("planName", value)}
            placeholder="Mawsita Plan"
          />
          <Input
            label="Plan type"
            value={form.planType}
            onChange={(value) => setField("planType", value)}
            placeholder="Student / Expat / Family"
          />
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value as FormState["status"])}
              className={fieldClass}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Start date"
            value={form.startDate}
            onChange={(value) => setField("startDate", value)}
            type="date"
          />
          <Input
            label="End date"
            value={form.endDate}
            onChange={(value) => setField("endDate", value)}
            type="date"
          />
          <Input
            label="Premium (EUR)"
            value={form.premiumAmount}
            onChange={(value) => setField("premiumAmount", value)}
            placeholder="120.50"
          />
        </div>
      </Section>

      <Section title="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          rows={3}
          placeholder="Internal note for this purchase"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
        />
      </Section>

      <Section title="Documents">
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Upload files to Supabase storage or add an external link.
            </p>
            <div className="flex gap-2">
              <label
                className={`inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#820ad1] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#6f08b2] sm:flex-none ${
                  uploading ? "pointer-events-none opacity-70" : ""
                }`}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? "Uploading..." : "Upload files"}
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => {
                    void onUpload(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={addDoc}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#820ad1]/20 bg-white px-3 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/5 sm:flex-none"
              >
                <Link2 className="h-3.5 w-3.5" />
                Add link
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {form.documents.map((doc, index) => (
              <div
                key={`${index}-${doc.name}-${doc.url}`}
                className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-2.5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.8fr)_5.5rem_7rem_2.5rem] lg:items-center"
              >
                <div className="col-span-2 flex items-center gap-2 lg:col-span-1">
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      doc.source === "supabase"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {doc.source === "supabase" ? "File" : "Link"}
                  </span>
                  <input
                    value={doc.name}
                    onChange={(e) => setDocField(index, "name", e.target.value)}
                    placeholder="Document name"
                    aria-label="Document name"
                    className={fieldClass}
                  />
                </div>
                <input
                  value={doc.url}
                  onChange={(e) => setDocField(index, "url", e.target.value)}
                  placeholder={
                    doc.source === "supabase" ? "Managed by Supabase upload" : "https://..."
                  }
                  aria-label="Document URL"
                  disabled={doc.source === "supabase"}
                  className={`${fieldClass} col-span-2 lg:col-span-1`}
                />
                <input
                  value={doc.type}
                  onChange={(e) => setDocField(index, "type", e.target.value)}
                  placeholder="pdf"
                  aria-label="Document type"
                  className={fieldClass}
                />
                <input
                  value={doc.size}
                  onChange={(e) => setDocField(index, "size", e.target.value)}
                  placeholder="Size (bytes)"
                  aria-label="Document size in bytes"
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={() => removeDoc(index)}
                  aria-label="Remove document"
                  title="Remove"
                  className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 lg:col-span-1 lg:border-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="lg:hidden">Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}
