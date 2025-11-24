"use client";
import React, { useEffect, useState } from "react";

function downloadBlob(blob: Blob, fileName = "antrag.pdf") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function base64ToBlob(base64: string, mime = "application/pdf") {
  const binary = atob(base64);
  const len = binary.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export default function GenerateOrder() {
  const [loading, setLoading] = useState(false);
  const [statusMeldung, setStatusMeldung] = useState<string | null>(null);
  const [docs, setDocs] = useState<Array<{ id: number; fileName: string; base64?: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugText, setDebugText] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<number | null>(null);
  const [lastHeaders, setLastHeaders] = useState<Record<string,string> | null>(null);

  // new: store single-PDF blob and filename (no auto-download)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("antrag.pdf");

  useEffect(() => {
    // cleanup blob URL if component unmounts (no direct URL created here, but safe)
    return () => {
      // no-op because we revoke on download; kept for completeness
    };
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setStatusMeldung(null);
    setDocs([]);
    setError(null);
    setDebugText(null);
    setLastStatus(null);
    setLastHeaders(null);
    setPdfBlob(null);
    setPdfFileName("antrag.pdf");

    const payload = {
      tarifId: "34572",
      vorname: "Max",
      name: "Mustermann",
      geburtsdatum: "1988-02-03",
      beginn: "01.09.2025",
      anrede: "Item1",
      geschlecht: "Item1",
    };

    try {
      console.info("Sending payload to /api/getOrderEinzel:", payload);
      const res = await fetch("/api/getOrderEinzel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setLastStatus(res.status);
      const headersObj: Record<string,string> = {};
      res.headers.forEach((v, k) => (headersObj[k] = v));
      setLastHeaders(headersObj);
      console.info("Response status:", res.status, "headers:", headersObj);

      const raw = await res.clone().text().catch(() => "");
      setDebugText(raw.slice(0, 5000));

      if (!res.ok) {
        try {
          const j = JSON.parse(raw);
          if (j?.status?.meldung) {
            setStatusMeldung(j.status.meldung);
            return;
          }
        } catch (e) {
          // not JSON
        }
        throw new Error(`Server returned ${res.status} — see debugPreview`);
      }

      const ct = res.headers.get("Content-Type") || "";

      // if server returned binary PDF, DO NOT auto-download.
      if (ct.includes("application/pdf") || (res.headers.get("Content-Disposition") || "").includes("filename")) {
        const ab = await res.arrayBuffer();
        const blob = new Blob([ab], { type: "application/pdf" });
        const disp = res.headers.get("Content-Disposition") || "";
        let filename = "antrag.pdf";
        const match = /filename="?([^"]+)"?/.exec(disp);
        if (match && match[1]) filename = match[1];

        // store blob + filename for manual download by user
        setPdfBlob(blob);
        setPdfFileName(filename);
        setDebugText((prev) => (prev ? prev : "PDF ready to download via button"));
        return;
      }

      // otherwise JSON
      const j = await res.json();

      if (j?.status?.meldung) {
        setStatusMeldung(j.status.meldung);
        return;
      }

      if (Array.isArray(j?.documents)) {
        const mapped = j.documents.map((d: any, idx: number) => ({
          id: d.id ?? idx,
          fileName: d.fileName ?? d.kurz ?? `doc_${idx + 1}`,
          base64: d.base64 ?? d.Daten ?? d.data ?? undefined,
        }));
        setDocs(mapped);
        return;
      }

      if (j?.documents) {
        const mapped = Object.values(j.documents).map((d: any, idx: number) => ({
          id: d.id ?? idx,
          fileName: d.fileName ?? d.kurz ?? `doc_${idx + 1}`,
          base64: d.base64 ?? d.Daten ?? d.data ?? undefined,
        }));
        setDocs(mapped);
        return;
      }

      setDebugText(raw);
      setError("Unexpected successful response — check debug preview");
    } catch (err: any) {
      console.error("GenerateOrder error:", err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadBase64(base64: string | undefined, fileName = "antrag.pdf") {
    if (!base64) return setError("No base64 data available");
    try {
      const blob = base64ToBlob(base64, "application/pdf");
      downloadBlob(blob, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
    } catch (e: any) {
      console.error("base64->blob error", e);
      setError(String(e?.message || e));
    }
  }

  function handleDownloadPdfBlob() {
    if (!pdfBlob) return setError("No PDF available to download");
    try {
      downloadBlob(pdfBlob, pdfFileName.endsWith(".pdf") ? pdfFileName : `${pdfFileName}.pdf`);
      // optional: clear blob after download if you want single-use
      // setPdfBlob(null);
    } catch (e: any) {
      console.error("download blob error", e);
      setError(String(e?.message || e));
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "18px auto", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h3>Generate Antrag (getOrder)</h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Generating…" : "Generate Antrag"}
        </button>

        {pdfBlob && (
          <button
            onClick={handleDownloadPdfBlob}
            style={{ padding: "10px 12px", borderRadius: 6, background: "#0b74de", color: "white", cursor: "pointer" }}
          >
            Download PDF
          </button>
        )}

        {lastStatus !== null && <div style={{ fontSize: 13 }}>Last status: <strong>{lastStatus}</strong></div>}
        {lastHeaders && <div style={{ fontSize: 13, color: "#666" }}>CT: {lastHeaders["content-type"] ?? "-"}</div>}
      </div>

      {statusMeldung && (
        <div style={{ marginTop: 8, background: "#fff0f0", border: "1px solid #f2c2c2", padding: 10, borderRadius: 6 }}>
          <strong>Status.meldung:</strong>
          <div>{statusMeldung}</div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 8, background: "#fff5e6", border: "1px solid #ffd59a", padding: 10, borderRadius: 6 }}>
          <strong>Error:</strong>
          <div>{error}</div>
        </div>
      )}

      {docs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>Documents</h4>
          <ul>
            {docs.map((d) => (
              <li key={d.id} style={{ marginBottom: 8 }}>
                <span style={{ marginRight: 12 }}>{d.fileName}</span>
                {d.base64 ? (
                  <button onClick={() => handleDownloadBase64(d.base64, d.fileName)}>Download</button>
                ) : (
                  <span style={{ color: "#666" }}>No base64 for this doc</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: "pointer" }}>Debug / response preview</summary>
        <div style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 8, background: "#f6f7f9", padding: 10, borderRadius: 6, maxHeight: 320, overflow: "auto" }}>
          <div><strong>Raw preview (first 5k chars):</strong></div>
          <div style={{ marginTop: 6 }}>{debugText ?? "(no preview yet)"}</div>
        </div>
      </details>
    </div>
  );
}
