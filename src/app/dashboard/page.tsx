"use client";

import { useEffect, useState } from "react";
import { Shield, FileText, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface Policy {
  id: number;
  name: string;
  status: string;
  startDate: string;
  pdfBase64?: string;
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
  const router = useRouter();

  // TODO: Fetch real data from API
  useEffect(() => {
    const attachAndFetch = async () => {
      try {
        const applicationId = sessionStorage.getItem("applicationId");

        // 🔥 STEP 1: Attach application
        if (applicationId) {
          console.log("🔗 Attaching application:", applicationId);

          await fetch("/api/application/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ applicationId }),
          });

          sessionStorage.removeItem("applicationId");
        }

        // 🔥 STEP 2: Fetch applications
        const res = await fetch("/api/application/user");
        const data = await res.json();

        console.log("📄 Applications:", data);

        const policyData = data.map((app: any) => ({
          id: app.id,
          name: "Hallesche Private Insurance",
          status: app.status,
          startDate: new Date(app.createdAt).toDateString(),
        }));

        const documentData = data.map((app: any) => ({
          id: app.id,
          title: "Application PDF",
          uploadedAt: new Date(app.createdAt).toDateString(),
          pdfBase64: app.pdfBase64,
        }));

        setPolicies(policyData);
        setDocuments(documentData);
      } catch (err) {
        console.error("❌ Dashboard error:", err);
      }
    };

    if (session) {
      attachAndFetch();
    }
  }, [session]);

  const downloadPDF = (base64: string) => {
    const byteCharacters = atob(base64);

    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    window.open(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {displayName}
            </h1>
            <p className="text-gray-600">{userEmail}</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Shield className="w-5 h-5 text-purple-600" />}
            value={policies.length}
            label="Policies"
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            value={documents.length}
            label="Documents"
          />
          <StatCard
            icon={<User className="w-5 h-5 text-green-600" />}
            value="Premium"
            label="Member Type"
          />
        </div>

        {/* Policies */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Policies</h2>

          {policies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-lg font-semibold">
                Start your insurance journey 🚀
              </p>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Explore plans and get insured today.
              </p>
              <button
                onClick={() => router.push("/insurance/private-health")}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Explore Plans
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => {
                const progress =
                  policy.status === "completed"
                    ? 100
                    : policy.status === "incomplete"
                      ? 60
                      : 20;

                return (
                  <div
                    key={policy.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {policy.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Start: {policy.startDate}
                        </p>

                        {/* Status Badge */}
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            policy.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : policy.status === "incomplete"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {policy.status === "completed"
                            ? "Completed"
                            : policy.status === "incomplete"
                              ? "In Progress"
                              : "Pending"}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => {
                            if (
                              policy.status === "completed" &&
                              policy.pdfBase64
                            ) {
                              downloadPDF(policy.pdfBase64);
                            } else {
                              router.push(`/application/${policy.id}`);
                            }
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                        >
                          {policy.status === "completed"
                            ? "Download PDF"
                            : "Continue"}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {progress}% completed
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documents</h2>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">
                No documents available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded: {doc.uploadedAt}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadPDF((doc as any).pdfBase64)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                  >
                    View PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, value, label }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);
