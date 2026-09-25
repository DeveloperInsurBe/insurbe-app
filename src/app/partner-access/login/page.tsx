"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import AccessBrandPanel from "../AccessBrandPanel";

type AccountType = "partner" | "agent";

export default function PartnerAccessLoginPage() {
  const router = useRouter();
  const initialType = useMemo<AccountType>(() => "partner", []);

  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const type = new URLSearchParams(window.location.search).get("type");
    if (type === "agent") {
      setAccountType("agent");
    } else {
      setAccountType("partner");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        const message = "Invalid email or password";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      const expectedRole = accountType === "partner" ? "partner" : "agent";

      if (!session?.user || role !== expectedRole) {
        await signOut({ redirect: false });
        const message =
          accountType === "partner"
            ? "This account is not a partner account"
            : "This account is not an agent account";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      router.replace("/portal/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5fb] px-4 py-10 sm:py-14">
      {/* soft animated page background */}
      <div className="modal-float pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#820ad1]/10 blur-3xl" />
      <div
        className="modal-float pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#a855f7]/10 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />

      <div className="modal-panel-in relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(130,10,209,0.12)] ring-1 ring-[#f0e6fb] md:flex-row md:rounded-[32px]">
        <AccessBrandPanel
          variant="login"
          title="Welcome back, partner"
          description="Track referrals, conversions and commission earnings in real-time."
        />

        <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12">
        <p
          className="modal-item-in text-xs font-bold uppercase tracking-[2px] text-[#820ad1]"
          style={{ animationDelay: "160ms" }}
        >
          Partner Access
        </p>
        <h1
          className="modal-item-in mt-3 text-3xl font-black text-gray-900"
          style={{ animationDelay: "220ms" }}
        >
          Login
        </h1>
        <p
          className="modal-item-in mt-2 text-sm text-gray-500"
          style={{ animationDelay: "280ms" }}
        >
          Login to your partner or agent portal.
        </p>

        <div className="modal-item-in mt-6" style={{ animationDelay: "340ms" }}>
          <h2 className="flex items-center justify-center gap-2 rounded-2xl border border-[#efe3fb] bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] px-4 py-3 text-center text-base font-semibold text-[#820ad1] sm:text-lg">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Institution / Referral Partner
          </h2>

          {/* <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAccountType("partner")}
              className={`cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                accountType === "partner"
                  ? "border-[#820ad1] bg-[#820ad1]/10 text-[#820ad1]"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Institution / Referral Partner
            </button>

            <button
              type="button"
              onClick={() => setAccountType("agent")}
              className={`cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                accountType === "agent"
                  ? "border-[#820ad1] bg-[#820ad1]/10 text-[#820ad1]"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Insurance Agent / Broker Agent
            </button>
          </div> */}
        </div>

        {error ? (
          <div className="modal-item-in mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="modal-item-in" style={{ animationDelay: "400ms" }}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="group relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#820ad1]"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.75A1.75 1.75 0 0 1 4.75 6h14.5A1.75 1.75 0 0 1 21 7.75v8.5A1.75 1.75 0 0 1 19.25 18H4.75A1.75 1.75 0 0 1 3 16.25v-8.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 7 7.65 6.12a1.35 1.35 0 0 0 1.7 0L20.5 7" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="h-12 w-full rounded-xl border border-[#efe3fb] bg-white pl-11 pr-4 text-sm outline-none transition-all hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
            </div>
          </div>

          <div className="modal-item-in" style={{ animationDelay: "460ms" }}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="group relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#820ad1]"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect x="5" y="10" width="14" height="10" rx="2" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-[#efe3fb] bg-white pl-11 pr-11 text-sm outline-none transition-all hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-[#820ad1]"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9c4.86 0 8.35 3.02 9.73 6.1a1 1 0 0 1 0 .8 11.27 11.27 0 0 1-4.1 4.7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.62A11.31 11.31 0 0 0 2.27 11a1 1 0 0 0 0 .8c1.38 3.08 4.87 6.1 9.73 6.1 1.03 0 2.01-.13 2.93-.37" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.27 11a1 1 0 0 0 0 .8c1.38 3.08 4.87 6.1 9.73 6.1s8.35-3.02 9.73-6.1a1 1 0 0 0 0-.8C20.35 7.92 16.86 4.9 12 4.9S3.65 7.92 2.27 11Z" />
                    <circle cx="12" cy="11.4" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="modal-item-in" style={{ animationDelay: "520ms" }}>
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#820ad1]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Logging in..." : "Login"}
              {!loading ? (
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              ) : null}
            </button>
          </div>
        </form>

        <p
          className="modal-item-in mt-6 text-center text-sm text-gray-500"
          style={{ animationDelay: "580ms" }}
        >
          Do not have an account?{" "}
          <Link href={`/partner-access/signup?type=${accountType}`} className="font-semibold text-[#820ad1] hover:underline">
            Create Account
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
