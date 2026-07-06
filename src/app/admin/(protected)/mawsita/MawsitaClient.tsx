"use client";

import { useMemo, useState } from "react";

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

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Mawsita
        </p>
        <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
          Mawsita Purchased Records
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          admin log for purchased applications, plan details, and document links.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Total Records" value={summary.total} />
        <SummaryCard label="Purchased" value={summary.purchased} />
        <SummaryCard label="Pending Docs" value={summary.pendingDocs} />
      </div>

      <form
        onSubmit={createRecord}
        className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
      >
        <h2 className="text-lg font-black text-gray-900">Add Manual Record</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Customer Name *"
            value={form.customerName}
            onChange={(value) => setFormField("customerName", value)}
            placeholder="Full name"
          />
          <Input
            label="Email *"
            value={form.email}
            onChange={(value) => setFormField("email", value)}
            placeholder="name@example.com"
            type="email"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(value) => setFormField("phone", value)}
            placeholder="+49..."
          />
          <Input
            label="Plan Name *"
            value={form.planName}
            onChange={(value) => setFormField("planName", value)}
            placeholder="Mawsita Plan"
          />
          <Input
            label="Plan Type"
            value={form.planType}
            onChange={(value) => setFormField("planType", value)}
            placeholder="Student / Expat / Family"
          />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setFormField("status", e.target.value as FormState["status"])}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Start Date"
            value={form.startDate}
            onChange={(value) => setFormField("startDate", value)}
            type="date"
          />
          <Input
            label="End Date"
            value={form.endDate}
            onChange={(value) => setFormField("endDate", value)}
            type="date"
          />
          <Input
            label="Premium Amount (EUR)"
            value={form.premiumAmount}
            onChange={(value) => setFormField("premiumAmount", value)}
            placeholder="120.50"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setFormField("notes", e.target.value)}
            rows={3}
            placeholder="Internal note for this purchase"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
          />
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-gray-900">Documents (Supabase + Links)</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 py-1.5 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/10">
                {uploadingCreate ? "Uploading..." : "Upload to Supabase"}
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => {
                    void handleCreateUpload(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={addDoc}
                className="rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 py-1.5 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/10"
              >
                Add Link
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {form.documents.map((doc, index) => (
              <div
                key={`${index}-${doc.name}-${doc.url}`}
                className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 xl:grid-cols-12"
              >
                <div className="xl:col-span-3">
                  <input
                    value={doc.name}
                    onChange={(e) => setDocField(index, "name", e.target.value)}
                    placeholder="Document name"
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </div>
                <div className="xl:col-span-4">
                  <input
                    value={doc.url}
                    onChange={(e) => setDocField(index, "url", e.target.value)}
                    placeholder={
                      doc.source === "supabase" ? "Managed by Supabase upload" : "https://..."
                    }
                    disabled={doc.source === "supabase"}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </div>
                <div className="xl:col-span-2">
                  <input
                    value={doc.type}
                    onChange={(e) => setDocField(index, "type", e.target.value)}
                    placeholder="pdf"
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </div>
                <div className="xl:col-span-2">
                  <input
                    value={doc.size}
                    onChange={(e) => setDocField(index, "size", e.target.value)}
                    placeholder="Size (bytes)"
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </div>
                <div className="xl:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeDoc(index)}
                    className="h-10 w-full rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        ) : null}
        {success ? (
          <p className="mt-3 text-sm font-medium text-emerald-700">{success}</p>
        ) : null}

        <div className="mt-4">
          <button
            disabled={saving}
            className="h-10 rounded-lg bg-[#820ad1] px-4 text-sm font-semibold text-white hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Record"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, plan..."
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 lg:col-span-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
          >
            <option value="all">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 xl:hidden">
        {filtered.map((row) => {
          const docs = normalizeDocs(row.documents);

          return (
            <div key={row.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row.customerName}</p>
                  <p className="mt-1 text-xs text-gray-500">{row.email}</p>
                </div>
                <span className="rounded-full bg-[#820ad1]/10 px-2 py-1 text-xs font-semibold text-[#820ad1]">
                  {row.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>Plan: {row.planName}</p>
                <p>Type: {row.planType || "-"}</p>
                <p>Phone: {row.phone || "-"}</p>
                <p>Premium: {row.premiumAmount != null ? `EUR ${row.premiumAmount}` : "-"}</p>
                <p>Docs: {docs.length}</p>
              </div>

              <div className="mt-3">
                <select
                  disabled={updatingId === row.id}
                  value={row.status}
                  onChange={(e) => updateStatus(row.id, e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="h-9 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={deletingId === row.id}
                  onClick={() => deleteRecord(row.id)}
                  className="h-9 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === row.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {docs.length ? (
                <div className="mt-3 space-y-1">
                  {docs.map((doc, index) => (
                    <button
                      key={`${doc.storagePath || doc.url || doc.name}-${index}`}
                      type="button"
                      onClick={() => void openDocument(doc)}
                      className="block max-w-full truncate text-left text-xs font-medium text-[#820ad1] hover:underline"
                    >
                      {openingDocKey === `${doc.bucket}:${doc.storagePath}`
                        ? "Opening..."
                        : doc.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="hidden max-w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white xl:block">
        <table className="w-full min-w-[1300px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Premium
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Dates
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Documents
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const docs = normalizeDocs(row.documents);
              return (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {row.customerName}
                    <div className="mt-1 text-xs font-normal text-gray-500">
                      Added: {new Date(row.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{row.email}</div>
                    <div className="text-xs text-gray-500">{row.phone || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">{row.planName}</div>
                    <div className="text-xs text-gray-500">{row.planType || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {row.premiumAmount != null ? `EUR ${row.premiumAmount}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{row.startDate || "-"}</div>
                    <div className="text-xs text-gray-500">{row.endDate || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {docs.length ? (
                      <div className="space-y-1">
                        {docs.slice(0, 2).map((doc, index) => (
                          <button
                            key={`${doc.storagePath || doc.url || doc.name}-${index}`}
                            type="button"
                            onClick={() => void openDocument(doc)}
                            className="block max-w-[240px] truncate text-left text-xs font-medium text-[#820ad1] hover:underline"
                          >
                            {openingDocKey === `${doc.bucket}:${doc.storagePath}`
                              ? "Opening..."
                              : doc.name}
                          </button>
                        ))}
                        {docs.length > 2 ? (
                          <p className="text-xs text-gray-500">+{docs.length - 2} more</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No documents</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      disabled={updatingId === row.id}
                      value={row.status}
                      onChange={(e) => updateStatus(row.id, e.target.value)}
                      className="h-9 rounded-lg border border-gray-200 px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.notes || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => deleteRecord(row.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === row.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                  No Mawsita records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4">
          <form
            onSubmit={saveEdit}
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-gray-900 sm:text-xl">
                Edit Mawsita Record
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label="Customer Name *"
                value={editForm.customerName}
                onChange={(value) => setEditField("customerName", value)}
                placeholder="Full name"
              />
              <Input
                label="Email *"
                value={editForm.email}
                onChange={(value) => setEditField("email", value)}
                placeholder="name@example.com"
                type="email"
              />
              <Input
                label="Phone"
                value={editForm.phone}
                onChange={(value) => setEditField("phone", value)}
                placeholder="+49..."
              />
              <Input
                label="Plan Name *"
                value={editForm.planName}
                onChange={(value) => setEditField("planName", value)}
                placeholder="Mawsita Plan"
              />
              <Input
                label="Plan Type"
                value={editForm.planType}
                onChange={(value) => setEditField("planType", value)}
                placeholder="Student / Expat / Family"
              />
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditField("status", e.target.value as FormState["status"])
                  }
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Start Date"
                value={editForm.startDate}
                onChange={(value) => setEditField("startDate", value)}
                type="date"
              />
              <Input
                label="End Date"
                value={editForm.endDate}
                onChange={(value) => setEditField("endDate", value)}
                type="date"
              />
              <Input
                label="Premium Amount (EUR)"
                value={editForm.premiumAmount}
                onChange={(value) => setEditField("premiumAmount", value)}
                placeholder="120.50"
              />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditField("notes", e.target.value)}
                rows={3}
                placeholder="Internal note for this purchase"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-gray-900">Documents (Supabase + Links)</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 py-1.5 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/10">
                    {uploadingEdit ? "Uploading..." : "Upload to Supabase"}
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                      onChange={(e) => {
                        void handleEditUpload(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addEditDoc}
                    className="rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 py-1.5 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/10"
                  >
                    Add Link
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {editForm.documents.map((doc, index) => (
                  <div
                    key={`${index}-${doc.name}-${doc.url}`}
                    className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 xl:grid-cols-12"
                  >
                    <div className="xl:col-span-3">
                      <input
                        value={doc.name}
                        onChange={(e) => setEditDocField(index, "name", e.target.value)}
                        placeholder="Document name"
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                      />
                    </div>
                    <div className="xl:col-span-4">
                      <input
                        value={doc.url}
                        onChange={(e) => setEditDocField(index, "url", e.target.value)}
                        placeholder={
                          doc.source === "supabase"
                            ? "Managed by Supabase upload"
                            : "https://..."
                        }
                        disabled={doc.source === "supabase"}
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                      />
                    </div>
                    <div className="xl:col-span-2">
                      <input
                        value={doc.type}
                        onChange={(e) => setEditDocField(index, "type", e.target.value)}
                        placeholder="pdf"
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                      />
                    </div>
                    <div className="xl:col-span-2">
                      <input
                        value={doc.size}
                        onChange={(e) => setEditDocField(index, "size", e.target.value)}
                        placeholder="Size (bytes)"
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                      />
                    </div>
                    <div className="xl:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeEditDoc(index)}
                        className="h-10 w-full rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="submit"
                disabled={editing}
                className="h-10 rounded-lg bg-[#820ad1] px-4 text-sm font-semibold text-white hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editing ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={closeEdit}
                className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
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
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
      />
    </div>
  );
}
