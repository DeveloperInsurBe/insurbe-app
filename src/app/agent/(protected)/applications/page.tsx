"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import AgentInsurancePurchaseCard from "../dashboard/AgentInsurancePurchaseCard";

type AppItem = {
  id: string;
  orderId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  product: string;
  status: string;
  commission: number;
  commissionStatus: string;
};

export default function AgentApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const appsRes = await fetch("/api/agent/applications", { cache: "no-store" });
      const appsData = await appsRes.json();
      if (!appsRes.ok) throw new Error(appsData.error || "Failed applications");

      setApplications(appsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Agent Workflow
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">Client Applications</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Track only successfully submitted client applications.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        {session?.user?.id ? (
          <AgentInsurancePurchaseCard agentRef={session.user.id} />
        ) : (
          <p className="text-sm text-gray-500">Preparing application flow...</p>
        )}
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-black text-[#111827]">Submitted Applications</h2>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No submitted applications yet. Once an application is submitted successfully, it will appear here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Client</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Commission</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 text-sm text-gray-700">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-600">{item.orderId || "-"}</td>
                    <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="py-3 pr-4">{item.email}</td>
                    <td className="py-3 pr-4">{item.product}</td>
                    <td className="py-3 pr-4">{item.status}</td>
                    <td className="py-3 pr-4">EUR {item.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
