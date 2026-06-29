"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-[#f7f5fb] px-4 py-12">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Partner Access
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          Login to your partner or agent portal.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-11 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700"
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full cursor-pointer rounded-xl bg-[#820ad1] text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Do not have an account?{" "}
          <Link href={`/partner-access/signup?type=${accountType}`} className="font-semibold text-[#820ad1] hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
