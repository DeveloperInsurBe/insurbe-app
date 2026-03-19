"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApplicationPage() {
  const { id } = useParams();
  const router = useRouter();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/application/${id}`);
        const data = await res.json();

        console.log("📄 Application:", data);
        setApplication(data);
      } catch (err) {
        console.error("❌ Failed to fetch application", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplication();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!application)
    return <p className="p-6 text-red-500">Application not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold">
            Application #{application.orderId}
          </h1>
          <p className="text-gray-600">
            Status: {application.status}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Progress</h2>

          <div className="space-y-2">
            <Step label="Order Created" done />
            <Step label="Personal Details" done={!!application.personalDetails} />
            <Step label="Health Information" done={!!application.healthAnswers} />
            <Step label="Documents Upload" done={!!application.uploadedDocs} />
            <Step label="Signature" done={!!application.signature} />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-xl shadow">
          <button
            onClick={() =>
              router.push(`/application/${id}/personal`)
            }
            className="px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            Continue Application
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-4 h-4 rounded-full ${
          done ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <p className={done ? "text-green-600" : "text-gray-600"}>
        {label}
      </p>
    </div>
  );
}