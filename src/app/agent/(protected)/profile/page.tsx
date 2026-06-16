"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProfilePayload = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  brokerType: string;
  countryCode: string;
  phone: string;
  licenseNumber: string;
  licenseAuthority: string;
  businessRegistrationNo: string;
  verificationStatus: string;
  agreementAccepted: boolean;
};

const initialForm: ProfilePayload = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  brokerType: "",
  countryCode: "+49",
  phone: "",
  licenseNumber: "",
  licenseAuthority: "",
  businessRegistrationNo: "",
  verificationStatus: "draft",
  agreementAccepted: false,
};

export default function AgentProfilePage() {
  const [form, setForm] = useState<ProfilePayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const res = await fetch("/api/agent/profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");
        if (active) setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load agent profile");
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const setValue = (name: keyof ProfilePayload, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value as never }));
  };

  const save = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/agent/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      toast.success("Agent profile saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Agent Workflow
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">Agent Profile</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Create and maintain your insurance agent / broker profile.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="First Name" value={form.firstName} onChange={(v) => setValue("firstName", v)} />
          <Input label="Last Name" value={form.lastName} onChange={(v) => setValue("lastName", v)} />
          <Input label="Company Name" value={form.companyName} onChange={(v) => setValue("companyName", v)} />
          <Input label="Email" value={form.email} onChange={(v) => setValue("email", v)} disabled />
          <Input label="Broker Type" value={form.brokerType} onChange={(v) => setValue("brokerType", v)} placeholder="Insurance Agent / Broker" />
          <Input label="Country Code" value={form.countryCode} onChange={(v) => setValue("countryCode", v)} />
          <Input label="Phone" value={form.phone} onChange={(v) => setValue("phone", v)} />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 h-11 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}

