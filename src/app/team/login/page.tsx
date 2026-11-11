"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, UsersRound } from "lucide-react";

import { TEAM_ADMIN_ROLE } from "@/lib/team/roles";

const inputClass =
  "h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-[15px] text-gray-900 outline-none transition focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10";

export default function TeamLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fail = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email: email.trim(), password, redirect: false });
      if (!result || result.error) return fail("The email or password is not correct.");

      const session = await getSession();
      if (session?.user?.role !== TEAM_ADMIN_ROLE) {
        await signOut({ redirect: false });
        return fail("This account has no access to the team portal.");
      }
      // Keep the button loading until the dashboard replaces this page.
      router.replace("/team/dashboard");
    } catch {
      fail("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white">
          <UsersRound className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-gray-900">InsurBe Team Portal</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to see your agents and their customers.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-900">Email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-900">Password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          {error ? (
            <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#820ad1] font-semibold text-white transition hover:bg-[#6d08b0] disabled:opacity-80"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500">
          Forgot your password? Please contact InsurBe at{" "}
          <a href="mailto:support@insurbe.com" className="font-semibold text-[#820ad1] hover:underline">
            support@insurbe.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
