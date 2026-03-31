"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApplicationStore } from "@/app/stores/applicationStore";
import { useJourneyStore } from "@/app/stores/journeyStore";

type StepKey =
  | "personalDetails"
  | "financialHistory"
  | "insuranceHistory"
  | "healthAnswers";

export default function ApplicationPage() {
  const steps = [
    {
      label: "Personal Info",
      key: "personalDetails",
      icon: "👤",
      desc: "Your contact & address details",
    },
    {
      label: "Financial History",
      key: "financialHistory",
      icon: "💰",
      desc: "Income & financial background",
    },
    {
      label: "Insurance History",
      key: "insuranceHistory",
      icon: "📄",
      desc: "Previous coverage & claims",
    },
    {
      label: "Medical History",
      key: "healthAnswers",
      icon: "🏥",
      desc: "Health & medical information",
    },
  ];

  const { id } = useParams();
  const router = useRouter();

  const application = useApplicationStore((s) => s.application);
  const setApplication = useApplicationStore((s) => s.setApplication);

  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  // 🔥 SAFE FETCH + MERGE (NO OVERWRITE)
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/application/${id}`, {
          headers: { "Cache-Control": "no-cache" },
        });

        const data = await res.json();

        const journey = useJourneyStore.getState();
        const existing = useApplicationStore.getState().application;

        setApplication({
          ...existing,
          ...data,

          personalDetails: {
            ...existing?.personalDetails,
            ...data.personalDetails,
            email: data.personalDetails?.email || journey.email,
            phone: data.personalDetails?.phone || journey.phone,
            dob: data.personalDetails?.dob || journey.dob,
          },

          financialHistory: {
            ...existing?.financialHistory,
            ...data.financialHistory,
            employmentStatus:
              data.financialHistory?.employmentStatus ||
              journey.employmentStatus,
            incomeRange:
              data.financialHistory?.incomeRange || journey.incomeRange,
            actualIncome:
              data.financialHistory?.actualIncome || journey.actualIncome,
          },

          insuranceHistory: {
            ...existing?.insuranceHistory,
            ...data.insuranceHistory,
          },

          healthAnswers: {
            ...existing?.healthAnswers,
            ...data.healthAnswers,
          },
        });
      } catch (err) {
        console.error("❌ Failed to fetch application", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplication();
  }, [id, setApplication]);

  // 🔥 STEP DETECTION
  const nextStep = steps.find((s) => {
    if (!s.key) return false;

    if (s.key === "personalDetails") {
      return application?.personalDetails?.isComplete !== true;
    }

  if (s.key === "financialHistory") {
  const data = application?.financialHistory;

  return !(
    data?.employmentStatus &&
    data?.jobTitle &&
    data?.employerName &&
    data?.annualIncome &&
    data?.employedOutsideGermany &&
    data?.hasGermanTaxId
  );
}

return !application?.[s.key];
  });

  const stepRouteMap: Record<StepKey, string> = {
    personalDetails: "personal",
    financialHistory: "financial",
    insuranceHistory: "insurance",
    healthAnswers: "health",
  };

  // 🔥 PROGRESS CALCULATION
  const completedCount = application
    ? steps.filter((s) => {
        if (!s.key) return true;

        const data = application?.[s.key];

        if (s.key === "personalDetails") {
          return !!(
            data?.firstName &&
            data?.email &&
            data?.day &&
            data?.gender &&
            data?.street &&
            data?.marital &&
            data?.countries &&
            data?.relocationDay &&
            data?.residence
          );
        }


        if (s.key === "financialHistory") {
          return !!(
            data?.employmentStatus &&
            data?.jobTitle &&
            data?.employerName &&
            data?.annualIncome &&
            data?.employedOutsideGermany &&
            data?.hasGermanTaxId
          );
        }

        // fallback (keep existing behavior for others)
        return (
          data &&
          Object.keys(data).length > 0 && // 🔥 IMPORTANT FIX
          Object.values(data).some(
            (v) => v !== null && v !== undefined && v !== "",
          )
        );
      }).length
    : 0;

  const progressPct = Math.round((completedCount / steps.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 text-sm font-light tracking-wide">
            Loading application…
          </p>
        </motion.div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-500 text-sm">Application not found</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* ── HERO HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
            <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
              Application #{application.orderId}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Let's get you{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              covered
            </span>
          </h1>
          <p className="text-slate-500 text-base font-light">
            No medical exams, 100% digital signup 🎉
          </p>
        </motion.div>

        {/* ── STEP CARDS GRID ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
          }}
        >
          {steps.map((step, i) => {
           const done =
  step.key === null
    ? true
    : step.key === "personalDetails"
      ? application?.personalDetails?.isComplete === true
      : step.key === "financialHistory"
        ? !!(
            application?.financialHistory?.employmentStatus &&
            application?.financialHistory?.jobTitle &&
            application?.financialHistory?.employerName &&
            application?.financialHistory?.annualIncome &&
            application?.financialHistory?.employedOutsideGermany &&
            application?.financialHistory?.hasGermanTaxId
          )
        : application?.[step.key] &&
          Object.keys(application?.[step.key] || {}).length > 0 &&
          Object.values(application?.[step.key] || {}).some(
            (v) => v !== null && v !== undefined && v !== ""
          );

            const isNext = nextStep?.key === step.key;

            return (
              <motion.div
                key={step.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className={`relative rounded-2xl border p-5 flex flex-col items-center text-center transition-all duration-200 ${
                  done
                    ? "bg-violet-50 border-violet-200"
                    : isNext
                      ? "bg-white/90 border-violet-300 shadow-lg shadow-violet-100"
                      : "bg-white/70 border-black/[0.07]"
                }`}
              >
                {/* Step number */}
                <span
                  className={`text-xs font-bold mb-3 ${done ? "text-violet-400" : "text-slate-300"}`}
                >
                  {i + 1}
                </span>

                {/* Icon circle */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-all duration-200 ${
                    done
                      ? "bg-violet-100"
                      : isNext
                        ? "bg-violet-50 ring-2 ring-violet-200 ring-offset-2"
                        : "bg-slate-50"
                  }`}
                >
                  {step.icon}
                </div>

                <p
                  className={`text-sm font-semibold leading-snug mb-1 ${done ? "text-violet-700" : "text-slate-700"}`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 font-light leading-relaxed hidden sm:block">
                  {step.desc}
                </p>

                {/* Done checkmark */}
                <AnimatePresence>
                  {done && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center"
                    >
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* "Next" pulse ring on active step */}
                {isNext && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-violet-400 pointer-events-none"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-light">
              {completedCount} of {steps.length} steps completed
            </span>
            <span className="text-xs font-semibold text-violet-600">
              {progressPct}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{
                delay: 0.6,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
        </motion.div>

        {/* ── CHECKBOX + CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center gap-4"
        >
          {/* Checkbox */}
          <label className="flex items-start sm:items-center gap-3 cursor-pointer group flex-1">
            <div
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 transition-all duration-150 ${
                agreed
                  ? "bg-violet-600 border-violet-600"
                  : "bg-white border-slate-300 group-hover:border-violet-400"
              }`}
            >
              <AnimatePresence>
                {agreed && (
                  <motion.svg
                    key="check"
                    className="w-3 h-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <span className="text-sm text-slate-500 font-light leading-snug">
              I have read and agree to the{" "}
              <span className="text-violet-600 underline underline-offset-2 cursor-pointer hover:text-violet-700">
                privacy policy
              </span>{" "}
              and{" "}
              <span className="text-violet-600 underline underline-offset-2 cursor-pointer hover:text-violet-700">
                T&Cs
              </span>
              .
            </span>
          </label>

          {/* CTA Button */}
          <motion.button
            onClick={() => {
              if (nextStep?.key) {
                const stepKey = nextStep.key as StepKey;

                router.push(`/application/${id}/${stepRouteMap[stepKey]}`);
              }
            }}
            disabled={!agreed}
            whileHover={agreed ? { y: -2, scale: 1.02 } : {}}
            whileTap={agreed ? { scale: 0.97 } : {}}
            className="relative overflow-hidden rounded-xl px-8 py-3.5 font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-purple-600 shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-violet-300 hover:shadow-xl flex items-center justify-center gap-2 sm:flex-shrink-0"
          >
            {/* Shimmer */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
              initial={{ x: "-100%" }}
              animate={agreed ? { x: ["-100%", "200%"] } : {}}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
            />
            <span className="relative z-10 flex items-center gap-2">
              {completedCount === steps.length
                ? "View Application"
                : "Let's go!"}
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="text-[11px] text-black/20 mt-5 text-center"
        >
          🔒 Encrypted & secure — your data is never shared
        </motion.p>
      </motion.div>
    </div>
  );
}
