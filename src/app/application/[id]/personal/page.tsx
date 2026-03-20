"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const fields = [
  { name: "address",    label: "Street Address", icon: "🏠", type: "text", colSpan: "col-span-2" },
  { name: "city",       label: "City",            icon: "🏙️", type: "text", colSpan: "col-span-1" },
  { name: "postalCode", label: "Postal Code",     icon: "📮", type: "text", colSpan: "col-span-1" },
  { name: "country",    label: "Country",         icon: "🌍", type: "text", colSpan: "col-span-1" },
  { name: "phone",      label: "Phone Number",    icon: "📱", type: "tel",  colSpan: "col-span-1" },
] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function PersonalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    address: "", city: "", postalCode: "", country: "", phone: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch(`/api/application/${id}/personal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log("✅ Personal details saved");
      setSaved(true);
      setTimeout(() => router.push(`/application/${id}/health`), 900);
    } catch (err) {
      console.error("❌ Failed to save", err);
      setLoading(false);
    }
  };

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
                    i === 1
                      ? "w-6 bg-violet-500"
                      : i < 1
                      ? "w-3 bg-violet-400/60"
                      : "w-3 bg-black/10"
                  }`}
                  animate={i === 1 ? { opacity: [1, 0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
            <span className="text-xs text-black/30 font-medium tracking-widest uppercase">
              Step 2 / 4
            </span>
          </div>

          <div className="px-6 pt-7 pb-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-7"
            >
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
                  Personal Info
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Your Details
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-light">
                Fill in your contact and location info below.
              </p>
            </motion.div>

            {/* Fields */}
            <motion.div
              className="grid grid-cols-2 gap-3 mb-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {fields.map(({ name, label, icon, type, colSpan }) => {
                const isFocused = focused === name;
                const hasValue  = !!(form as any)[name];

                return (
                  <motion.div
                    key={name}
                    variants={itemVariants}
                    className={`relative ${colSpan} sm:${colSpan}`}
                  >
                    <motion.div
                      animate={isFocused
                        ? { boxShadow: "0 0 0 2px rgba(139,92,246,0.4), 0 0 16px rgba(139,92,246,0.06)" }
                        : { boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }
                      }
                      transition={{ duration: 0.2 }}
                      className="relative bg-slate-50 rounded-xl overflow-hidden"
                    >
                      {/* Focused gradient overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] to-transparent pointer-events-none"
                        animate={{ opacity: isFocused ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />

                      {/* Icon */}
                      <motion.span
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10"
                        animate={isFocused ? { scale: 1.15 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {icon}
                      </motion.span>

                      {/* Floating label */}
                      <motion.label
                        className="absolute left-11 pointer-events-none z-10 origin-left font-normal"
                        animate={
                          isFocused || hasValue
                            ? { top: "8px", fontSize: "10px", color: "rgba(109,40,217,1)", fontWeight: "500" }
                            : { top: "50%", fontSize: "13.5px", color: "rgba(100,116,139,1)", fontWeight: "400" }
                        }
                        style={isFocused || hasValue ? {} : { translateY: "-50%" }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {label}
                      </motion.label>

                      <input
                        className="w-full bg-transparent outline-none text-slate-900 text-sm font-normal placeholder-transparent pt-[22px] pb-[8px] pl-11 pr-3.5 relative z-10"
                        type={type}
                        name={name}
                        value={(form as any)[name]}
                        placeholder={label}
                        onFocus={() => setFocused(name)}
                        onBlur={() => setFocused(null)}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent mb-6 origin-left"
            />

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={loading || saved}
                whileHover={!loading && !saved ? { y: -2, scale: 1.01 } : {}}
                whileTap={!loading && !saved ? { scale: 0.98 } : {}}
                className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600  shadow-lg shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed transition-shadow hover:shadow-violet-300 hover:shadow-xl"
              >
                {/* Shimmer */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: "-100%" }}
                  animate={!loading && !saved ? { x: ["-100%", "200%"] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
                />

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
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Saving…
                      </motion.span>
                    ) : saved ? (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className="flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                        Save & Continue
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
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