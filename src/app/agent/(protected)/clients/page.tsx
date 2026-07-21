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

export default function AgentClientsPage() {
  const [items, setItems] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/agent/clients", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch clients");
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const canCreate = useMemo(
    () =>
      Boolean(
        form.firstName.trim() && form.lastName.trim() && form.email.trim(),
      ),
    [form],
  );

  const createClient = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/agent/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client");
      setItems((prev) => [data, ...prev]);
      setForm({ firstName: "", lastName: "", email: "" });
      toast.success("Client profile created");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Agent Workflow
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">Client Profiles</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Add and manage client profiles before creating applications.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-black text-[#111827]">Add Client</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="First Name" value={form.firstName} onChange={(v) => setForm((p) => ({ ...p, firstName: v }))} />
          <Input label="Last Name" value={form.lastName} onChange={(v) => setForm((p) => ({ ...p, lastName: v }))} />
          <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
        </div>

        <button
          onClick={createClient}
          disabled={!canCreate || saving}
          className="mt-5 h-11 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create Client Profile"}
        </button>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-black text-[#111827]">Client List</h2>
        {loading ? (
          <ClientsTableSkeleton />
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No clients added yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 pr-4">First Name</th>
                  <th className="py-3 pr-4">Last Name</th>
                  <th className="py-3 pr-4">Email</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 text-sm text-gray-700">
                    <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{item.firstName}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{item.lastName}</td>
                    <td className="py-3 pr-4">{item.email}</td>
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

function ClientsTableSkeleton() {
  return (
    <div className="mt-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 rounded-xl bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
      />
    </div>
  );
}
