"use client";

import { useEffect, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";

export default function PartnerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    router.prefetch("/partner/dashboard");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);
    let loginSuccess = false;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        const message = "Invalid email or password";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      const session = await getSession();

      if (!session?.user || session.user.role !== "partner") {
        await signOut({ redirect: false });
        const message = "This account is not a partner account";
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      loginSuccess = true;
      router.replace("/partner/dashboard");

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      if (!loginSuccess) {
        setLoading(false);
      }
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
                <Sparkles className="h-4 w-4" />
                Welcome Back Partner
              </div>

              <h1 className="max-w-md text-5xl font-black leading-tight">
                Access Your Partner Portal
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
                Track referrals, monitor conversions, access marketing assets,
                and manage your InsurBe partnership all in one place.
              </p>
            </div>

            <div className="relative z-10 space-y-5">
              {[
                {
                  icon: Users,
                  text: "Manage referrals & student conversions",
                },
                {
                  icon: BarChart3,
                  text: "Track earnings and performance insights",
                },
                {
                  icon: ShieldCheck,
                  text: "Secure partner dashboard access",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm"
                  >
                    <Icon className="h-5 w-5 text-white" />

                    <p className="text-sm font-medium">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white p-6 sm:p-10 lg:p-14">

            <div className="mb-8">
              <h2 className="text-4xl font-black text-gray-900">
                Partner Login
              </h2>

              <p className="mt-3 text-gray-500">
                Login to continue to your InsurBe partner dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-[#820ad1] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#820ad1] font-semibold text-white transition-all hover:scale-[1.01] hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    Login To Dashboard

                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* FOOTER */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have a partner account?{" "}
              <span
                onClick={() => router.push("/partner/signup")}
                className="cursor-pointer font-semibold text-[#820ad1] hover:underline"
              >
                Create Account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
