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
  LayoutDashboard,
  FolderOpen,
  Bell,
  HelpCircle,
  Menu,
  X,
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

const STATUS_META: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  progress: number;
  nextStep: string;
  nextDetail: string;
}> = {
  completed: {
    label: "Submitted",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    progress: 100,
    nextStep: "Policy submitted",
    nextDetail: "Download your completed application PDF below.",
  },
  incomplete: {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    progress: 60,
    nextStep: "Continue your application",
    nextDetail: "You're partway through. Pick up where you left off.",
  },
  pending: {
    label: "Not Started",
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    progress: 20,
    nextStep: "Start your application",
    nextDetail: "You haven't started filling out your details yet.",
  },
};

const getStatusMeta = (s: string) => STATUS_META[s] ?? STATUS_META["pending"];

const NAV_ITEMS = [
  { Icon: LayoutDashboard, label: "Dashboard", active: true, badge: 0 },
  { Icon: Shield, label: "My Applications", active: false, badge: 0 },
  { Icon: FolderOpen, label: "Documents", active: false, badge: 0 },
  { Icon: User, label: "Profile", active: false, badge: 0 },
  { Icon: Bell, label: "Notifications", active: false, badge: 3 },
  { Icon: HelpCircle, label: "Help & Support", active: false, badge: 0 },
];

// ── Sidebar (single component, used once per context) ──────────────────────
function Sidebar({
  displayName,
  router,
  onSignOut,
  onClose,
}: {
  displayName: string;
  router: ReturnType<typeof useRouter>;
  onSignOut: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md shadow-violet-200">
            <span className="text-white font-black text-sm">{displayName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">{displayName}</p>
            <p className="text-[10px] text-slate-400">Insurance Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              item.active ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.Icon className={`w-4 h-4 ${item.active ? "text-violet-600" : ""}`} />
              <span className={`text-sm ${item.active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span className="text-[10px] font-bold bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Main dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasFetchedRef = useRef(false);
  const router = useRouter();

  const userEmail = session?.user?.email || "";
  const userName = userEmail.split("@")[0] || "User";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  useEffect(() => {
    if (!session?.user?.email) return;
    const shouldRefresh = sessionStorage.getItem("refreshDashboard");
    if (hasFetchedRef.current && !shouldRefresh) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        if (shouldRefresh) sessionStorage.removeItem("refreshDashboard");

        const appId = sessionStorage.getItem("applicationId");
        if (appId) {
          await fetch("/api/application/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: appId }),
            signal: controller.signal,
          });
          sessionStorage.removeItem("applicationId");
        }

        const res = await fetch("/api/application/user", {
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const apps = Array.isArray(data) ? data : data.applications || [];
        if (!isMounted) return;

        setPolicies(apps.map((a: any) => ({
          id: a.id,
          name: "Hallesche Private Insurance",
          status: a.status || "pending",
          startDate: new Date(a.createdAt).toDateString(),
        })));
        setDocuments(apps.map((a: any) => ({
          id: a.id,
          title: "Health Insurance Application",
          uploadedAt: new Date(a.updatedAt ?? a.createdAt).toDateString(),
        })));
        hasFetchedRef.current = true;
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("❌", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; controller.abort(); };
  }, [session?.user?.email]);

  const downloadPDF = async (id: string) => {
    try {
      const res = await fetch(`/api/application/${id}`, { headers: { "Cache-Control": "no-cache" } });
      const data = await res.json();
      if (!data.pdfBase64) { alert("PDF not available yet."); return; }
      const b64 = data.pdfBase64.replace(/^data:.*;base64,/, "");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { alert("Could not load PDF."); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f9]">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200">
            <span className="text-white font-bold text-xl">{displayName.charAt(0)}</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-40" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Loading your dashboard...</h2>
        <p className="text-sm text-slate-400 mb-6">Preparing your data</p>
        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-3/5 bg-gradient-to-r from-violet-500 to-purple-600 animate-pulse" />
        </div>
      </div>
    );
  }

  const inProgress = policies.filter((p) => p.status !== "completed").length;
  const completed = policies.filter((p) => p.status === "completed").length;
  const handleSignOut = () => signOut({ callbackUrl: "/login" });

  return (
    // Root: flex row, full height
    <div className="min-h-screen bg-[#f4f5f9] flex">

      {/* ── Mobile slide-in sidebar (portal-style, no layout impact) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -264 }} animate={{ x: 0 }} exit={{ x: -264 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl lg:hidden"
            >
              <Sidebar
                displayName={displayName}
                router={router}
                onSignOut={handleSignOut}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar — uses normal flow (no fixed/absolute) ── */}
      <div className="hidden lg:block w-64 flex-shrink-0 min-h-screen border-r border-slate-100">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <Sidebar displayName={displayName} router={router} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{displayName.charAt(0)}</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">Insurance Portal</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-5 overflow-y-auto">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-slate-400 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{displayName} 👋</h1>
            <p className="text-slate-400 text-sm mt-1">
              {inProgress > 0 ? "Let's finish your applications and get you covered." : "All applications are up to date. Great work!"}
            </p>
          </motion.div>

          {/* Action banner */}
          {inProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500 p-5 text-white"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(ellipse at 85% 40%, white 0%, transparent 65%)" }} />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Action Needed</p>
                  <h2 className="text-lg font-extrabold mb-1">
                    You have {inProgress} application{inProgress > 1 ? "s" : ""} to complete
                  </h2>
                  <p className="text-violet-200 text-sm max-w-md">
                    Finish filling out your details to activate your private health insurance coverage.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { const f = policies.find((p) => p.status !== "completed"); if (f) router.push(`/application/${f.id}`); }}
                  className="self-start sm:self-center flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-bold text-sm rounded-xl shadow"
                >
                  Resume now <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {inProgress === 0 && policies.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold">All applications complete!</p>
                <p className="text-emerald-100 text-sm">Download your policy documents below.</p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {[
              { label: "Total Policies", value: policies.length, sub: "All time", Icon: FileText, ic: "text-slate-500", ib: "bg-slate-100" },
              { label: "Completed", value: completed, sub: "Policy", Icon: CheckCircle2, ic: "text-emerald-500", ib: "bg-emerald-50" },
              { label: "In Progress", value: inProgress, sub: "Applications", Icon: Clock, ic: "text-amber-500", ib: "bg-amber-50" },
              { label: "Coverage", value: completed > 0 ? "Active" : "Pending", sub: "Status", Icon: Shield, ic: "text-violet-500", ib: "bg-violet-50", t: true },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className={`w-9 h-9 rounded-xl ${s.ib} flex items-center justify-center mb-3`}>
                  <s.Icon className={`w-4 h-4 ${s.ic}`} />
                </div>
                <p className={`font-extrabold tracking-tight ${s.t ? "text-xl" : "text-2xl"} text-slate-900`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-slate-300">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Applications */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800">My Applications</h2>
              <span className="text-xs text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-full shadow-sm">{policies.length} total</span>
            </div>

            {policies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Start your insurance journey 🚀</p>
                <p className="text-xs text-slate-400 mb-5">Explore plans and get insured today.</p>
                <motion.button onClick={() => router.push("/insurance/private-health")} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-200"
                >
                  Explore Plans <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {policies.map((policy, i) => {
                    const meta = getStatusMeta(policy.status);
                    const isAction = policy.status !== "completed";
                    return (
                      <motion.div key={policy.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                      >
                        <div className={`h-1 w-full ${isAction ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`} />
                        <div className="p-4 sm:p-5">
                          {/* Header */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 border border-violet-200">
                              <span className="text-violet-700 font-bold text-sm">H</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900">{policy.name}</p>
                              <p className="text-[11px] text-slate-400">Started {policy.startDate}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                            {/* Desktop action buttons */}
                            <div className="hidden sm:flex items-center gap-2">
                              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                onClick={() => policy.status === "completed" ? downloadPDF(policy.id) : router.push(`/application/${policy.id}`)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors"
                              >
                                {policy.status === "completed"
                                  ? <><Download className="w-3.5 h-3.5" /> Download PDF</>
                                  : policy.status === "incomplete"
                                  ? <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
                                  : <>Start now <ArrowRight className="w-3.5 h-3.5" /></>}
                              </motion.button>
                              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                onClick={() => router.push(`/application/${policy.id}`)}
                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                              >
                                ✏️ Edit
                              </motion.button>
                              {policy.status !== "completed" && (
                                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                  onClick={() => downloadPDF(policy.id)}
                                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" /> PDF
                                </motion.button>
                              )}
                            </div>
                          </div>

                          {/* Next step */}
                          <div className={`mt-3 rounded-xl border-l-4 px-3 py-2.5 ${isAction ? "bg-amber-50/70 border-l-amber-400" : "bg-emerald-50/70 border-l-emerald-400"}`}>
                            <p className={`text-xs font-bold mb-0.5 ${isAction ? "text-amber-700" : "text-emerald-700"}`}>
                              {isAction ? "Next step" : "All done — Policy submitted"}
                            </p>
                            <p className="text-xs text-slate-600">{meta.nextStep}</p>
                            <p className="text-[11px] text-slate-400">{meta.nextDetail}</p>
                          </div>

                          {/* Progress */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-400">Application progress</span>
                              <span className={`text-[10px] font-bold ${isAction ? "text-violet-600" : "text-emerald-600"}`}>{meta.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${isAction ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}
                                initial={{ width: 0 }} animate={{ width: `${meta.progress}%` }}
                                transition={{ delay: 0.3 + i * 0.07, duration: 0.9 }}
                              />
                            </div>
                          </div>

                          {/* Mobile action buttons */}
                          <div className="flex gap-2 mt-3 sm:hidden">
                            <motion.button whileTap={{ scale: 0.97 }}
                              onClick={() => policy.status === "completed" ? downloadPDF(policy.id) : router.push(`/application/${policy.id}`)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold"
                            >
                              {policy.status === "completed" ? <><Download className="w-3.5 h-3.5" />Download</> : policy.status === "incomplete" ? <>Continue <ArrowRight className="w-3.5 h-3.5" /></> : <>Start <ArrowRight className="w-3.5 h-3.5" /></>}
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push(`/application/${policy.id}`)}
                              className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm"
                            >✏️</motion.button>
                            {policy.status !== "completed" && (
                              <motion.button whileTap={{ scale: 0.97 }} onClick={() => downloadPDF(policy.id)}
                                className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600"
                              ><Download className="w-3.5 h-3.5" /></motion.button>
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

          {/* Documents */}
          {documents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">Documents</h2>
                <span className="text-xs text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-full shadow-sm">{documents.length} total</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {documents.map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{doc.title}</p>
                        <p className="text-[10px] text-slate-400">Updated {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => downloadPDF(doc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex-shrink-0 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Explore */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">Need a different plan?</p>
              <p className="text-xs text-slate-400">Browse all available insurance options.</p>
            </div>
            <motion.button onClick={() => router.push("/insurance/private-health")} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-100 flex-shrink-0"
            >
              Explore Plans <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>

          <p className="text-center text-[11px] text-slate-400 pb-4">🔒 Your data is encrypted and never shared</p>
        </main>
      </div>
    </div>
  );
}