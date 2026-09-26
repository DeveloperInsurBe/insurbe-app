"use client";

import { useState } from "react";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BadgeEuro,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Users,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const HIGHLIGHTS = [
  { icon: BarChart3, title: "Live dashboard", text: "Applications, trends and partner activity" },
  { icon: Users, title: "Partners & agents", text: "Rates, enrollments and customer details" },
  { icon: BadgeEuro, title: "Commission payouts", text: "Review, approve and mark as paid" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const fail = (message: string) => {
    setError(message);
    setErrorKey((key) => key + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!response || response.error) {
        fail("Invalid admin credentials");
        return;
      }

      const session = await getSession();

      if (!session?.user || session.user.role !== "admin") {
        await signOut({ redirect: false });
        fail("Only admin account can access this portal");
        return;
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      console.error(err);
      fail("Something went wrong while logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-[100dvh] overflow-hidden bg-[#f6f7fb] lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#5b0896] via-[#820ad1] to-[#a855f7] h-full p-8 text-white lg:flex lg:flex-col xl:p-10 [@media(max-height:720px)]:p-6">
          {/* floating glow */}
          <motion.div
            aria-hidden
            className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* grid texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          {/* centred content column */}
          <div className="relative mx-auto flex h-full w-full max-w-lg flex-col">
            <motion.div
              className="relative flex items-center gap-2.5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Shield className="h-5 w-5" />
              </span>
              <span className="text-lg font-black tracking-tight">InsurBe</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                Admin
              </span>
            </motion.div>

            <div className="relative my-auto py-6 [@media(max-height:720px)]:py-3">
              <motion.h1
                className="text-3xl font-black leading-tight xl:text-4xl [@media(max-height:760px)]:text-3xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              >
                Everything your team runs, in one place.
              </motion.h1>
              <motion.p
                className="mt-3 text-sm leading-relaxed text-white/80 xl:text-base [@media(max-height:760px)]:text-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              >
                Track TK, DAK and private applications, manage partners and agents,
                and pay out commissions.
              </motion.p>

              <ul className="mt-6 space-y-2.5 [@media(max-height:640px)]:hidden [@media(max-height:760px)]:mt-4 [@media(max-height:760px)]:space-y-2">
                {HIGHLIGHTS.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.li
                      key={item.title}
                      className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md [@media(max-height:760px)]:py-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.35 + index * 0.1, ease: EASE }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold">{item.title}</span>
                        <span className="block text-xs text-white/70">{item.text}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <p className="relative text-xs text-white/60">
              © {new Date().getFullYear()} InsurBe · Restricted to authorised staff
            </p>
          </div>
        </section>

        {/* FORM */}
        <section className="relative flex h-full items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
          {/* mobile background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#820ad1]/15 to-transparent lg:hidden"
          />

          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_24px_60px_-20px_rgba(130,10,209,0.25)] sm:p-8 [@media(max-height:720px)]:p-5">
              <div className="mb-6 [@media(max-height:720px)]:mb-4">
                <motion.div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/30"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
                >
                  <Shield className="h-6 w-6" />
                </motion.div>
                <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1] lg:hidden">
                  InsurBe Admin
                </p>
                <h2 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Sign in with your InsurBe admin credentials.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div
                    key={errorKey}
                    role="alert"
                    className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#820ad1]" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                      placeholder="admin@insurbe.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#820ad1]" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-11 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? undefined : { y: -1 }}
                  whileTap={loading ? undefined : { scale: 0.98 }}
                  className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 transition-shadow hover:shadow-xl hover:shadow-[#820ad1]/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to Admin Portal
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 [@media(max-height:720px)]:mt-3">
                <Lock className="h-3 w-3" />
                Admin access only. Activity may be logged.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </MotionConfig>
  );
}
