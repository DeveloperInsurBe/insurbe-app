"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import AccessBrandPanel from "../AccessBrandPanel";

const MIN_LENGTH = 8;

/** Set a new password from the emailed link (partners, agents, Sales Leaders). */
export default function PartnerResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [portal, setPortal] = useState<"partner" | "team">("partner");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
    if (params.get("portal") === "team") setPortal("team");
  }, []);

  const loginUrl = portal === "team" ? "/team/login" : "/partner-access/login";
  const forgotUrl = portal === "team" ? "/partner-access/forgot-password?portal=team" : "/partner-access/forgot-password";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < MIN_LENGTH) return setError(`Your password must be at least ${MIN_LENGTH} characters long.`);
    if (password !== confirm) return setError("The two passwords do not match.");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, portal }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          data?.message === "Token invalid or expired"
            ? "This link has expired or was already used. Please request a new one."
            : data?.message || "Something went wrong. Please try again.",
        );
        return;
      }
      setDone(true);
      setTimeout(() => router.push(loginUrl), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-[#efe3fb] bg-white px-4 pr-11 text-sm outline-none transition-all hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5fb] px-4 py-10 sm:py-14">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(130,10,209,0.12)] ring-1 ring-[#f0e6fb] md:flex-row md:rounded-[32px]">
        <AccessBrandPanel variant="login" title="Set a new password" description="Choose a password you don't use anywhere else." />

        <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
            {portal === "team" ? "Sales Leader" : "Partner Access"}
          </p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">New password</h1>

          {token === "" ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              This link is not valid.{" "}
              <Link href={forgotUrl} className="font-semibold underline">
                Request a new link
              </Link>
              .
            </div>
          ) : done ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 size={18} /> Password changed
              </p>
              <p className="mt-2 text-sm text-emerald-900">Taking you to the login…</p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-500">At least {MIN_LENGTH} characters.</p>

              {error ? (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    {error}
                    {error.includes("expired") ? (
                      <>
                        {" "}
                        <Link href={forgotUrl} className="font-semibold underline">
                          Request a new link
                        </Link>
                      </>
                    ) : null}
                  </span>
                </div>
              ) : null}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">New password</span>
                  <span className="relative block">
                    <input
                      type={show ? "text" : "password"}
                      required
                      minLength={MIN_LENGTH}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((value) => !value)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#820ad1]"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Repeat new password</span>
                  <input
                    type={show ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading || token === null}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? "Saving..." : "Save new password"}
                </button>
              </form>
            </>
          )}

          <Link href={loginUrl} className="mt-6 inline-block text-sm font-semibold text-[#820ad1] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
