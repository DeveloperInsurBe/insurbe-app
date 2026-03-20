"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function HealthPage() {
  const { id } = useParams();
  const router = useRouter();

  const [seriousIllness, setSeriousIllness] = useState("");
  const [details, setDetails] = useState("");
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (seriousIllness === "yes") {
        router.push("/book-appointment");
        return;
      }

      await fetch(`/api/application/${id}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriousIllness, details }),
      });

      console.log("✅ Health saved");
      setSaved(true);
      setTimeout(() => router.push(`/application/${id}/documents`), 900);
    } catch (err) {
      console.error("❌ Error saving health", err);
      setLoading(false);
    }
  };

  const options = [
    {
      value: "no",
      label: "No, I haven't",
      desc: "I have not had any serious illness in the last 5 years",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      value: "yes",
      label: "Yes, I have",
      desc: "I have experienced a serious illness within the last 5 years",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  const diseases = [
    "Autoimmune disorder",

    "Taking PrEP",

    "HIV",

    "Pacemaker",

    "Thrombosis",

    "Arthritis",

    "Cancer",

    "Diabetes",

    "Hepatitis",

    "Multiple sclerosis",

    "Asthma",

    "Epilepsy",
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs — light tinted */}
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
                    i === 2
                      ? "w-6 bg-violet-500"
                      : i < 2
                        ? "w-3 bg-violet-400/60"
                        : "w-3 bg-black/10"
                  }`}
                  animate={i === 2 ? { opacity: [1, 0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
            <span className="text-xs text-black/30 font-medium tracking-widest uppercase">
              Step 3 / 4
            </span>
          </div>

          <div className="px-6 pt-7 pb-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-7"
            >
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
                  Health Info
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Health Information
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-light">
                Have you experienced any of the following serious illnesses in
                the last 5 years?
              </p>
            </motion.div>

            {/* Radio options */}
            <motion.div
              className="space-y-3 mb-5"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                },
              }}
            >
              {options.map(({ value, label, desc, icon }) => {
                const selected = seriousIllness === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setSeriousIllness(value)}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left rounded-xl border px-4 py-4 flex items-center gap-4 transition-all duration-200 relative overflow-hidden ${
                      selected
                        ? "border-violet-400/60 bg-violet-50"
                        : "border-black/[0.08] bg-slate-50/80 hover:border-black/20 hover:bg-slate-100/60"
                    }`}
                  >
                    {/* Selected glow */}
                    <AnimatePresence>
                      {selected && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.06] to-transparent pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Custom radio */}
                    <motion.div
                      animate={
                        selected
                          ? {
                              borderColor: "rgba(139,92,246,1)",
                              backgroundColor: "rgba(139,92,246,1)",
                            }
                          : {
                              borderColor: "rgba(0,0,0,0.2)",
                              backgroundColor: "transparent",
                            }
                      }
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative z-10"
                    >
                      <AnimatePresence>
                        {selected && (
                          <motion.div
                            className="w-2 h-2 rounded-full bg-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      animate={{
                        color: selected
                          ? "rgb(109,40,217)"
                          : "rgba(0,0,0,0.25)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 relative z-10"
                    >
                      {icon}
                    </motion.div>

                    {/* Text */}
                    <div className="relative z-10 min-w-0">
                      <p
                        className={`text-sm font-semibold transition-colors duration-200 ${selected ? "text-slate-900" : "text-slate-500"}`}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 font-light leading-snug">
                        {desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Textarea — only if yes */}
            {seriousIllness === "yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 mb-5"
              >
                <p className="text-sm font-medium text-gray-700">
                  Select applicable conditions:
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {diseases.map((disease) => (
                    <label
                      key={disease}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={disease}
                        checked={selectedDiseases.includes(disease)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDiseases([...selectedDiseases, disease]);
                          } else {
                            setSelectedDiseases(
                              selectedDiseases.filter((d) => d !== disease),
                            );
                          }
                        }}
                      />
                      <span className="text-sm text-gray-800">{disease}</span>
                    </label>
                  ))}
                </div>

                {/* optional details */}
                <textarea
                  placeholder="Additional details (optional)…"
                  className="w-full border rounded-lg p-3 text-sm mt-3"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </motion.div>
            )}

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: 0.45,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-5 origin-left"
            />

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={!seriousIllness || loading || saved}
                whileHover={
                  seriousIllness && !loading && !saved
                    ? { y: -2, scale: 1.01 }
                    : {}
                }
                whileTap={
                  seriousIllness && !loading && !saved ? { scale: 0.98 } : {}
                }
                className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-violet-300 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AnimatePresence mode="wait">
                    {loading && !saved ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Saving…
                      </motion.span>
                    ) : saved ? (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                        }}
                        className="flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Saved! Redirecting…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5"
                      >
                        {seriousIllness === "yes"
                          ? "Book Appointment →"
                          : "Save & Continue →"}
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
              🔒 Encrypted & secure — your data is never shared
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
