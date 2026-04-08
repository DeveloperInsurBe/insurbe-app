"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  AlertCircle,
  LogInIcon,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // important: prevent auto refresh/redirect
      });

      if (!res || res.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // 🔥 Attach application (if exists)
      const applicationId = sessionStorage.getItem("applicationId");
      console.log("🆔 applicationId:", applicationId);

      if (applicationId) {
        try {
          await fetch("/api/application/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ applicationId }),
          });

          console.log("✅ Application linked");
          sessionStorage.removeItem("applicationId");
        } catch (err) {
          console.error("❌ Failed to link application:", err);
        }
      }

      // ✅ Redirect manually only after successful login
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-linear-to-br from-slate-100 via-neutral-100 to-violet-100 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-200/35 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto grid h-full w-full max-w-6xl items-center gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Left Brand Panel */}
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden rounded-3xl border border-white/60 bg-white/55 p-10 shadow-xl backdrop-blur-xl lg:block"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Shield className="h-4 w-4" />
            Secure access for your insurance journey
          </div>

          <h2 className="max-w-md text-4xl font-extrabold leading-tight text-slate-900">
            Welcome back to
            <span className="block bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              your InsurBe Account
            </span>
          </h2>

          <p className="mt-4 max-w-md text-slate-600">
            Sign in to view policy documents, continue unfinished applications,
            and manage everything in one place.
          </p>

          <div className="mt-10 grid gap-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 rounded-xl bg-white/70 p-3">
              <Shield className="h-4 w-4 text-violet-600" />
              End-to-end protected login flow
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/70 p-3">
              <LogInIcon className="h-4 w-4 text-violet-600" />
              Instant access to saved applications
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/70 p-3">
              <Mail className="h-4 w-4 text-violet-600" />
              Policy updates delivered to your inbox
            </div>
          </div>
        </motion.section>

        {/* Right Form Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-[640px] lg:max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 md:p-7 shadow-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-center"
          >
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-slate-600">Access your policies and documents</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-3 text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-3 text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-right"
            >
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 py-3.5 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                    />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <LogInIcon className="h-5 w-5" />
                  </>
                )}
              </span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-slate-600"
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
              >
                Sign up
              </Link>
            </motion.p>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>GDPR compliant</span>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
