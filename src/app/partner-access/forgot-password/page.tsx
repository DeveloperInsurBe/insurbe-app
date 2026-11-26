"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, MailCheck } from "lucide-react";

import AccessBrandPanel from "../AccessBrandPanel";

/**
 * Forgot password for partners, agents and Sales Leaders (?portal=team comes
 * from the Sales Leader login). Always shows the same answer, so nobody can
 * find out which emails have an account.
 */
export default function PartnerForgotPasswordPage() {
  const [portal, setPortal] = useState<"partner" | "team">("partner");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("portal") === "team") setPortal("team");
  }, []);

  const loginUrl = portal === "team" ? "/team/login" : "/partner-access/login";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), portal }),
      });
      if (!response.ok) throw new Error("failed");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5fb] px-4 py-10 sm:py-14">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(130,10,209,0.12)] ring-1 ring-[#f0e6fb] md:flex-row md:rounded-[32px]">
        <AccessBrandPanel
          variant="login"
          title="Forgot your password?"
          description="No problem. We'll email you a secure link to set a new one."
        />

        <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
            {portal === "team" ? "Sales Leader" : "Partner Access"}
          </p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">Reset password</h1>

          {sent ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <MailCheck size={18} /> Check your inbox
              </p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                If an account exists for <b>{email.trim().toLowerCase()}</b>, we&apos;ve sent a link to reset the
                password. The link works for 15 minutes. Please also check your spam folder.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-500">Enter the email you use to sign in.</p>

              {error ? (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              ) : null}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 w-full rounded-xl border border-[#efe3fb] bg-white px-4 text-sm outline-none transition-all hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? "Sending..." : "Send reset link"}
                  {!loading ? <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /> : null}
                </button>
              </form>
            </>
          )}

          <Link
            href={loginUrl}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#820ad1] hover:underline"
          >
            <ArrowLeft size={15} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
