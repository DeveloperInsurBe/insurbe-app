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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const normalizedEmail = formData.email.trim().toLowerCase();
      const endpoint = isPartner ? "/api/partner/signup" : "/api/agent/signup";
      const payload = isPartner
        ? {
            companyName: formData.companyName,
            title: formData.title,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            partnerType,
          }
        : {
            companyName: formData.companyName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
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
            className={`cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
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
            className={`cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
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
              placeholder="Enter company name"
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
              placeholder="Enter first name"
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
              placeholder="Enter last name"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.75A1.75 1.75 0 0 1 4.75 6h14.5A1.75 1.75 0 0 1 21 7.75v8.5A1.75 1.75 0 0 1 19.25 18H4.75A1.75 1.75 0 0 1 3 16.25v-8.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 7 7.65 6.12a1.35 1.35 0 0 0 1.7 0L20.5 7" />
              </svg>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                required
                placeholder="Enter your email address"
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect x="5" y="10" width="14" height="10" rx="2" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                required
                placeholder="Create a password"
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-11 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700"
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9c4.86 0 8.35 3.02 9.73 6.1a1 1 0 0 1 0 .8 11.27 11.27 0 0 1-4.1 4.7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.62A11.31 11.31 0 0 0 2.27 11a1 1 0 0 0 0 .8c1.38 3.08 4.87 6.1 9.73 6.1 1.03 0 2.01-.13 2.93-.37" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.27 11a1 1 0 0 0 0 .8c1.38 3.08 4.87 6.1 9.73 6.1s8.35-3.02 9.73-6.1a1 1 0 0 0 0-.8C20.35 7.92 16.86 4.9 12 4.9S3.65 7.92 2.27 11Z" />
                    <circle cx="12" cy="11.4" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect x="5" y="10" width="14" height="10" rx="2" />
              </svg>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                required
                placeholder="Re-enter your password"
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-11 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 transition-colors hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9c4.86 0 8.35 3.02 9.73 6.1a1 1 0 0 1 0 .8 11.27 11.27 0 0 1-4.1 4.7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.62A11.31 11.31 0 0 0 2.27 11a1 1 0 0 0 0 .8c1.38 3.08 4.87 6.1 9.73 6.1 1.03 0 2.01-.13 2.93-.37" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.27 11a1 1 0 0 0 0 .8c1.38 3.08 4.87 6.1 9.73 6.1s8.35-3.02 9.73-6.1a1 1 0 0 0 0-.8C20.35 7.92 16.86 4.9 12 4.9S3.65 7.92 2.27 11Z" />
                    <circle cx="12" cy="11.4" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`h-12 w-full cursor-pointer rounded-xl text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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
