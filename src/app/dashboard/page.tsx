"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  FileText,
  User,
  LogOut,
  Download,
  ArrowRight,
  ChevronRight,
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

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const userEmail = session?.user?.email || "";
  const userName = userEmail.split("@")[0] || "User";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      try {
        // ✅ Show loader only first time OR forced refresh
        const shouldRefresh = sessionStorage.getItem("refreshDashboard");

        if (!hasLoadedOnce || shouldRefresh) {
          setLoading(true);
        }

        if (shouldRefresh) {
          sessionStorage.removeItem("refreshDashboard");
        }

        // ✅ Assign pending application if exists
        const applicationId = sessionStorage.getItem("applicationId");
        if (applicationId) {
          await fetch("/api/application/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId }),
          });
          sessionStorage.removeItem("applicationId");
        }

        // ✅ Fetch fresh data
        const userRes = await fetch("/api/application/user", {
          headers: { "Cache-Control": "no-cache" },
        });

        if (!userRes.ok) {
          throw new Error("Failed to fetch user applications");
        }

        const data = await userRes.json();
        const apps = Array.isArray(data) ? data : data.applications || [];

        const policyData: Policy[] = apps.map((app: any) => ({
          id: app.id,
          name: "Hallesche Private Insurance",
          status: app.status || "pending",
          startDate: new Date(app.createdAt).toDateString(),
        }));

        const documentData: Document[] = apps.map((app: any) => ({
          id: app.id,
          title: "Application PDF",
          uploadedAt: new Date(app.updatedAt ?? app.createdAt).toDateString(),
        }));

        setPolicies(policyData);
        setDocuments(documentData);

        // ✅ Mark as loaded AFTER success
        setHasLoadedOnce(true);
      } catch (err) {
        console.error("❌ Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, hasLoadedOnce]);

  // 🔥 Always fresh PDF
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

      const blob = new Blob([byteNumbers], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error("❌ PDF download error:", err);
      alert("Could not load PDF.");
    }
  };

  const stats = [
    {
      icon: <Shield className="w-4 h-4" />,
      value: policies.length,
      label: "Policies",
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      value: documents.length,
      label: "Documents",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: <User className="w-4 h-4" />,
      value: "Premium",
      label: "Member Type",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  // 👇 EVERYTHING BELOW IS EXACT SAME UI (UNCHANGED)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-40" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">
          Fetching your dashboard...
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Please wait while we prepare your data 🚀
        </p>
        <div className="w-56 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-[loading_1.2s_infinite]" />
        </div>
        <style jsx>{`
          @keyframes loading {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        className="fixed top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl px-6 py-5 shadow-sm shadow-black/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
              <span className="text-white font-bold text-lg">
                {displayName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
            </div>
          </div>

          <motion.button
            onClick={() => signOut({ callbackUrl: "/login" })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-xl text-sm font-medium transition-colors duration-150 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </motion.button>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm shadow-black/[0.04]"
            >
              <div
                className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center mb-3 ${s.color}`}
              >
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {s.value}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Policies ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm shadow-black/[0.04]"
        >
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                My Policies
              </h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 border border-black/[0.06] px-2.5 py-1 rounded-full font-medium">
              {policies.length} total
            </span>
          </div>

          <div className="p-4">
            {policies.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Start your insurance journey 🚀
                </p>
                <p className="text-xs text-slate-400 mb-5">
                  Explore plans and get insured today.
                </p>
                <motion.button
                  onClick={() => router.push("/insurance/private-health")}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-200"
                >
                  Explore Plans <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {policies.map((policy, i) => {
                    const progress =
                      policy.status === "completed"
                        ? 100
                        : policy.status === "incomplete"
                          ? 60
                          : 20;
                    const statusConfig =
                      policy.status === "completed"
                        ? {
                            label: "Completed",
                            cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
                          }
                        : policy.status === "incomplete"
                          ? {
                              label: "In Progress",
                              cls: "bg-amber-50 text-amber-600 border-amber-100",
                            }
                          : {
                              label: "Pending",
                              cls: "bg-slate-50 text-slate-500 border-slate-200",
                            };

                    return (
                      <motion.div
                        key={policy.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.06,
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="border border-black/[0.07] rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {policy.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Started {policy.startDate}
                            </p>
                            <span
                              className={`inline-flex items-center mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusConfig.cls}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            {/* ✅ VIEW BUTTON */}
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => fetchAndDownloadPDF(policy.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                            >
                              <Download className="w-3 h-3" /> View
                            </motion.button>

                            {/* ✏️ EDIT BUTTON */}
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() =>
                                router.push(`/application/${policy.id}`)
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg"
                            >
                              Edit
                            </motion.button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400">
                              Progress
                            </span>
                            <span className="text-[10px] font-semibold text-violet-600">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{
                                delay: 0.3 + i * 0.06,
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Documents ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm shadow-black/[0.04]"
        >
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                Documents
              </h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 border border-black/[0.06] px-2.5 py-1 rounded-full font-medium">
              {documents.length} total
            </span>
          </div>

          <div className="p-4">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  No documents available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {documents.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex items-center justify-between gap-3 p-3.5 border border-black/[0.07] rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-violet-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Uploaded {doc.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => fetchAndDownloadPDF(doc.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors duration-150 flex-shrink-0 shadow-sm shadow-blue-100"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[11px] text-black/80 pb-4"
        >
          🔒 Your data is encrypted and never shared
        </motion.p>
      </div>
    </div>
  );
}
