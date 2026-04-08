"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message);

    if (res.ok) {
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-200">
        <p className="text-red-500 font-medium text-lg">
          Invalid or missing reset token
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-200 px-4">
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8 space-y-6"
      >
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your new password below
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <input
            type="password"
            placeholder="New password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {/* Message */}
        {message && (
          <p className="text-sm text-center text-gray-700">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}