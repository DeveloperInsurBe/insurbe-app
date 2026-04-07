"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield,
  FileText,
  User,
  LogOut,
  Download,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Policy {
  id: string;
  name: string;
  status: string;
  startDate: string;
}

interface Document {
  id: string;
  title: string;
  uploadedAt: string;
}

// ── Step map: what each status means and what to do next ──────────────────────
const STATUS_META: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  progress: number;
  nextStep: string;
  nextDetail: string;
  ctaLabel: string;
  ctaColor: string;
}> = {
  completed: {
    label: "Submitted",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    progress: 100,
    nextStep: "Your policy is submitted",
    nextDetail: "Download your completed application PDF below.",
    ctaLabel: "Download PDF",
    ctaColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  incomplete: {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    progress: 60,
    nextStep: "Continue your application",
    nextDetail: "You're partway through. Pick up where you left off.",
    ctaLabel: "Continue →",
    ctaColor: "bg-violet-600 hover:bg-violet-700 text-white",
  },
  pending: {
    label: "Not Started",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: <AlertCircle className="w-3.5 h-3.5 text-slate-400" />,
    progress: 20,
    nextStep: "Start your application",
    nextDetail: "You haven't started filling out your details yet.",
    ctaLabel: "Start now →",
    ctaColor: "bg-violet-600 hover:bg-violet-700 text-white",
  },
};

const getStatusMeta = (status: string) =>
  STATUS_META[status] ?? STATUS_META["pending"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasFetchedRef = useRef(false);

  const userEmail = session?.user?.email || "";
  const userName = userEmail.split("@")[0] || "User";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const router = useRouter();

  // ── All original data-fetching logic preserved exactly ───────────────────
  useEffect(() => {
    if (!session?.user?.email) return;

    const shouldRefresh = sessionStorage.getItem("refreshDashboard");
    if (hasFetchedRef.current && !shouldRefresh) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        if (shouldRefresh) {
          sessionStorage.removeItem("refreshDashboard");
        }

        const applicationId = sessionStorage.getItem("applicationId");
        if (applicationId) {
          await fetch("/api/application/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId }),
            signal: controller.signal,
          });
          sessionStorage.removeItem("applicationId");
        }

        const userRes = await fetch("/api/application/user", {
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal,
        });

        if (!userRes.ok) throw new Error("Failed to fetch user applications");

        const data = await userRes.json();
        const apps = Array.isArray(data) ? data : data.applications || [];

        if (!isMounted) return;

        setPolicies(
          apps.map((app: any) => ({
            id: app.id,
            name: "Hallesche Private Insurance",
            status: app.status || "pending",
            startDate: new Date(app.createdAt).toDateString(),
          })),
        );

        setDocuments(
          apps.map((app: any) => ({
            id: app.id,
            title: "Health Insurance Application",
            uploadedAt: new Date(app.updatedAt ?? app.createdAt).toDateString(),
          })),
        );

        hasFetchedRef.current = true;
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("❌ Dashboard error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [session?.user?.email]);

  // ── PDF download logic preserved exactly ─────────────────────────────────
  const fetchAndDownloadPDF = async (id: string) => {
    try {
      const res = await fetch(`/api/application/${id}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (!data.pdfBase64) {
        alert("PDF not available yet.");
        return;
      }

      const base64 = data.pdfBase64.replace(/^data:.*;base64,/, "");
      const byteCharacters = atob(base64);
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteNumbers], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60_000);
    } catch (err) {
      console.error("❌ PDF download error:", err);
      alert("Could not load PDF.");
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">{displayName.charAt(0)}</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-40" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Fetching your dashboard...</h2>
        <p className="text-sm text-slate-400 mb-6">Please wait while we prepare your data 🚀</p>
        <div className="w-56 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-[loading_1.2s_infinite]" />
        </div>
        <style jsx>{`
          @keyframes loading { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } }
        `}</style>
      </div>
    );
  }

  // ── Count active tasks ────────────────────────────────────────────────────
  const inProgress = policies.filter((p) => p.status !== "completed").length;
  const completed  = policies.filter((p) => p.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#f7f7fb] relative overflow-hidden">
      {/* Soft background blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-100/40 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-100/30 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
              <span className="text-white font-bold">{displayName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">{userEmail}</p>
              <p className="text-base font-bold text-slate-900 leading-tight">Welcome back, {displayName}</p>
            </div>
          </div>
          <motion.button
            onClick={() => signOut({ callbackUrl: "/login" })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </motion.button>
        </motion.div>

        {/* ── Hero action banner (only when there are pending tasks) ── */}
        {inProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-6 text-white shadow-xl shadow-violet-200"
          >
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Action needed</span>
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {inProgress === 1
                    ? "You have 1 application to complete"
                    : `You have ${inProgress} applications to complete`}
                </h2>
                <p className="text-sm text-white/70 max-w-sm">
                  Finish filling out your details to activate your private health insurance coverage.
                </p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── All completed banner ── */}
        {inProgress === 0 && policies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-100"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-0.5">All done!</p>
                <h2 className="text-lg font-bold">Your application is complete</h2>
                <p className="text-sm text-white/70">Download your policy documents below.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: <Shield className="w-4 h-4" />, value: policies.length, label: "Policies", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
            { icon: <CheckCircle2 className="w-4 h-4" />, value: completed, label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { icon: <Clock className="w-4 h-4" />, value: inProgress, label: "In Progress", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
              className="bg-white rounded-2xl p-4 border border-black/[0.05] shadow-sm"
            >
              <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Applications ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">My Applications</h2>
            <span className="text-xs text-slate-400 bg-white border border-black/[0.06] px-2.5 py-1 rounded-full font-medium">
              {policies.length} total
            </span>
          </div>

          {policies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.05] p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Start your insurance journey 🚀</p>
              <p className="text-xs text-slate-400 mb-5">Explore plans and get insured today.</p>
              <motion.button
                onClick={() => router.push("/insurance/private-health")}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-200"
              >
                Explore Plans <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {policies.map((policy, i) => {
                  const meta = getStatusMeta(policy.status);
                  const isActionable = policy.status !== "completed";

                  return (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
                        isActionable ? "border-violet-200 shadow-violet-50" : "border-black/[0.05]"
                      }`}
                    >
                      {/* Top colored strip for in-progress */}
                      {isActionable && (
                        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-blue-500" />
                      )}

                      <div className="p-5">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3">
                            {/* Logo placeholder */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 border border-violet-200">
                              <span className="text-violet-700 font-bold text-sm">H</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{policy.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Started {policy.startDate}</p>
                              {/* Status badge */}
                              <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
                                {meta.icon}
                                {meta.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Next step guidance box */}
                        <div className={`rounded-xl p-3 mb-4 border ${isActionable ? "bg-violet-50 border-violet-100" : "bg-emerald-50 border-emerald-100"}`}>
                          <p className={`text-xs font-semibold mb-0.5 ${isActionable ? "text-violet-700" : "text-emerald-700"}`}>
                            {isActionable ? "👉 Next step" : "✅ All done"}
                          </p>
                          <p className="text-xs text-slate-600 font-medium">{meta.nextStep}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{meta.nextDetail}</p>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-slate-400 font-medium">Application progress</span>
                            <span className={`text-[10px] font-bold ${isActionable ? "text-violet-600" : "text-emerald-600"}`}>
                              {meta.progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${isActionable ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${meta.progress}%` }}
                              transition={{ delay: 0.3 + i * 0.07, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {/* Primary CTA */}
                          <motion.button
                            whileHover={{ y: -1, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (policy.status === "completed") {
                                fetchAndDownloadPDF(policy.id);
                              } else {
                                router.push(`/application/${policy.id}`);
                              }
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${meta.ctaColor}`}
                          >
                            {policy.status === "completed" ? (
                              <><Download className="w-3.5 h-3.5" /> Download PDF</>
                            ) : policy.status === "incomplete" ? (
                              <>Continue application <ChevronRight className="w-3.5 h-3.5" /></>
                            ) : (
                              <>Start application <ChevronRight className="w-3.5 h-3.5" /></>
                            )}
                          </motion.button>

                          {/* Edit button — always visible */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => router.push(`/application/${policy.id}`)}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            ✏️ Edit
                          </motion.button>

                          {/* PDF button — only for incomplete/pending */}
                          {policy.status !== "completed" && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => fetchAndDownloadPDF(policy.id)}
                              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ── Documents ── */}
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">Documents</h2>
              <span className="text-xs text-slate-400 bg-white border border-black/[0.06] px-2.5 py-1 rounded-full font-medium">
                {documents.length} total
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-400">Updated {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fetchAndDownloadPDF(doc.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                  >
                    <Download className="w-3 h-3" /> Download
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Start new ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-black/[0.05] shadow-sm px-5 py-4"
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">Need a different plan?</p>
            <p className="text-xs text-slate-400">Browse all available insurance options.</p>
          </div>
          <motion.button
            onClick={() => router.push("/insurance/private-health")}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0"
          >
            Explore Plans <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>

        <p className="text-center text-[11px] text-slate-400 pb-4">
          🔒 Your data is encrypted and never shared
        </p>
      </div>
    </div>
  );
}