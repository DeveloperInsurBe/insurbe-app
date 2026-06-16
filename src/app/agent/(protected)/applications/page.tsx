"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ClientItem = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AppItem = {
  id: string;
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
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientEmail: "",
    product: "Public Health Insurance",
  });

  const fetchData = async () => {
    try {
      const [clientsRes, appsRes] = await Promise.all([
        fetch("/api/agent/clients", { cache: "no-store" }),
        fetch("/api/agent/applications", { cache: "no-store" }),
      ]);

      const clientsData = await clientsRes.json();
      const appsData = await appsRes.json();

      if (!clientsRes.ok) throw new Error(clientsData.error || "Failed clients");
      if (!appsRes.ok) throw new Error(appsData.error || "Failed applications");

      setClients(clientsData);
      setApplications(appsData);
      if (!form.clientEmail && clientsData.length > 0) {
        setForm((prev) => ({ ...prev, clientEmail: clientsData[0].email }));
      }
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

  const canCreate = useMemo(
    () => Boolean(form.clientEmail && form.product),
    [form],
  );

  const createApplication = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/agent/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create application");
      setApplications((prev) => [data, ...prev]);
      toast.success("Application created");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to create application");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/agent/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setApplications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: data.status } : item)),
      );
      toast.success("Application status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Agent Workflow
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">Client Applications</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Create client applications and move them through submission stages.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-black text-[#111827]">Create Application</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Client</label>
            <select
              value={form.clientEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            >
              <option value="">Select client</option>
              {clients.map((item) => (
                <option key={item.id} value={item.email}>
                  {item.firstName} {item.lastName} ({item.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Product</label>
            <select
              value={form.product}
              onChange={(e) => setForm((prev) => ({ ...prev, product: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            >
              <option value="Public Health Insurance">Public Health Insurance</option>
              <option value="Private Health Insurance">Private Health Insurance</option>
              <option value="Travel Insurance">Travel Insurance</option>
            </select>
          </div>
        </div>

        <button
          onClick={createApplication}
          disabled={!canCreate || saving}
          className="mt-5 h-11 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create Application"}
        </button>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-black text-[#111827]">Application List</h2>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No applications yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Client</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Commission</th>
                  <th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 text-sm text-gray-700">
                    <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="py-3 pr-4">{item.email}</td>
                    <td className="py-3 pr-4">{item.product}</td>
                    <td className="py-3 pr-4">{item.status}</td>
                    <td className="py-3 pr-4">EUR {item.commission}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className="h-9 rounded-lg border border-gray-200 px-2 text-xs outline-none focus:border-[#820ad1]"
                      >
                        <option value="created">created</option>
                        <option value="documents_pending">documents_pending</option>
                        <option value="submitted">submitted</option>
                        <option value="processed">processed</option>
                      </select>
                    </td>
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

