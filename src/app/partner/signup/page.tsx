"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PlaneTakeoff,
} from "lucide-react";

export default function PartnerSignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: "",
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/partner/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/partner/login");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5fb] px-4 py-10">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-100px] w-[320px] h-[320px] rounded-full bg-[#820ad1]/10 blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-100px] w-[320px] h-[320px] rounded-full bg-[#a855f7]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/40 bg-white shadow-[0_20px_80px_rgba(130,10,209,0.08)] lg:grid-cols-2">
          
          {/* LEFT SIDE */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#820ad1] via-[#9333ea] to-[#6d28d9] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
                <PlaneTakeoff className="h-4 w-4" />
                Become an InsurBe Partner
              </div>

              <h1 className="max-w-md text-5xl font-black leading-tight">
                Grow Your Business With InsurBe
              </h1>

              <p className="mt-6 max-w-lg text-lg text-white/80 leading-relaxed">
                Join our global partner ecosystem and start earning commissions
                by referring students to premium insurance solutions.
              </p>
            </div>

            <div className="relative z-10 space-y-5">
              {[
                "Earn commission on successful referrals",
                "Dedicated partner dashboard access",
                "Marketing assets & tracking tools",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm"
                >
                  <ShieldCheck className="h-5 w-5 text-white" />

                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white p-6 sm:p-10 lg:p-14">
            
            <div className="mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                Partner Signup
              </h2>

              <p className="mt-3 text-gray-500">
                Create your partner account and access the InsurBe portal.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* COMPANY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Company Name
                </label>

                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                    required
                  />
                </div>
              </div>

              {/* TITLE + FIRST NAME */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Title
                  </label>

                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    First Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* LAST NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Last Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                    required
                  />
                </div>
              </div>

              {/* PASSWORDS */}
              <div className="grid gap-5 sm:grid-cols-2">
                
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#820ad1] font-semibold text-white transition-all hover:scale-[1.01] hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Create Partner Account

                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* FOOTER */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have a partner account?{" "}
              <span
                onClick={() => router.push("/partner/login")}
                className="cursor-pointer font-semibold text-[#820ad1] hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}