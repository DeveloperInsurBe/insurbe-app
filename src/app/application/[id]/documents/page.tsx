"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DocumentsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [files, setFiles] = useState<any[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const convertedFiles = await Promise.all(
      selectedFiles.map(async (file: any) => {
        const base64 = await toBase64(file);
        return { name: file.name, base64, size: file.size, type: file.type };
      })
    );
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...convertedFiles.filter((f) => !existing.has(f.name))];
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const selectedFiles = Array.from(e.dataTransfer.files);
    const convertedFiles = await Promise.all(
      selectedFiles.map(async (file: any) => {
        const base64 = await toBase64(file);
        return { name: file.name, base64, size: file.size, type: file.type };
      })
    );
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...convertedFiles.filter((f) => !existing.has(f.name))];
    });
  };

  const removeFile = (name: string) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch(`/api/application/${id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      console.log("✅ Documents saved");
      setSaved(true);
      setTimeout(() => router.push(`/application/${id}/signature`), 900);
    } catch (err) {
      console.error("❌ Upload error", err);
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith("image/")) return "🖼️";
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("word") || type?.includes("document")) return "📝";
    return "📎";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background orbs */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/[0.06]">

          {/* Top bar */}
          <div className="bg-black/[0.02] border-b border-black/[0.06] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === 3 ? "w-6 bg-violet-500"
                    : i < 3  ? "w-3 bg-violet-400/60"
                    : "w-3 bg-black/10"
                  }`}
                  animate={i === 3 ? { opacity: [1, 0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
            <span className="text-xs text-black/30 font-medium tracking-widest uppercase">Step 4 / 4</span>
          </div>

          <div className="px-6 pt-7 pb-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">Documents</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upload Documents</h1>
              <p className="text-sm text-slate-500 mt-1 font-light">
                Attach any supporting files for your application.
              </p>
            </motion.div>

            {/* Drop zone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className="cursor-pointer mb-4"
            >
              <motion.div
                animate={dragging
                  ? { borderColor: "rgba(139,92,246,0.6)", backgroundColor: "rgba(139,92,246,0.05)", scale: 1.01 }
                  : { borderColor: "rgba(0,0,0,0.1)", backgroundColor: "rgba(0,0,0,0.01)", scale: 1 }
                }
                transition={{ duration: 0.2 }}
                className="border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center gap-3 text-center"
              >
                <motion.div
                  animate={dragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {dragging ? "Drop files here" : "Drag & drop files here"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">or <span className="text-violet-600 underline underline-offset-2">browse to upload</span></p>
                </div>
                <p className="text-[10px] text-slate-400">PDF, images, Word documents accepted</p>
              </motion.div>

              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden mb-5"
                >
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      {files.length} file{files.length > 1 ? "s" : ""} selected
                    </p>
                    <button
                      onClick={() => setFiles([])}
                      className="text-[10px] text-slate-400 hover:text-red-500 transition-colors duration-150"
                    >
                      Remove all
                    </button>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence>
                      {files.map((file, i) => (
                        <motion.div
                          key={file.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center gap-3 bg-slate-50 border border-black/[0.07] rounded-xl px-3.5 py-2.5 group"
                        >
                          <span className="text-lg flex-shrink-0">{getFileIcon(file.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 font-medium truncate">{file.name}</p>
                            {file.size && (
                              <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFile(file.name)}
                            className="w-6 h-6 rounded-full bg-black/[0.04] hover:bg-red-50 flex items-center justify-center transition-colors duration-150 flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-3 h-3 text-slate-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-5 origin-left"
            />

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={files.length === 0 || loading || saved}
                whileHover={files.length > 0 && !loading && !saved ? { y: -2, scale: 1.01 } : {}}
                whileTap={files.length > 0 && !loading && !saved ? { scale: 0.98 } : {}}
                className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-violet-300 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AnimatePresence mode="wait">
                    {loading && !saved ? (
                      <motion.span key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Uploading…
                      </motion.span>
                    ) : saved ? (
                      <motion.span key="saved" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Saved! Redirecting…
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-1.5">
                        Save & Continue →
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-[11px] text-black/25 mt-4"
            >
              🔒 Encrypted & secure — your files are never shared
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}