"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Home,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Clock3,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const appId = searchParams.get("appId");

  const provider =
    searchParams.get("provider") || "Insurance";

  const email =
    searchParams.get("email") ||
    "your registered email";

  const providerNames: Record<string, string> = {
    tk: "TK Health Insurance",
    dak: "DAK Health Insurance",
    aok: "AOK Insurance",
  };

  const providerName =
    providerNames[provider.toLowerCase()] ||
    provider;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ff] px-4 py-6 sm:px-6 lg:px-8">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-[260px] h-[260px] bg-purple-300/20 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-fuchsia-300/20 blur-3xl rounded-full" />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-6xl"
        >
          <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(124,58,237,0.12)] backdrop-blur-xl">
            {/* HERO */}
            <div className="relative overflow-hidden bg-primary px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* LEFT */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white text-xs sm:text-sm font-medium mb-5">
                    <CheckCircle2 className="w-4 h-4" />
                    Application Submitted Successfully
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-3xl">
                    Your Insurance Application is Under Review
                  </h1>

                  <p className="mt-4 text-sm sm:text-base text-purple-100 leading-7 max-w-2xl">
                    Thank you for choosing{" "}
                    <span className="font-semibold text-white">
                      InsurBe
                    </span>
                    . Our team has received your application and will process it within 24 hours.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 min-w-[150px]">
                      <p className="text-xs text-purple-100 mb-1">
                        Processing Time
                      </p>

                      <p className="text-white font-semibold">
                        Within 24 Hours
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 min-w-[150px]">
                      <p className="text-xs text-purple-100 mb-1">
                        Provider
                      </p>

                      <p className="text-white font-semibold">
                        {providerName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ICON */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* PROVIDER */}
                <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-[#faf5ff] to-[#f5f3ff] p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-7 h-7 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Insurance Provider
                      </p>

                      <h3 className="text-xl font-bold text-gray-900">
                        {providerName}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                      <Mail className="w-7 h-7 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-gray-500 mb-1">
                        Confirmation Email
                      </p>

                      <p className="text-sm text-gray-600 leading-6 break-all">
                        A confirmation email has been sent to{" "}
                        <span className="font-semibold text-primary">
                          {email}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* APP ID */}
              {appId && (
                <div className="mb-6 rounded-3xl border border-dashed border-purple-300 bg-[#fcfaff] p-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Application Reference ID
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-primary break-all">
                    {appId}
                  </h2>
                </div>
              )}

              {/* NOTE */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 flex items-start gap-3 mb-7">
                <Clock3 className="w-5 h-5 text-primary mt-0.5 shrink-0" />

                <p className="text-sm text-gray-700 leading-7">
                  You can track your application progress anytime through your dashboard.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-[#9333ea] px-6 py-4 text-white font-semibold"
                >
                  <div className="flex items-center justify-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    View Dashboard
                  </div>
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="flex-1 rounded-2xl border border-purple-200 bg-white px-6 py-4 text-gray-900 font-semibold"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Home className="w-5 h-5" />
                    Go Home
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}