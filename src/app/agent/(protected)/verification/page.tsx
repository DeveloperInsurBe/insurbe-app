"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type VerificationForm = {
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

const initialState: VerificationForm = {
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

export default function AgentVerificationPage() {
  const [form, setForm] = useState<VerificationForm>(initialState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await fetch("/api/agent/profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (active) setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load verification details");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const checklist = useMemo(
    () => [
      { label: "License Number", ok: Boolean(form.licenseNumber.trim()) },
      { label: "License Authority", ok: Boolean(form.licenseAuthority.trim()) },
      {
        label: "Business Registration Number",
        ok: Boolean(form.businessRegistrationNo.trim()),
      },
      { label: "Agreement Accepted", ok: Boolean(form.agreementAccepted) },
    ],
    [form],
  );

  const canSubmit = checklist.every((item) => item.ok);

  const update = (name: keyof VerificationForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value as never }));
  };

  const save = async (status: "draft" | "submitted") => {
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        verificationStatus: status,
      };
      const res = await fetch("/api/agent/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save verification");
      setForm((prev) => ({ ...prev, verificationStatus: status }));
      toast.success(status === "submitted" ? "Verification submitted" : "Draft saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <VerificationSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Agent Workflow
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">
          License / Business Verification
        </h1>
        <p className="mt-2 text-sm text-[#667085]">
          Submit German insurance agent compliance details for approval.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 inline-flex items-center rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-semibold text-[#820ad1]">
          Status: {form.verificationStatus}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="License Number" value={form.licenseNumber} onChange={(v) => update("licenseNumber", v)} />
          <Input label="License Authority" value={form.licenseAuthority} onChange={(v) => update("licenseAuthority", v)} />
          <Input
            label="Business Registration No."
            value={form.businessRegistrationNo}
            onChange={(v) => update("businessRegistrationNo", v)}
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={form.agreementAccepted}
            onChange={(e) => update("agreementAccepted", e.target.checked)}
            className="h-4 w-4 accent-[#820ad1]"
          />
          I accept the agent agreement and compliance declaration.
        </label>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Checklist</p>
          <div className="mt-3 space-y-2">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.label}</span>
                <span className={item.ok ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                  {item.ok ? "Complete" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => save("draft")}
            disabled={submitting}
            className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save Draft
          </button>

          <button
            onClick={() => save("submitted")}
            disabled={submitting || !canSubmit}
            className="h-11 rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit For Approval
          </button>
        </div>
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

function VerificationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <div className="h-3 w-28 rounded bg-[#f3e8ff]" />
        <div className="mt-3 h-9 w-96 max-w-full rounded bg-gray-100" />
        <div className="mt-3 h-4 w-[30rem] max-w-full rounded bg-gray-100" />
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-sm md:p-6">
        <div className="h-7 w-28 rounded-full bg-[#f3e8ff]" />

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
        </div>

        <div className="mt-5 h-5 w-80 max-w-full rounded bg-gray-100" />

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <div className="h-11 w-32 rounded-xl bg-gray-100" />
          <div className="h-11 w-40 rounded-xl bg-[#ead7ff]" />
        </div>
      </div>
    </div>
  );
}
