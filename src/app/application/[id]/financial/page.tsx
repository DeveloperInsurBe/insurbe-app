"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationStepper from "@/app/components/privateApplications/ApplicationStepper";
import { useApplicationStore } from "@/app/stores/applicationStore";
import { useJourneyStore } from "@/app/stores/journeyStore";

// ── Types ────────────────────────────────────────────────────────────────────
type Form = Record<string, any>;

// ── Validation ───────────────────────────────────────────────────────────────
function validateStep(stepIndex: number, form: Form): string | null {
  switch (stepIndex) {
    case 0:
      if (!form.employmentStatus)
        return "Please select your employment status.";
      return null;
    case 1:
      if (!form.jobTitle?.trim()) return "Job title is required.";
      return null;
    case 2:
      if (!form.employerName?.trim()) return "Employer name is required.";
      return null;
    case 3:
      if (!form.startDay || !form.startMonth || !form.startYear)
        return "Please enter your employment start date.";
      if (
        isNaN(Number(form.startDay)) ||
        Number(form.startDay) < 1 ||
        Number(form.startDay) > 31
      )
        return "Invalid day.";
      if (
        isNaN(Number(form.startMonth)) ||
        Number(form.startMonth) < 1 ||
        Number(form.startMonth) > 12
      )
        return "Invalid month.";
      if (
        isNaN(Number(form.startYear)) ||
        Number(form.startYear) < 1950 ||
        Number(form.startYear) > new Date().getFullYear() + 5
      )
        return "Invalid year.";
      return null;
    case 4:
      return null; // work contract — optional (provide later)
    case 5:
      if (!form.annualIncome?.toString().trim())
        return "Please enter your annual income.";
      if (isNaN(Number(form.annualIncome)) || Number(form.annualIncome) < 0)
        return "Enter a valid income.";
      return null;
    case 6:
      if (!form.employedOutsideGermany) return "Please select an option.";
      return null;
    case 7:
      if (!form.hasGermanTaxId) return "Please select an option.";
      return null;
    case 8:
      if (form.hasGermanTaxId === "Yes" && !form.germanTaxIdNumber?.trim()) {
        return "Please enter your German Tax ID.";
      }
      return null;

    case 9:
      if (!form.taxIdAccepted) return "Please accept the terms to continue.";
      return null;
    default:
      return null;
  }
}

// ── SummaryRow ───────────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <motion.button
      onClick={onEdit}
      whileHover={{ backgroundColor: "rgba(139,92,246,0.03)" }}
      whileTap={{ scale: 0.995 }}
      className="w-full text-left flex items-center justify-between px-4 py-4 border-b border-slate-100 last:border-0 group transition-colors duration-150"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm text-slate-900 font-medium truncate">
          {value || (
            <span className="text-slate-400 italic text-sm font-normal">
              Not provided
            </span>
          )}
        </p>
      </div>
      <svg
        className="w-4 h-4 text-slate-300 group-hover:text-violet-400 flex-shrink-0 ml-3 transition-colors duration-150"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </motion.button>
  );
}

// ── Ineligible screen ─────────────────────────────────────────────────────────
function IneligibleScreen({
  status,
  onBack,
}: {
  status: string;
  onBack: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-xl shadow-black/[0.06] overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />

          <div className="px-7 py-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-3">
              We're sorry…
            </h2>
            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
              We are working hard to make sure everyone can be covered, but, at
              the moment, you are not eligible for private health insurance as a{" "}
              <span className="font-medium text-slate-700">
                {status.toLowerCase()}
              </span>
              . We'd like to help you get another health insurance. As your
              eligibility for different types of insurances depends on quite a
              few factors, we would suggest that you use our{" "}
              <span className="text-violet-600 font-medium underline underline-offset-2 cursor-pointer">
                Recommendation Tool
              </span>{" "}
              to help you figure out which health insurance options are best for
              you based on your situation.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/book-appointment")}
                className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-semibold"
              >
                Book appointment
              </button>

              <button onClick={onBack} className="w-full py-3 text-slate-500">
                ← Go back
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FinancialPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);
  const [showTaxInfo, setShowTaxInfo] = useState(false);
  const [showSchufaInfo, setShowSchufaInfo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const INELIGIBLE = ["free-lance", "not working"];
  const application = useApplicationStore((s) => s.application);
  const setApplication = useApplicationStore((s) => s.setApplication);
  const updateStep = useApplicationStore((s) => s.updateStep);
  const journeyEmployment = useJourneyStore((s) => s.employmentStatus);
  const questions = [
    {
      key: "employmentStatus",
      title: "What is your employment status?",
      type: "radio",
      options: ["employee", "self-employed", "free-lance", "not working"],
    },
    {
      key: "jobTitle",
      title: "What is your job title?",
      type: "text",
      placeholder: "Job title",
    },
    {
      key: "employerName",
      title: "What is the name of your employer?",
      type: "text",
      placeholder: "Employer name",
    },
    {
      key: "startDate",
      title: "What is the start date of your employment contract?",
      type: "date",
    },
    {
      key: "documents",
      title:
        form.employmentStatus === "self-employed"
          ? "Please upload your last 3 months bank statements"
          : "Please upload a signed copy of your work contract",

      type: "file",

      hint:
        form.employmentStatus === "self-employed"
          ? "Since you are self-employed, we require your last 3 months bank statements."
          : "Since you are employed we require a signed copy of the employment contract from your employer.",

      provideLater: true,
    },
    {
      key: "annualIncome",
      title: "What is your annual income in Euros before taxes?",
      type: "currency",
      placeholder: "Annual Income",
    },
    {
      key: "employedOutsideGermany",
      title: "Are you employed outside of Germany?",
      type: "yesno",
    },
    {
      key: "hasGermanTaxId",
      title: "Do you have a German tax ID?",
      type: "yesno",
      info: "taxId",
    },
    {
      key: "germanTaxIdNumber",
      title: "Please enter your German Tax ID",
      type: "text",
      placeholder: "e.g. 12345678901",
    },
    {
      key: "taxIdAccepted",
      title: "Consent & Tax ID Agreement",
      type: "consent",
    },
  ] as const;

  const totalSteps = questions.length;
  const current = questions[stepIndex] as any;
  useEffect(() => {
    if (
      questions[stepIndex]?.key === "germanTaxIdNumber" &&
      form.hasGermanTaxId !== "Yes"
    ) {
      setStepIndex((prev) => prev + 1);
    }
  }, [stepIndex, form.hasGermanTaxId]);

  const isLast = stepIndex === totalSteps - 1;
  const progress = Math.round((stepIndex / totalSteps) * 100);

  const handleChange = (name: string, value: any) => {
    const updated = { ...form, [name]: value };

    setForm(updated);
    localStorage.setItem("financialForm", JSON.stringify(updated)); // ✅ ADD
    setError(null);

    // mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    updateStep("financialHistory", updated);
  };

  useEffect(() => {
    if (!id || Object.keys(form).length === 0) return;

    const timeout = setTimeout(async () => {
      try {
        await fetch(`/api/application/${id}/financial`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [form, id]);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      handleChange("documents", {
        name: file.name,
        size: file.size,
        base64: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    const err = validateStep(stepIndex, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    // Check ineligibility after step 0
    if (stepIndex === 0) {
      if (INELIGIBLE.includes(form.employmentStatus)) {
        setShowIneligible(true);
        return;
      }
    }
    // New income‑based ineligibility (only after answering income on step 5)
    if (stepIndex === 5) {
      const income = Number(form.annualIncome);
      if (!isNaN(income) && income < 30000) {
        setShowIneligible(true);
        return;
      }
    }

    if (isLast) {
      setShowSummary(true);
    } else {
      setStepIndex((p) => p + 1);
    }
  };

  const handleProvideLater = () => {
    setError(null);
    if (isLast) setShowSummary(true);
    else setStepIndex((p) => p + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/application/${id}/financial`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const updated = await res.json();

      // ✅ sync Zustand
      setApplication(updated);
      localStorage.removeItem("financialForm");
      router.push(`/application/${id}/insurance`);
    } catch (err) {
      console.error("❌ Error saving", err);
      setLoading(false);
    }
  };

  // ── Ineligible screen ──────────────────────────────────────────────────────

  const steps = [
    "employmentStatus",
    "jobTitle",
    "employerName",
    "startDay",
    "workContract",
    "annualIncome",
    "employedOutsideGermany",
    "hasGermanTaxId",
    "germanTaxIdNumber",
  ];

  const mapJourneyToFinancial = (val: string) => {
    if (!val) return "";

    const v = val.toLowerCase().trim();

    if (v.includes("self")) return "self-employed";
    if (v.includes("employ")) return "employee";
    if (v.includes("free")) return "free-lance";

    return "not working";
  };
  useEffect(() => {
    let finalData: any = {};

    // 1. Zustand
    if (
      application?.financialHistory &&
      Object.keys(application.financialHistory).length > 0
    ) {
      finalData = application.financialHistory;
    }

    // 2. localStorage fallback
    else {
      const saved = localStorage.getItem("financialForm");
      if (saved) {
        finalData = JSON.parse(saved);
      }
    }

    // 3. Always ensure employmentStatus from journey if missing
    const journeyMapped = mapJourneyToFinancial(journeyEmployment);

    setForm((prev: any) => ({
      ...prev,
      ...finalData,
      employmentStatus:
        finalData?.employmentStatus ||
        journeyMapped ||
        prev?.employmentStatus ||
        "",
    }));
  }, [application, journeyEmployment]);

  // ── Summary screen ─────────────────────────────────────────────────────────
  if (showSummary) {
    const summaryRows = [
      {
        label: "Employment status",
        value: form.employmentStatus || "",
        step: 0,
      },
      { label: "Job title", value: form.jobTitle || "", step: 1 },
      { label: "Employer name", value: form.employerName || "", step: 2 },
      {
        label: "Employment start date",
        value:
          form.startDay && form.startMonth && form.startYear
            ? `${form.startYear}-${String(form.startMonth).padStart(2, "0")}-${String(form.startDay).padStart(2, "0")}`
            : "",
        step: 3,
      },
      {
        label: "Copy of work contract",
        value: form.documents?.name || "Provided separately",
        step: 4,
      },
      {
        label: "Income",
        value: form.annualIncome
          ? `€${Number(form.annualIncome).toLocaleString()}`
          : "",
        step: 5,
      },
      {
        label: "Employed outside Germany",
        value:
          form.employedOutsideGermany === "Yes"
            ? "Yes"
            : form.employedOutsideGermany === "No"
              ? "No"
              : "",
        step: 6,
      },
      {
        label: "Has German tax ID?",
        value:
          form.hasGermanTaxId === "Yes"
            ? "Yes"
            : form.hasGermanTaxId === "No"
              ? "No"
              : "",
        step: 7,
      },
    ];

    const handleDownloadPDF = () => {
      const link = document.createElement("a");
      link.href = "/pdfs/vvg-info.pdf"; // 👈 your PDF path
      link.download = "VVG_Section_19_Info.pdf"; // file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-xl mx-auto px-4 py-8 relative z-10">
          <ApplicationStepper currentStep="financialHistory" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <p className="text-sm text-slate-500 font-light mb-5">
              Review or edit the information you have provided so far.
            </p>

            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-sm shadow-black/[0.04] overflow-hidden mb-5">
              {summaryRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <SummaryRow
                    label={row.label}
                    value={row.value}
                    onEdit={() => {
                      setShowSummary(false);
                      setStepIndex(row.step);
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-slate-400 font-light leading-relaxed mb-6 px-0.5"
            >
              By selecting "Continue", I confirm to have answered all questions
              truthfully. Knowingly omitting any relevant details entitles the
              insurer to cancel the contract—either retroactively or from the
              date the omission is discovered—or change the contract in
              accordance with{" "}
              <span
                onClick={handleDownloadPDF}
                className="text-violet-600 underline underline-offset-2 cursor-pointer hover:text-violet-700"
              >
                § 19 Abs. 5 VVG (Information on the consequences of the
                violation of the disclosure obligation)
              </span>{" "}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={!loading ? { y: -2, scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-800 text-white text-sm font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-150"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Continue"
                )}
              </motion.button>
            </motion.div>

            {/* Bottom progress strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mt-6"
            >
              <button
                onClick={() => {
                  setShowSummary(false);
                  setStepIndex(totalSteps - 1);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 p-1"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-full bg-slate-700 rounded-full" />
              </div>
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                {totalSteps}/{totalSteps}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const getInputClasses = (field: string) => {
    const hasError = error && touched[field];

    return `w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 ${
      hasError
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "border-black/[0.08] focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10"
    }`;
  };
  // ── Step view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 relative overflow-hidden">
      {showIneligible ? (
        <IneligibleScreen
          status={form.employmentStatus}
          onBack={() => {
            setShowIneligible(false);
            setStepIndex(0);
          }}
        />
      ) : (
        <>
          <motion.div
            className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px] pointer-events-none"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 12, repeat: Infinity, delay: 3 }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="max-w-xl mx-auto relative z-10">
            <ApplicationStepper currentStep="financialHistory" />

            {/* Progress bar */}
            <div className="mt-6 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400">
                  Question {stepIndex + 1} of {totalSteps}
                </span>
                <span className="text-xs font-semibold text-violet-600">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-xl shadow-black/[0.06] p-7"
              >
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setShowSummary(true)}
                    className="text-xs font-semibold cursor-pointer text-violet-600 hover:text-violet-700 transition"
                  >
                    Review →
                  </button>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                  <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
                    Financial Info · {stepIndex + 1}/{totalSteps}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
                  {current.title}
                </h1>
                {current.hint && (
                  <p className="text-sm text-slate-400 font-light mb-5 leading-relaxed">
                    {current.hint}
                  </p>
                )}
                {!current.hint && <div className="mb-5" />}

                {/* ── RADIO ── */}
                {current.type === "radio" && (
                  <div className="space-y-2">
                    {current.options?.map((opt: string) => {
                      const selected = form[current.key] === opt;
                      return (
                        <motion.button
                          key={opt}
                          onClick={() => {
                            handleChange(current.key, opt);

                            // 🚨 INELIGIBLE CHECK (IMMEDIATE)
                            if (current.key === "employmentStatus") {
                              if (INELIGIBLE.includes(opt)) {
                                setTimeout(() => {
                                  setShowIneligible(true);
                                }, 100); // slight delay to avoid state race
                              }
                            }
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${selected ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20 hover:bg-slate-50"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${selected ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                          >
                            {selected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${selected ? "text-slate-900" : "text-slate-600"}`}
                          >
                            {opt}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* ── TEXT ── */}
                {current.type === "text" && (
                  <input
                    type="text"
                    placeholder={current.placeholder}
                    value={form[current.key] || ""}
                    onChange={(e) => handleChange(current.key, e.target.value)}
                    className={getInputClasses(current.key)}
                  />
                )}

                {/* ── CURRENCY ── */}
                {current.type === "currency" && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                      €
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder={current.placeholder}
                      value={form[current.key] || ""}
                      onChange={(e) =>
                        handleChange(current.key, e.target.value)
                      }
                      className={getInputClasses(current.key) + " pl-8"}
                    />
                  </div>
                )}

                {/* ── DATE ── */}
                {current.type === "date" && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { field: "startDay", label: "Day", placeholder: "DD" },
                      {
                        field: "startMonth",
                        label: "Month",
                        placeholder: "MM",
                      },
                      {
                        field: "startYear",
                        label: "Year",
                        placeholder: "YYYY",
                      },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field}>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">
                          {label}
                        </label>
                        <input
                          type="number"
                          placeholder={placeholder}
                          value={form[field] || ""}
                          onChange={(e) => handleChange(field, e.target.value)}
                          className={getInputClasses(field) + " text-center"}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── FILE UPLOAD ── */}
                {current.type === "file" && (
                  <div>
                    <motion.div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleFileChange(e.dataTransfer.files);
                      }}
                      animate={
                        dragOver
                          ? {
                              borderColor: "rgba(139,92,246,0.6)",
                              backgroundColor: "rgba(139,92,246,0.04)",
                              scale: 1.01,
                            }
                          : {
                              borderColor: "rgba(0,0,0,0.08)",
                              backgroundColor: "rgba(248,250,252,1)",
                              scale: 1,
                            }
                      }
                      transition={{ duration: 0.2 }}
                      className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer text-center"
                    >
                      <motion.div
                        animate={
                          dragOver ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center"
                      >
                        <svg
                          className="w-5 h-5 text-violet-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                      {form.documents ? (
                        <div>
                          <p className="text-sm font-semibold text-violet-700">
                            {form.documents.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {(form.documents.size / 1024).toFixed(1)} KB · Click
                            to replace
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            {dragOver
                              ? "Drop file here"
                              : "Choose file or drag & drop"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Supports images, videos and documents
                          </p>
                        </div>
                      )}
                    </motion.div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                  </div>
                )}

                {/* ── YES/NO ── */}
                {current.type === "yesno" && (
                  <div className="space-y-2">
                    {["Yes", "No"].map((opt) => {
                      const selected = form[current.key] === opt;
                      return (
                        <motion.button
                          key={opt}
                          onClick={() => {
                            handleChange(current.key, opt);
                            setTouched((prev) => ({
                              ...prev,
                              [current.key]: true,
                            }));
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${selected ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20 hover:bg-slate-50"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                          >
                            {selected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${selected ? "text-slate-900" : "text-slate-600"}`}
                          >
                            {opt}
                          </span>
                        </motion.button>
                      );
                    })}

                    {/* Tax ID info toggle */}
                    {current.info === "taxId" && (
                      <div className="mt-2">
                        <button
                          onClick={() => setShowTaxInfo((p) => !p)}
                          className="text-xs text-violet-600 underline underline-offset-2 hover:text-violet-700"
                        >
                          {showTaxInfo ? "Hide info ↑" : "What is a tax ID? ↓"}
                        </button>
                        <AnimatePresence>
                          {showTaxInfo && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed space-y-2">
                                <p>
                                  <strong className="text-slate-700">
                                    Tax ID (Steuer-ID):
                                  </strong>{" "}
                                  A unique number automatically assigned to you
                                  when you first register in Germany. It is not
                                  the same as your tax number (Steuernummer).
                                </p>
                                <p className="font-medium text-slate-600">
                                  Why do we need your tax ID?
                                </p>
                                <ul className="space-y-1.5 list-disc list-inside">
                                  <li>
                                    The insurer requires your tax ID to transmit
                                    data to the tax authorities. As of 01.01.26,
                                    insurers are legally obligated to
                                    electronically transmit employer-subsidized
                                    contributions to the Federal Central Tax
                                    Office.
                                  </li>
                                  <li>
                                    The insurer also reports tax-deductible
                                    contributions to health and long-term care
                                    insurance to the tax authorities for your
                                    income tax assessment.
                                  </li>
                                  <li>
                                    If you do not provide your tax ID, the
                                    insurer is entitled to request it from the
                                    Federal Central Tax Office.
                                  </li>
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CONSENT ── */}
                {current.type === "consent" && (
                  <div className="space-y-4">
                    {/* Schufa consent */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Consent to submit Schufa
                      </p>
                      <p className="text-xs text-slate-500 font-light leading-relaxed mb-3">
                        By selecting "I accept", I consent to the exchange of
                        data with Schufa in accordance with the{" "}
                        <span
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = "/pdfs/schufa.pdf";
                            link.download = "Schufa-information.pdf";
                            link.click();
                          }}
                          className="text-violet-600 underline underline-offset-2 cursor-pointer"
                        >
                          Schufa information
                        </span>
                        .
                      </p>

                      <motion.button
                        onClick={() =>
                          handleChange("taxIdAccepted", !form.taxIdAccepted)
                        }
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all duration-150 ${form.taxIdAccepted ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-white hover:border-black/20"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${form.taxIdAccepted ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                        >
                          {form.taxIdAccepted && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${form.taxIdAccepted ? "text-violet-800" : "text-slate-600"}`}
                        >
                          I accept the terms above
                        </span>
                      </motion.button>
                    </div>

                    {/* What is Schufa toggle */}
                    <div>
                      <button
                        onClick={() => setShowSchufaInfo((p) => !p)}
                        className="text-xs text-violet-600 underline underline-offset-2 hover:text-violet-700"
                      >
                        {showSchufaInfo ? "Hide ↑" : "What is Schufa? ↓"}
                      </button>
                      <AnimatePresence>
                        {showSchufaInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
                              <p>
                                <strong className="text-slate-700">
                                  Schufa
                                </strong>{" "}
                                is a credit bureau. Based on data from banks and
                                other institutions, it assesses your
                                creditworthiness.
                              </p>
                              <p className="mt-2">
                                <strong className="text-slate-600">
                                  Why it is used for your health insurance:
                                </strong>{" "}
                                The risk carrier needs to check whether the
                                monthly costs of the health insurance will be
                                covered by their customers, so they can offer a
                                safe and stable product.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* ── ERROR ── */}
                <AnimatePresence>
                  {error && Object.keys(touched).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                    >
                      <svg
                        className="w-4 h-4 mt-[2px]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── ACTIONS ── */}
                <div className="mt-6 flex gap-3">
                  {stepIndex > 0 && (
                    <motion.button
                      onClick={() => {
                        setStepIndex((p) => p - 1);
                        setError(null);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-3 rounded-xl border border-black/[0.08] text-slate-600 text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                      ←
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow flex items-center justify-center gap-2"
                  >
                    {isLast ? "Review & Continue" : "Continue"}
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </div>

                {/* Provide later */}
                {current.provideLater && (
                  <button
                    onClick={handleProvideLater}
                    className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
                  >
                    Provide later →
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
