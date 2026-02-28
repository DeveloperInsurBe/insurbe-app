"use client";

import { useEffect, useState } from "react";
import { Shield, FileText, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface Policy {
  id: number;
  name: string;
  status: string;
  startDate: string;
}

interface Document {
  id: number;
  title: string;
  uploadedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Extract name from email
  const userEmail = session?.user?.email || "";
  const userName = userEmail.split("@")[0] || "User";
  // Capitalize first letter
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  useEffect(() => {
    setPolicies([
      {
        id: 1,
        name: "Student Health Insurance",
        status: "Active",
        startDate: "01 Jan 2026",
      },
      {
        id: 2,
        name: "Travel Insurance",
        status: "Pending",
        startDate: "15 Feb 2026",
      },
    ]);

    setDocuments([
      {
        id: 1,
        title: "Policy Certificate",
        uploadedAt: "02 Jan 2026",
      },
      {
        id: 2,
        title: "Invoice Receipt",
        uploadedAt: "03 Jan 2026",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {displayName}
          </h1>
          <p className="text-gray-600">{userEmail}</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {policies.length}
                </p>
                <p className="text-sm text-gray-600">Active Policies</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.length}
                </p>
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Premium</p>
                <p className="text-sm text-gray-600">Member Type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Policies</h2>
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{policy.name}</p>
                  <p className="text-sm text-gray-600">
                    Start: {policy.startDate}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    policy.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {policy.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{doc.title}</p>
                  <p className="text-sm text-gray-600">
                    Uploaded: {doc.uploadedAt}
                  </p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}