"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("Submitting forgot password for:", email);

  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    console.log("Response status:", res.status);

    const data = await res.json();
    console.log("Response data:", data);

    setMessage(data.message);
  } catch (error) {
    console.error("Fetch error:", error);
    setMessage("Something went wrong");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded">
        <h1 className="text-xl font-semibold">Forgot Password</h1>

        <input
          type="email"
          placeholder="Enter your email"
          required
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Send reset link
        </button>

        {message && <p className="text-sm text-center">{message}</p>}
      </form>
    </div>
  );
}
