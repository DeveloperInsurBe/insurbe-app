"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type AccountType = "partner" | "agent";
type PartnerTypeOption =
  | "institution_referral_partner"
  | "insurance_agent_broker";

export default function PartnerAccessSignupPage() {
  const router = useRouter();
  const initialType = useMemo<AccountType>(() => "partner", []);

  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [partnerType, setPartnerType] = useState<PartnerTypeOption>(
    initialType === "partner"
      ? "institution_referral_partner"
      : "insurance_agent_broker",
  );
  const [formData, setFormData] = useState({
    companyName: "",
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const type = new URLSearchParams(window.location.search).get("type");
    if (type === "agent") {
      setType("insurance_agent_broker");
    } else {
      setType("institution_referral_partner");
    }
  }, []);

  const setType = (nextType: PartnerTypeOption) => {
    setPartnerType(nextType);
    setAccountType(
      nextType === "institution_referral_partner" ? "partner" : "agent",
    );
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isPartner = accountType === "partner";
      const endpoint = isPartner ? "/api/partner/signup" : "/api/agent/signup";
      const payload = isPartner
        ? {
            companyName: formData.companyName,
            title: formData.title,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            partnerType,
          }
        : {
            companyName: formData.companyName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            brokerType: partnerType,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message || "Signup failed";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      toast.success("Account created successfully. Please login.");
      router.push(`/partner-access/login?type=${accountType}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      toast.error("Something went wrong");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const isInstitutionFlow = partnerType === "institution_referral_partner";
  const accent = isInstitutionFlow
    ? {
        text: "text-[#820ad1]",
        bg: "bg-[#820ad1]",
        bgSoft: "bg-[#820ad1]/10",
        border: "border-[#820ad1]",
        ring: "focus:ring-[#820ad1]/10",
      }
    : {
        text: "text-[#0f8a5f]",
        bg: "bg-[#0f8a5f]",
        bgSoft: "bg-[#0f8a5f]/10",
        border: "border-[#0f8a5f]",
        ring: "focus:ring-[#0f8a5f]/10",
      };

  return (
    <div className="min-h-screen bg-[#f7f5fb] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className={`text-xs font-bold uppercase tracking-[2px] ${accent.text}`}>
          Partner Access
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">
          {isInstitutionFlow ? "Partner Signup" : "Agent Signup"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {isInstitutionFlow
            ? "Institution / referral partner onboarding"
            : "Insurance agent / broker onboarding"}
        </p>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Select Partner Type
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setType("institution_referral_partner")}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
              partnerType === "institution_referral_partner"
                ? "border-[#820ad1] bg-[#820ad1]/10 text-[#820ad1]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Institution / Referral Partner
          </button>

          <button
            type="button"
            onClick={() => setType("insurance_agent_broker")}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
              partnerType === "insurance_agent_broker"
                ? "border-[#0f8a5f] bg-[#0f8a5f]/10 text-[#0f8a5f]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Insurance Agent / Broker Agent
          </button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Company Name
            </label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          {accountType === "partner" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
                required
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              First Name
            </label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Last Name
            </label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`h-12 w-full rounded-xl text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isInstitutionFlow
                  ? "bg-[#820ad1] hover:bg-[#6f08b2]"
                  : "bg-[#0f8a5f] hover:bg-[#0d744f]"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href={`/partner-access/login?type=${accountType}`}
            className={`font-semibold hover:underline ${accent.text}`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
