"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PersonalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      await fetch(`/api/application/${id}/personal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      console.log("✅ Personal details saved");

      router.push(`/application/${id}/health`);
    } catch (err) {
      console.error("❌ Failed to save", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-xl font-bold">Personal Details</h1>

        <input
          name="address"
          placeholder="Address"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="city"
          placeholder="City"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="postalCode"
          placeholder="Postal Code"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="country"
          placeholder="Country"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}