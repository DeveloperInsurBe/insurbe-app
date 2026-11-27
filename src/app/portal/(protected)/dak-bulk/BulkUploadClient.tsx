"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Info, Loader2, PauseCircle, Upload, X } from "lucide-react";

type PreviewRow = { rowNumber: number; name: string; email: string; errors: string[] };
type Preview = { fileName: string; total: number; valid: number; rows: PreviewRow[] };
type Outcome = {
  imported: number;
  alreadyImported: number;
  held: number;
  errors: number;
  rows: { rowNumber: number; status: "imported" | "already_imported" | "held" | "error"; reference?: string; message?: string }[];
};

export default function BulkUploadClient({
  consentText,
  consentVersion,
  maxRows,
}: {
  consentText: string;
  consentVersion: string;
  maxRows: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<"preview" | "import" | null>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setFile(null);
    setPreview(null);
    setOutcome(null);
    setConsent(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const send = async (url: string, extra?: Record<string, string>) => {
    const body = new FormData();
    if (file) body.append("file", file);
    Object.entries(extra ?? {}).forEach(([key, value]) => body.append(key, value));
    const response = await fetch(url, { method: "POST", body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
    return data;
  };

  const check = async (chosen: File) => {
    setFile(chosen);
    setPreview(null);
    setOutcome(null);
    setConsent(false);
    setError("");
    setBusy("preview");
    try {
      const body = new FormData();
      body.append("file", chosen);
      const response = await fetch("/api/partner/dak-bulk/preview", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "We could not check this file.");
      setPreview(data as Preview);
    } catch (checkError) {
      setError((checkError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const runImport = async () => {
    setError("");
    setBusy("import");
    try {
      const data = (await send("/api/partner/dak-bulk/import", { consent: "true", consentVersion })) as Outcome;
      setOutcome(data);
      setPreview(null);
      router.refresh();
    } catch (importError) {
      setError((importError as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const card = "rounded-2xl border border-[#f0e6fb] bg-white p-4 shadow-[0_10px_35px_rgba(130,10,209,0.06)] sm:p-5";

  return (
    <div className="space-y-4">
      {/* Step 1: template */}
      <section className={card}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">Step 1</p>
            <h2 className="mt-0.5 text-lg font-black text-[#111827]">Download the template</h2>
            <p className="mt-0.5 text-sm text-[#667085]">
              One person per row. Required: first name, last name and email. Everything else is optional. Up to {maxRows} people per file.
            </p>
          </div>
          <a
            href="/api/partner/dak-bulk/template"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e9d7ff] bg-[#faf7ff] px-4 text-sm font-semibold text-[#820ad1] hover:bg-[#f3e8ff]"
          >
            <Download size={16} /> Template (.xlsx)
          </a>
        </div>
      </section>

      {/* Step 2: upload + preview */}
      <section className={card}>
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">Step 2</p>
        <h2 className="mt-0.5 text-lg font-black text-[#111827]">Upload and check</h2>

        <label
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
            busy ? "pointer-events-none opacity-60" : "border-[#e9d7ff] hover:border-[#c4a3ea] hover:bg-[#faf7ff]"
          }`}
        >
          {busy === "preview" ? <Loader2 className="animate-spin text-[#820ad1]" /> : <Upload className="text-[#820ad1]" />}
          <span className="text-sm font-semibold text-gray-800">
            {file ? file.name : "Choose the filled template (.xlsx or .csv)"}
          </span>
          <span className="text-xs text-gray-500">Max 2 MB. Nothing is saved until you confirm the import.</span>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="sr-only"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              if (chosen) check(chosen);
            }}
          />
        </label>

        {error ? (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}

        {preview ? (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <FileSpreadsheet size={16} className="text-[#820ad1]" />
              <span className="font-semibold text-gray-900">{preview.fileName}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">{preview.valid} ready</span>
              {preview.total - preview.valid ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                  {preview.total - preview.valid} with errors
                </span>
              ) : null}
              <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
                <X size={14} /> Choose another file
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Check</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber} className={`border-t border-gray-100 ${row.errors.length ? "bg-red-50/50" : ""}`}>
                      <td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{row.name || "—"}</td>
                      <td className="max-w-[220px] truncate px-3 py-2 text-gray-600">{row.email || "—"}</td>
                      <td className="px-3 py-2">
                        {row.errors.length ? (
                          <span className="text-xs font-medium text-red-700">{row.errors.join("; ")}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.total - preview.valid ? (
              <p className="mt-2 text-xs text-gray-500">
                Rows with errors are not imported. Fix them in your file and upload it again later – people already imported are not duplicated.
              </p>
            ) : null}

            {/* Step 3: consent + import */}
            {preview.valid > 0 ? (
              <div className="mt-4 rounded-xl border border-[#e9d7ff] bg-[#faf7ff] p-3 sm:p-4">
                <label className="flex items-start gap-3 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#820ad1]"
                  />
                  <span>{consentText}</span>
                </label>
                <button
                  type="button"
                  onClick={runImport}
                  disabled={!consent || busy !== null}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] px-5 text-sm font-semibold text-white shadow-md shadow-[#820ad1]/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {busy === "import" ? <Loader2 size={16} className="animate-spin" /> : null}
                  Import {preview.valid} {preview.valid === 1 ? "person" : "people"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {outcome ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs text-emerald-800">New</p>
                <p className="text-xl font-black text-emerald-700">{outcome.imported}</p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3">
                <p className="text-xs text-gray-700">Already imported</p>
                <p className="text-xl font-black text-gray-700">{outcome.alreadyImported}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="text-xs text-amber-800">On hold</p>
                <p className="text-xl font-black text-amber-700">{outcome.held}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-xs text-red-800">Errors</p>
                <p className="text-xl font-black text-red-700">{outcome.errors}</p>
              </div>
            </div>
            <ul className="max-h-64 divide-y divide-gray-100 overflow-auto rounded-xl border border-gray-100 text-sm">
              {outcome.rows.map((row) => (
                <li key={row.rowNumber} className="flex items-start gap-2 px-3 py-2">
                  {row.status === "imported" ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  ) : row.status === "already_imported" ? (
                    <Info size={16} className="mt-0.5 shrink-0 text-gray-500" />
                  ) : row.status === "held" ? (
                    <PauseCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  ) : (
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  )}
                  <span className="min-w-0">
                    <span className="font-medium text-gray-900">Row {row.rowNumber}</span>
                    {row.reference ? <span className="ml-2 font-mono text-xs text-gray-500">{row.reference}</span> : null}
                    {row.message ? <span className="block text-xs text-gray-600">{row.message}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={reset} className="text-sm font-semibold text-[#820ad1] hover:underline">
              Upload another file
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
