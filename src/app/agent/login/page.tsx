"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AgentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    router.prefetch("/agent/dashboard");
  }, [router]);

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

      router.replace("/agent/dashboard");
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
          Agent Portal
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Agent Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to access your Germany insurance agent dashboard.
        </p>

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
              placeholder="agent@example.com"
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
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-[#820ad1] text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login to Agent Dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Do not have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/agent/signup")}
            className="font-semibold text-[#820ad1] hover:underline"
          >
            Create Agent Account
          </button>
        </p>
      </div>
    </div>
  );
}

