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
  Sparkles,
  Activity,
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
  isDak?: boolean;
}

interface Document {
  id: string;
  title: string;
  uploadedAt: string;
}

const STATUS_META: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    progress: number;
    nextStep: string;
    nextDetail: string;
  }
> = {
  completed: {
    label: "Submitted",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    progress: 100,
    nextStep: "Policy successfully submitted",
    nextDetail: "Download your completed application PDF below.",
  },
  incomplete: {
    label: "In Progress",
    color: "text-amber-600",
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
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
    progress: 20,
    nextStep: "Start your application",
    nextDetail: "You haven't started filling out your details yet.",
  },
};

const getStatusMeta = (s: string) => STATUS_META[s] ?? STATUS_META["pending"];

const NAV_ITEMS = [
  { Icon: LayoutDashboard, label: "Home" },
  { Icon: Shield, label: "Insurance" },
  { Icon: FolderOpen, label: "Documents" },
  { Icon: HelpCircle, label: "Help" },
];

function Sidebar({
  displayName,
  onSignOut,
  activePage,
  setActivePage,
  onClose,
}: {
  displayName: string;
  onSignOut: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* User */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-sm">
              {displayName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-gray-400">Member account</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-3 py-2">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            onClick={() => {
              setActivePage(item.label);
              onClose?.();
            }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              activePage === item.label
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.Icon
                className={`w-[17px] h-[17px] ${
                  activePage === item.label ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm ${
                  activePage === item.label
                    ? "font-semibold text-blue-700"
                    : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasFetchedRef = useRef(false);
  const router = useRouter();
  const [activePage, setActivePage] = useState("Home");
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

        setPolicies(
          apps.map((a: any) => ({
            id: a.id,

            name:
              a.provider === "DAK"
                ? "DAK Health Insurance"
                : a.provider === "TK"
                  ? "TK Health Insurance"
                  : "Hallesche Private Insurance",

            status:
              a.status === "completed"
                ? "completed"
                : a.status === "incomplete"
                  ? "incomplete"
                  : "pending",

            startDate: new Date(a.createdAt).toDateString(),

            isDak: a.provider === "DAK" || a.provider === "TK",
          })),
        );
        setDocuments(
          apps.map((a: any) => ({
            id: a.id,
            title: "Health Insurance Application",
            uploadedAt: new Date(a.updatedAt ?? a.createdAt).toDateString(),
          })),
        );
        hasFetchedRef.current = true;
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("❌", err);
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

  const downloadPDF = async (id: string) => {
    try {
      const res = await fetch(`/api/application/${id}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (!data.pdfBase64) {
        alert("PDF not available yet.");
        return;
      }
      const b64 = data.pdfBase64.replace(/^data:.*;base64,/, "");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(
        new Blob([bytes], { type: "application/pdf" }),
      );
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Could not load PDF.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-4">
          Loading your dashboard…
        </p>
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  const inProgress = policies.filter((p) => p.status !== "completed").length;
  const completed = policies.filter((p) => p.status === "completed").length;
  const handleSignOut = () => signOut({ callbackUrl: "/login" });
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 w-60 z-50 shadow-xl lg:hidden"
            >
              <Sidebar
                displayName={displayName}
                onSignOut={handleSignOut}
                activePage={activePage}
                setActivePage={setActivePage}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 flex-shrink-0 min-h-screen">
        <div className="sticky top-0 h-screen">
          <Sidebar
            displayName={displayName}
            onSignOut={handleSignOut}
            activePage={activePage}
            setActivePage={setActivePage}
            onClose={() => setSidebarOpen(false)}
          />{" "}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}

        <main className="flex-1 px-5 sm:px-8 py-7 space-y-6 overflow-y-auto">
          {/* Greeting */}
          {activePage === "Home" && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-xl font-bold text-gray-900">
                  Good day, {displayName} 👋
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {inProgress > 0
                    ? `You have ${inProgress} application${inProgress > 1 ? "s" : ""} that need your attention.`
                    : "Everything looks great — all applications are up to date."}
                </p>
              </motion.div>

              {/* Banner */}
              {inProgress > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="rounded-2xl bg-blue-600 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Action required
                       </p>
                      <p className="text-blue-100 text-xs mt-0.5">
                        Complete your application to activate your health
                        insurance coverage.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const f = policies.find((p) => p.status !== "completed");
                      if (f) router.push(`/application/${f.id}`);
                    }}
                    className="self-start sm:self-center flex-shrink-0 bg-white text-blue-600 text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    Resume now <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {inProgress === 0 && policies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="rounded-2xl bg-emerald-500 p-4 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      All applications complete
                    </p>
                    <p className="text-emerald-100 text-xs">
                      Your policy documents are ready to download.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              >
                {[
                  {
                    label: "Total Policies",
                    value: String(policies.length),
                    sub: "All time",
                    Icon: FileText,
                    iconColor: "text-gray-400",
                    iconBg: "bg-gray-100",
                  },
                  {
                    label: "Completed",
                    value: String(completed),
                    sub: "Submitted",
                    Icon: CheckCircle2,
                    iconColor: "text-emerald-500",
                    iconBg: "bg-emerald-50",
                  },
                  {
                    label: "In Progress",
                    value: String(inProgress),
                    sub: "Need action",
                    Icon: Clock,
                    iconColor: "text-amber-500",
                    iconBg: "bg-amber-50",
                  },
                  {
                    label: "Coverage",
                    value: completed > 0 ? "Active" : "Pending",
                    sub: "Status",
                    Icon: Shield,
                    iconColor: "text-blue-500",
                    iconBg: "bg-blue-50",
                    isText: true,
                  },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center mb-4`}
                    >
                      <s.Icon className={`w-4 h-4 ${s.iconColor}`} />
                    </div>
                    <p
                      className={`font-bold text-gray-900 leading-none ${(s as any).isText ? "text-xl" : "text-3xl"}`}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 mt-2">
                      {s.label}
                    </p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{s.sub}</p>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
          {/* Applications */}
          {(activePage === "Home" || activePage === "Insurance") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {activePage === "Insurance"
                    ? "All Insurance Applications"
                    : "Recent Applications"}
                </h2>
                <span className="text-xs text-gray-400">
                  {policies.length} total
                </span>
              </div>

              {policies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    No applications yet
                  </p>
                  <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">
                    Start your insurance journey by exploring available plans.
                  </p>
                  <button
                    onClick={() => router.push("/insurance/private-health")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Explore Plans <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {(activePage === "Home"
                      ? policies.slice(0, 1)
                      : policies
                    ).map((policy, i) => {
                      const meta = getStatusMeta(policy.status);
                      const isCompleted = policy.status === "completed";

                      return (
                        <motion.div
                          key={policy.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
                        >
                          <div className="p-5 sm:p-6">
                            {/* Header row */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold text-sm">
                                  {policy.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {policy.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Started {policy.startDate}
                                </p>
                              </div>
                              <span
                                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                                />
                                {meta.label}
                              </span>

                              {/* Desktop buttons */}
                              <div className="hidden sm:flex items-center gap-2">
                                {policy.isDak ? null : isCompleted ? (
                                  <>
                                    <motion.button
                                      whileHover={{ y: -1 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => downloadPDF(policy.id)}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5" />{" "}
                                      Download PDF
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ y: -1 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() =>
                                        router.push(`/application/${policy.id}`)
                                      }
                                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                      ✏️ Edit
                                    </motion.button>
                                  </>
                                ) : (
                                  <motion.button
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() =>
                                      router.push(`/application/${policy.id}`)
                                    }
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                                  >
                                    Continue{" "}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {/* Info strip */}
                            <div
                              className={`mt-4 rounded-xl px-4 py-3 ${isCompleted ? "bg-emerald-50" : "bg-blue-50"}`}
                            >
                              <p
                                className={`text-[11px] font-semibold mb-0.5 ${isCompleted ? "text-emerald-600" : "text-blue-600"}`}
                              >
                                {isCompleted
                                  ? "✓ Policy submitted"
                                  : "Next step"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {meta.nextStep}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {meta.nextDetail}
                              </p>
                            </div>

                            {/* Progress */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] text-gray-400">
                                  Application progress
                                </span>
                                <span
                                  className={`text-[11px] font-bold ${isCompleted ? "text-emerald-600" : "text-blue-600"}`}
                                >
                                  {meta.progress}%
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-blue-500"}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${meta.progress}%` }}
                                  transition={{
                                    delay: 0.3 + i * 0.06,
                                    duration: 0.9,
                                    ease: "easeOut",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Mobile buttons */}
                            <div className="flex gap-2 mt-4 sm:hidden">
                              {policy.isDak ? null : isCompleted ? (
                                <>
                                  <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => downloadPDF(policy.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl"
                                  >
                                    <Download className="w-3.5 h-3.5" />{" "}
                                    Download
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() =>
                                      router.push(`/application/${policy.id}`)
                                    }
                                    className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl"
                                  >
                                    ✏️ Edit
                                  </motion.button>
                                </>
                              ) : (
                                <motion.button
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() =>
                                    router.push(`/application/${policy.id}`)
                                  }
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl"
                                >
                                  Continue{" "}
                                  <ArrowRight className="w-3.5 h-3.5" />
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
          )}

          {/* Documents */}
          {activePage === "Documents" && documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Documents
                </h2>

                <span className="text-xs text-gray-400">
                  {documents.length} total
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {documents.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {doc.title}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          Updated {doc.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadPDF(doc.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl flex-shrink-0 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Explore footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Need a different plan?
                </p>
                <p className="text-xs text-gray-400">
                  Browse all available insurance options.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/insurance/private-health")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
            >
              Explore Plans <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          <p className="text-center text-[11px] text-gray-300 pb-4">
            🔒 Your data is encrypted and never shared
          </p>
        </main>
      </div>
    </div>
  );
}
