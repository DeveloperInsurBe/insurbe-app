"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function HealthPage() {
  const { id } = useParams();
  const router = useRouter();

  const [seriousIllness, setSeriousIllness] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async () => {
    try {
      // 🚨 IF YES → redirect to appointment
      if (seriousIllness === "yes") {
        router.push("/book-appointment");
        return;
      }

      // ✅ Save health data
      await fetch(`/api/application/${id}/health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriousIllness,
          details,
        }),
      });

      console.log("✅ Health saved");

      router.push(`/application/${id}/documents`);
    } catch (err) {
      console.error("❌ Error saving health", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-xl font-bold">Health Information</h1>

        <p className="text-sm text-gray-600">
          Have you had a serious illness in the last 5 years?
        </p>

        <div className="space-y-2">
          <label>
            <input
              type="radio"
              value="yes"
              checked={seriousIllness === "yes"}
              onChange={(e) => setSeriousIllness(e.target.value)}
            />{" "}
            Yes
          </label>

          <label>
            <input
              type="radio"
              value="no"
              checked={seriousIllness === "no"}
              onChange={(e) => setSeriousIllness(e.target.value)}
            />{" "}
            No
          </label>
        </div>

        {/* 🔥 Show extra field ONLY if yes */}
        {seriousIllness === "yes" && (
          <textarea
            placeholder="Please describe your condition"
            className="w-full border p-2 rounded"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        )}

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