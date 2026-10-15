"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, Eye, EyeOff, FileCheck2, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

import { DAK_REVIEWER } from "../_data/mock";

// UI only: these demo credentials are shown in the design. Sign-in is not
// wired to a backend yet and simply opens the dashboard.
const DEMO_PASSWORD = "DAKreview2026!";

const HIGHLIGHTS = [
  { icon: FileCheck2, title: "Review applications", text: "Every DAK registration with documents in one queue." },
  { icon: Activity, title: "Full audit trail", text: "Each status change is recorded automatically." },
  { icon: ShieldCheck, title: "Secure by design", text: "TLS encrypted · WCAG 2.2 AA accessible." },
];

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 text-[15px] text-slate-900 placeholder:text-slate-300 transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10";

export default function DakLoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dak-portal/dashboard"), 600);
  };

  const fillDemo = () => {
    setEmail(DAK_REVIEWER.email);
    setPassword(DEMO_PASSWORD);
  };

  const fade = (delay: number) =>
    reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* BRAND PANEL */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1e0b46] via-[#4c1d95] to-[#8b2be2] p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.div
            className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-400/25 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xl font-semibold">InsurBe</span>
        </div>

        <div className="relative mt-auto max-w-md">
          <motion.p {...fade(0.1)} className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200">
            DAK Provider Portal
          </motion.p>
          <motion.h2 {...fade(0.18)} className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Review DAK applications faster, with everything in one place.
          </motion.h2>

          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }, index) => (
              <motion.li key={title} {...fade(0.3 + index * 0.08)} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-violet-100/80">{text}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative mt-12 text-xs text-violet-200/70">© InsurBe · Secure · WCAG 2.2 AA · TLS encrypted</p>
      </aside>

      {/* FORM */}
      <main className="relative flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl lg:hidden" aria-hidden />

        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b2be2] to-[#5b21b6] shadow-md shadow-violet-500/30">
              <ShieldCheck className="h-5 w-5 text-white" aria-hidden />
            </span>
            <span className="text-lg font-semibold text-slate-900">InsurBe</span>
          </div>

          <motion.div {...fade(0.05)}>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">DAK Provider Portal</h1>
            <p className="mt-2 text-slate-500">Sign in with your InsurBe-issued DAK credentials</p>
          </motion.div>

          <motion.form {...fade(0.15)} onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="dak-email" className="mb-2 block text-sm font-medium text-slate-900">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  id="dak-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={DAK_REVIEWER.email}
                  className={`${inputClass} pr-4`}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="dak-password" className="text-sm font-medium text-slate-900">
                  Password
                </label>
                <button type="button" className="text-sm font-medium text-violet-700 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  id="dak-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-violet-600"
              />
              Remember this device
            </label>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={reduceMotion || loading ? undefined : { scale: 0.98 }}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#8b2be2] to-[#7419c9] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_24px_-10px_rgba(124,31,214,0.7)] transition hover:brightness-110 disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div {...fade(0.3)} className="mt-8 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-3 text-sm text-slate-600">
            Demo credentials:{" "}
            <button type="button" onClick={fillDemo} className="font-medium text-violet-700 hover:underline">
              {DAK_REVIEWER.email} / {DEMO_PASSWORD}
            </button>
          </motion.div>

          <p className="mt-10 text-center text-xs text-slate-400 lg:hidden">InsurBe · Secure · WCAG 2.2 AA · TLS encrypted</p>
        </div>
      </main>
    </div>
  );
}
