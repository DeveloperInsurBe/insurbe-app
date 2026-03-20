"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { label: "Order Created",      key: null,              icon: "🎯" },
  { label: "Personal Details",   key: "personalDetails", icon: "👤" },
  { label: "Health Information", key: "healthAnswers",   icon: "🏥" },
  { label: "Documents Upload",   key: "uploadedDocs",    icon: "📎" },
  { label: "Signature",          key: "signature",       icon: "✍️" },
];

export default function ApplicationPage() {
  const { id } = useParams();
  const router = useRouter();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/application/${id}`);
        const data = await res.json();
        console.log("📄 Application:", data);
        setApplication(data);
      } catch (err) {
        console.error("❌ Failed to fetch application", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApplication();
  }, [id]);

  const completedCount = application
    ? steps.filter((s) => s.key === null || !!application[s.key]).length
    : 0;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center">
        <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-10 h-10 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 text-sm font-light tracking-wide">Loading application…</p>
        </motion.div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-500 text-sm">Application not found</p>
        </motion.div>
      </div>
    );
  }

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

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl relative z-10"
      >

        {/* ── HEADER ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/[0.06] mb-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0">

            {/* Left — identity */}
            <div className="flex-1 px-6 py-5 border-b sm:border-b-0 sm:border-r border-black/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                  <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">Application</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  application.status === "complete"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  {application.status ?? "In Progress"}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-0.5">Order ID</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">#{application.orderId}</h1>
            </div>

            {/* Right — progress */}
            <div className="flex-1 px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-light">Overall Progress</span>
                <span className="text-xs font-semibold text-violet-600">{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">{completedCount} of {steps.length} steps completed</p>

              {/* Mini step dots */}
              <div className="flex items-center gap-2 mt-4">
                {steps.map((s, i) => {
                  const done = s.key === null || !!application[s.key];
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.07, type: "spring", stiffness: 300, damping: 20 }}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${done ? "bg-violet-500" : "bg-slate-200"}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-col lg:flex-row gap-3 items-start">

          {/* Steps card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/[0.06] flex-1 w-full"
          >
            <div className="px-6 pt-5 pb-2 border-b border-black/[0.05]">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Progress Steps</h2>
            </div>

            <div className="px-4 py-3 space-y-1">
              {steps.map((step, i) => {
                const done = step.key === null || !!application[step.key];
                const isLast = i === steps.length - 1;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl relative"
                  >
                    {!isLast && (
                      <div className="absolute left-[22px] top-[38px] w-px h-[18px] bg-slate-200 z-0" />
                    )}

                    <motion.div
                      animate={done
                        ? { backgroundColor: "rgba(139,92,246,1)", borderColor: "rgba(139,92,246,1)" }
                        : { backgroundColor: "rgba(248,250,252,1)", borderColor: "rgba(203,213,225,1)" }
                      }
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.07 }}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative z-10"
                    >
                      <AnimatePresence mode="wait">
                        {done ? (
                          <motion.svg
                            key="check"
                            className="w-3.5 h-3.5 text-white"
                            viewBox="0 0 20 20" fill="currentColor"
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.45 + i * 0.07 }}
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </motion.svg>
                        ) : (
                          <motion.span key="num" className="text-[10px] text-slate-400 font-semibold" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            {i + 1}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-base">{step.icon}</span>
                      <p className={`text-sm font-medium transition-colors duration-300 ${done ? "text-slate-900" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                      done
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}>
                      {done ? "Done" : "Pending"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-6 flex flex-col gap-3"
          >
            {/* CTA card */}
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl px-6 py-6 shadow-xl shadow-black/[0.06]">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Next Step</p>
              <p className="text-sm text-slate-500 font-light mb-5 leading-relaxed">
                {completedCount === steps.length
                  ? "Your application is complete!"
                  : `Complete your ${steps.find(s => s.key !== null && !application[s.key])?.label ?? "application"}.`}
              </p>

              <motion.button
                onClick={() => router.push(`/application/${id}/personal`)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-lg shadow-violet-200 transition-shadow hover:shadow-violet-300 hover:shadow-xl flex items-center justify-center gap-2"
              >
                Continue Application
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>

              <p className="text-center text-[11px] text-black/25 mt-3">
                🔒 Encrypted & secure — your data is never shared
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl px-6 py-5 shadow-xl shadow-black/[0.06]">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">Summary</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Completed</span>
                  <span className="text-xs font-semibold text-emerald-600">{completedCount} steps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Remaining</span>
                  <span className="text-xs font-semibold text-amber-600">{steps.length - completedCount} steps</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-xs font-bold text-violet-600">{progressPct}%</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}