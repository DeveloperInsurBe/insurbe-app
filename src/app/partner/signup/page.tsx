"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PartnerSignup() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    phone: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        role: "partner", // 👈 IMPORTANT
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/partner/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignup} className="space-y-4 w-full max-w-md">
        <h2 className="text-2xl font-bold">Partner Signup</h2>

        <input
          name="companyName"
          placeholder="Company Name"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button className="bg-black text-white py-2 w-full">
          Create Partner Account
        </button>
      </form>
    </div>
  );
}