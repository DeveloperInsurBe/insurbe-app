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
      const res = await signIn("credentials", {
        email,
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

      if (role === "partner") {
        router.replace("/partner/dashboard");
      } else {
        router.replace("/agent/dashboard");
      }
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
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
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
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-[#820ad1] text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
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
