"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Home,
  LayoutDashboard,
  Loader2,
  Mail,
  ShieldCheck,
  CircleCheck,
} from "lucide-react";

const PROVIDERS: Record<string, { name: string; logo?: string }> = {
  tk: { name: "TK Health Insurance", logo: "/icons/tk.png" },
  dak: { name: "DAK Health Insurance", logo: "/icons/dak_logo.jpeg" },
  aok: { name: "AOK Insurance", logo: "/partners_asset/AOK_logo.avif" },
};

/* -------------------------------------------------------------------------- */
/*                               ANIMATED PIECES                              */
/* -------------------------------------------------------------------------- */

const CONFETTI_COLORS = ["#820ad1", "#a855f7", "#c084fc", "#f0abfc", "#60a5fa", "#fbbf24"];

/** A short, soft confetti burst around the check mark. */
function ConfettiBurst() {
  const pieces = Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2;
    const distance = 90 + (index % 3) * 28;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: (index * 47) % 360,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      round: index % 2 === 0,
      delay: 0.55 + (index % 6) * 0.03,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {pieces.map((piece, index) => (
        <motion.span
          key={index}
          className={`absolute h-2 w-2 ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{ backgroundColor: piece.color }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{
            x: piece.x,
            y: piece.y,
            opacity: [0, 1, 1, 0],
            scale: [0.4, 1, 1, 0.6],
            rotate: piece.rotate,
          }}
          transition={{ duration: 1.4, delay: piece.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/** Check mark that draws itself inside a pulsing badge. */
function SuccessBadge({ animate }: { animate: boolean }) {
  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
      {animate && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/15"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.25, 1.4], opacity: [0, 0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
            aria-hidden
          />
          <ConfettiBurst />
        </>
      )}

      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#a855f7] shadow-[0_18px_45px_rgba(130,10,209,0.35)] sm:h-28 sm:w-28"
        initial={animate ? { scale: 0, rotate: -30 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <svg viewBox="0 0 52 52" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden>
          <motion.path
            d="M14 27.5 L22.5 36 L39 18"
            fill="none"
            stroke="white"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  const [copied, setCopied] = useState(false);

  const appId = searchParams.get("appId");

  // Set only by the TK API form: TK's own application number (antragId).
  const tkRef = searchParams.get("tkRef");
  const tkEnv = searchParams.get("tkEnv");

  const providerKey = (searchParams.get("provider") || "").toLowerCase();
  const provider = PROVIDERS[providerKey] || {
    name: searchParams.get("provider") || "your insurance provider",
  };

  const email = searchParams.get("email") || "your registered email";

  const copyReference = async () => {
    if (!appId) return;
    try {
      await navigator.clipboard.writeText(appId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable - nothing to do
    }
  };

  const steps = [
    {
      title: "Application submitted",
      text: appId ? `Saved under ${appId}` : "We have received your details",
      done: true,
    },
    tkRef
      ? { title: "Received by TK", text: `TK reference ${tkRef}`, done: true }
      : { title: "Review by our team", text: "Usually within 24 hours", done: false },
    {
      title: "Decision by email",
      text: `${provider.name} will contact you at ${email}`,
      done: false,
    },
  ];

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: animate ? 0.08 : 0, delayChildren: animate ? 0.75 : 0 } },
  };

  const item: Variants = {
    hidden: animate ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f6ff] px-4 py-10 sm:py-16">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <motion.div
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl"
          animate={animate ? { x: [0, 30, 0], y: [0, 20, 0] } : undefined}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl"
          animate={animate ? { x: [0, -30, 0], y: [0, -20, 0] } : undefined}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(130,10,209,0.07)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <motion.section
          initial={animate ? { opacity: 0, y: 24, scale: 0.98 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-[28px] border border-white/70 bg-white/85 px-5 pb-6 pt-8 shadow-[0_24px_80px_rgba(91,33,182,0.12)] backdrop-blur-xl sm:px-10 sm:pb-10 sm:pt-10"
        >
          <SuccessBadge animate={animate} />

          <motion.div variants={container} initial="hidden" animate="show">
            {/* HEADLINE */}
            <motion.div variants={item} className="mt-2 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <CircleCheck className="h-3.5 w-3.5" aria-hidden />
                Application submitted
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                You&apos;re all set!
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                Thank you for choosing <span className="font-semibold text-gray-900">InsurBe</span>. Your{" "}
                {provider.name} application is on its way.
              </p>
            </motion.div>

            {/* REFERENCE */}
            {appId && (
              <motion.div
                variants={item}
                className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-[#faf7ff] to-white p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Application reference</p>
                    <p className="mt-1 truncate text-2xl font-bold tracking-wide text-primary sm:text-3xl">{appId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyReference}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="Copy application reference"
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {tkRef && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-4 text-sm text-gray-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span>
                      Confirmed by TK – reference{" "}
                      <span className="font-semibold tracking-wide text-gray-900">{tkRef}</span>
                    </span>
                    {tkEnv === "staging" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        TK test system
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* PROVIDER + EMAIL */}
            <motion.div variants={item} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-1.5">
                  {provider.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={provider.logo} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Provider</p>
                  <p className="truncate font-semibold text-gray-900">{provider.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Confirmation sent to</p>
                  <p className="truncate font-semibold text-gray-900" title={email}>
                    {email}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* NEXT STEPS */}
            <motion.div variants={item} className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">What happens next</h2>
              <ol className="mt-4">
                {steps.map((step, index) => {
                  const last = index === steps.length - 1;
                  return (
                    <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                      {!last && (
                        <span
                          className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${
                            step.done ? "bg-primary/40" : "bg-gray-200"
                          }`}
                          aria-hidden
                        />
                      )}
                      <span
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          step.done ? "bg-primary text-white shadow-md shadow-primary/30" : "border-2 border-gray-200 bg-white text-gray-400"
                        }`}
                      >
                        {step.done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                        {!step.done && index === steps.findIndex((s) => !s.done) && animate && (
                          <motion.span
                            className="absolute inset-0 rounded-full border-2 border-primary/50"
                            animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                            aria-hidden
                          />
                        )}
                      </span>
                      <div className="min-w-0 pt-1">
                        <p className={`font-semibold ${step.done ? "text-gray-900" : "text-gray-700"}`}>{step.title}</p>
                        <p className="mt-0.5 break-words text-sm text-gray-500">{step.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.div>

            {/* ACTIONS */}
            <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => router.push("/dashboard")}
                whileHover={animate ? { y: -2 } : undefined}
                whileTap={animate ? { scale: 0.98 } : undefined}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-[#a855f7] px-6 py-4 font-semibold text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <LayoutDashboard className="h-5 w-5" aria-hidden />
                View dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => router.push("/")}
                whileHover={animate ? { y: -2 } : undefined}
                whileTap={animate ? { scale: 0.98 } : undefined}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-4 font-semibold text-gray-800 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                <Home className="h-5 w-5" aria-hidden />
                Back to home
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.p
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          Didn&apos;t get the email? Check your spam folder or{" "}
          <a href="/contact" className="font-medium text-primary underline-offset-2 hover:underline">
            contact us
          </a>
          .
        </motion.p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f6ff]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
