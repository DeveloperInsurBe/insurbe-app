"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200">
        
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Forgot Password
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your registered email to receive reset instructions
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition shadow-lg disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {message}
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center text-sm">
          <a
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}