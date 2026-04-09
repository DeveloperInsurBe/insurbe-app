"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationStepper from "@/app/components/privateApplications/ApplicationStepper";
import { useApplicationStore } from "@/app/stores/applicationStore";

// ── Types ─────────────────────────────────────────────────────────────────────
type Form = Record<string, any>;
type Screen = "steps" | "employer-warning" | "summary";

function normalizeYesNo(value: any): "Yes" | "No" | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const normalized = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "ja"].includes(normalized)) return "Yes";
  if (["no", "n", "false", "nein"].includes(normalized)) return "No";

  return undefined;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getNextMonths(count: number): { label: string; value: string }[] {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const result = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    result.push({
      label: `1st ${months[d.getMonth()]} ${d.getFullYear()}`,
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
    });
  }
  return result;
}

const COVERAGE_MONTHS = getNextMonths(5);

// ── SummaryRow ────────────────────────────────────────────────────────────────
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

// ── Employer warning screen ───────────────────────────────────────────────────
function EmployerWarningScreen({
  onContinue,
  onContact,
}: {
  onContinue: () => void;
  onContact: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-xl shadow-black/[0.06] overflow-hidden"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
      <div className="px-7 py-8">
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
          Your employer already signed you up with public health insurance
        </h2>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
          Your employer has 6 weeks after your employment start date to sign you
          up for public health insurance. You have to be insured by now and
          should contact your employer for more details about your health
          insurance.
          <br />
          <br />
          If you want to cancel your public insurance going forward and switch
          to private, you can continue the sign-up below.
        </p>
        <div className="space-y-3">
          <motion.button
            onClick={onContinue}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600  text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow"
          >
            Continue sign-up
          </motion.button>
          <motion.button
            onClick={onContact}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl border border-black/[0.08] text-slate-600 text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            Contact us
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Info note component ───────────────────────────────────────────────────────
function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
      <svg
        className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs text-blue-700 font-light leading-relaxed">
        {children}
      </p>
    </div>
  );
}

// ── Soft capture note ─────────────────────────────────────────────────────────
function SoftCaptureNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mt-4">
      <svg
        className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs text-amber-700 font-light leading-relaxed">
        {children}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InsurancePage() {
  const { id } = useParams();
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("steps");
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const application = useApplicationStore((s) => s.application);
  const setApplication = useApplicationStore((s) => s.setApplication);
  const updateStep = useApplicationStore((s) => s.updateStep);

  const buildSteps = (f: Form): string[] => {
    const germanInsurance12m = normalizeYesNo(f.germanInsurance12m);
    const permanentContract = normalizeYesNo(f.permanentContract);
    const s: string[] = ["germanInsurance12m"];

    if (germanInsurance12m === "Yes") {
      s.push("initialProviderName");
    }

    if (germanInsurance12m === "No") {
      s.push("permanentContract");
      if (permanentContract === "No") {
        s.push("proofOfInsurance");
        s.push("otherInsurance12m");
      }
    }

    // Original insurance history questions
    s.push("recentInsurance");

    const ins = f.recentInsurance;
    const isNoneTravelExpat = [
      "None",
      "Travel health insurance",
      "Expat/incoming insurance",
    ].includes(ins);
    const isPublicOrPrivate =
      ins === "Public insurance" || ins === "Private insurance";

    if (isNoneTravelExpat) return s;

    if (isPublicOrPrivate) {
      s.push("germanProvider");
      if (f.germanProvider === "No") return s;

      if (f.germanProvider === "Yes") {
        s.push("insuranceEndDate");
        s.push("coverageStart");
        if (ins === "Public insurance") {
          s.push("providerName");
        }
      }
    }

    s.push("alwaysInsured");
    s.push("livingInGermany");
    return s;
  };

  const steps = buildSteps(form);
  const [stepKey, setStepKey] = useState("germanInsurance12m");
  const stepIndex = steps.indexOf(stepKey);
  const totalSteps = steps.length;
  const progress = Math.round(
    ((Math.max(stepIndex, 0) + 1) / Math.max(totalSteps, 1)) * 100,
  );

  useEffect(() => {
    if (!application?.insuranceHistory) return;

    const insuranceHistory = application.insuranceHistory as Form;
    setForm({
      ...insuranceHistory,
      germanInsurance12m:
        normalizeYesNo(insuranceHistory.germanInsurance12m) ||
        insuranceHistory.germanInsurance12m,
      permanentContract:
        normalizeYesNo(insuranceHistory.permanentContract) ||
        insuranceHistory.permanentContract,
      proofOfInsurance:
        normalizeYesNo(insuranceHistory.proofOfInsurance) ||
        insuranceHistory.proofOfInsurance,
    });
  }, [application]);

  const getStepError = (step: string, form: Form): string | null => {
    switch (step) {
      case "germanInsurance12m":
        return normalizeYesNo(form.germanInsurance12m)
          ? null
          : "Please select an option.";

      case "initialProviderName":
        return form.initialProviderName?.trim()
          ? null
          : "Please enter your provider name.";

      case "permanentContract":
        return normalizeYesNo(form.permanentContract)
          ? null
          : "Please select an option.";

      case "otherInsurance12m":
        return form.otherInsurance12m?.trim()
          ? null
          : "Please describe your previous insurance.";

      case "proofOfInsurance":
        return normalizeYesNo(form.proofOfInsurance)
          ? null
          : "Please select an option.";

      case "recentInsurance":
        return form.recentInsurance ? null : "Please select an option.";

      case "germanProvider":
        return form.germanProvider ? null : "Please select an option.";

      case "insuranceEndDate":
        if (!form.insuranceEndDate) {
          return "Please enter a date or select 'It's still active'.";
        }
        if (form.insuranceEndDate !== "still-active") {
          if (!form.endDay || !form.endMonth || !form.endYear) {
            return "Please fill all date fields.";
          }
        }
        return null;

      case "coverageStart":
        return form.coverageStart
          ? null
          : "Please select a coverage start date.";

      case "alwaysInsured":
        return form.alwaysInsured ? null : "Please select an option.";

      case "livingInGermany":
        return form.livingInGermany ? null : "Please select an option.";

      default:
        return null;
    }
  };

  const handleChange = (name: string, value: any) => {
    const normalizedValue =
      name === "germanInsurance12m" ||
      name === "permanentContract" ||
      name === "proofOfInsurance"
        ? normalizeYesNo(value) || value
        : value;

    const updated = { ...form, [name]: normalizedValue };

    if (name === "germanInsurance12m") {
      const normalized = normalizeYesNo(value);
      delete updated.initialProviderName;
      delete updated.permanentContract;
      delete updated.proofOfInsurance;
      delete updated.otherInsurance12m;
      delete updated.jobContractRequired;
      delete updated.proofDocumentRequired;
      delete updated.appointmentRequired;

      if (normalized === "No") {
        delete updated.providerName;
      }
    }

    if (name === "permanentContract") {
      const normalized = normalizeYesNo(value);
      if (normalized === "Yes") {
        delete updated.proofOfInsurance;
        delete updated.otherInsurance12m;
        delete updated.proofDocumentRequired;
        delete updated.appointmentRequired;
      }
      if (normalized === "No") {
        delete updated.jobContractRequired;
      }
    }

    setForm(updated);

    // ✅ mark touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // ✅ LIVE VALIDATION (based on current step)
    // const stepError = getStepError(stepKey, updated);
    // setError(stepError);

    setTimeout(() => {
      updateStep("insuranceHistory", updated);
    }, 0);
  };

  useEffect(() => {
    if (!id || !form) return;

    const timeout = setTimeout(async () => {
      try {
        await fetch(`/api/application/${id}/insurance`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [form]);

  const goNext = () => {
    const newSteps = buildSteps(form);
    const idx = newSteps.indexOf(stepKey);
    if (idx < newSteps.length - 1) {
      setStepKey(newSteps[idx + 1]);
    } else {
      setScreen("summary");
    }
  };

  const goBack = () => {
    const idx = steps.indexOf(stepKey);
    if (idx > 0) {
      setStepKey(steps[idx - 1]);
      setError(null);
    }
  };

  const handleNext = () => {
    setError(null);

    // ── New questions ──────────────────────────────────────────────────────
    if (stepKey === "germanInsurance12m") {
      if (!normalizeYesNo(form.germanInsurance12m)) {
        setError("Please select an option.");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "initialProviderName") {
      if (!form.initialProviderName?.trim()) {
        setError("Please enter your provider name.");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "permanentContract") {
      const permanentContract = normalizeYesNo(form.permanentContract);
      if (!permanentContract) {
        setError("Please select an option.");
        return;
      }

      if (permanentContract === "Yes") {
        handleChange("jobContractRequired", true); // ask upload later
      }

      goNext();
      return;
    }

    if (stepKey === "otherInsurance12m") {
      if (!form.otherInsurance12m?.trim()) {
        setError("Please describe your previous insurance.");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "proofOfInsurance") {
      const proofOfInsurance = normalizeYesNo(form.proofOfInsurance);
      if (!proofOfInsurance) {
        setError("Please select an option.");
        return;
      }

      if (proofOfInsurance === "Yes") {
        handleChange("appointmentRequired", false);
        handleChange("proofDocumentRequired", true); // ask upload later
      } else {
        handleChange("proofDocumentRequired", false);
        handleChange("appointmentRequired", true); // appointment at the end
      }

      goNext();
      return;
    }

    // ── Original questions ─────────────────────────────────────────────────
    if (stepKey === "recentInsurance") {
      if (!form.recentInsurance) {
        setError("Please select an option.");
        return;
      }
      const ins = form.recentInsurance;
      if (
        [
          "None",
          "Travel health insurance",
          "Expat/incoming insurance",
        ].includes(ins)
      ) {
        setScreen("employer-warning");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "germanProvider") {
      if (!form.germanProvider) {
        setError("Please select an option.");
        return;
      }
      if (form.germanProvider === "No") {
        setScreen("employer-warning");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "insuranceEndDate") {
      if (!form.insuranceEndDate) {
        setError("Please enter a date or select 'It's still active'.");
        return;
      }
      if (form.insuranceEndDate !== "still-active") {
        if (!form.endDay || !form.endMonth || !form.endYear) {
          setError("Please fill all date fields.");
          return;
        }
      }
      goNext();
      return;
    }

    if (stepKey === "coverageStart") {
      if (!form.coverageStart) {
        setError("Please select a coverage start date.");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "providerName") {
      goNext();
      return;
    }

    if (stepKey === "alwaysInsured") {
      if (!form.alwaysInsured) {
        setError("Please select an option.");
        return;
      }
      goNext();
      return;
    }

    if (stepKey === "livingInGermany") {
      if (!form.livingInGermany) {
        setError("Please select an option.");
        return;
      }
      setScreen("summary");
      return;
    }

    goNext();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/application/${id}/insurance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let updated = null;

      try {
        updated = await res.json();
      } catch {
        console.warn("No JSON response");
      }

      if (updated) {
        setApplication(updated);
      }

      if (form.appointmentRequired) {
        router.push("/book-appointment");
        return;
      }

      router.push(`/application/${id}/health`);
    } catch (err) {
      console.error("❌ Error saving", err);
      setLoading(false);
    }
  };

  const coverageLabel =
    COVERAGE_MONTHS.find((m) => m.value === form.coverageStart)?.label ||
    form.coverageStart ||
    "";

  // ── EMPLOYER WARNING ──────────────────────────────────────────────────────
  if (screen === "employer-warning") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 relative overflow-hidden">
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="max-w-xl mx-auto relative z-10">
          <ApplicationStepper currentStep="insuranceHistory" />
          <div className="mt-6">
            <EmployerWarningScreen
              onContinue={() => {
                setScreen("steps");
                goNext();
              }}
              onContact={() => router.push("/contact")}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  if (screen === "summary") {
    const rows = [
      {
        label: "German insurance (12 months)",
        value: form.germanInsurance12m || "",
        key: "germanInsurance12m",
      },
      ...(form.initialProviderName
        ? [
            {
              label: "Provider (past 12 months)",
              value: form.initialProviderName || "",
              key: "initialProviderName",
            },
          ]
        : []),
      ...(form.permanentContract !== undefined
        ? [
            {
              label: "Permanent job contract",
              value: form.permanentContract || "",
              key: "permanentContract",
            },
          ]
        : []),
      ...(form.otherInsurance12m
        ? [
            {
              label: "Other insurance (12 months)",
              value: form.otherInsurance12m || "",
              key: "otherInsurance12m",
            },
          ]
        : []),
      ...(form.proofOfInsurance
        ? [
            {
              label: "Proof of insurance",
              value: form.proofOfInsurance || "",
              key: "proofOfInsurance",
            },
          ]
        : []),
      {
        label: "Most recent insurance",
        value: form.recentInsurance || "",
        key: "recentInsurance",
      },
      ...(form.germanProvider !== undefined
        ? [
            {
              label: "German health provider",
              value: form.germanProvider || "",
              key: "germanProvider",
            },
          ]
        : []),
      ...(form.insuranceEndDate
        ? [
            {
              label: "Insurance end date",
              value:
                form.insuranceEndDate === "still-active"
                  ? "Still active"
                  : form.endDay
                    ? `${form.endYear}-${String(form.endMonth).padStart(2, "0")}-${String(form.endDay).padStart(2, "0")}`
                    : "",
              key: "insuranceEndDate",
            },
          ]
        : []),
      ...(form.coverageStart
        ? [
            {
              label: "Coverage start",
              value: coverageLabel,
              key: "coverageStart",
            },
          ]
        : []),
      ...(form.providerName !== undefined
        ? [
            {
              label: "Provider name",
              value: form.providerName || "I don't know",
              key: "providerName",
            },
          ]
        : []),
      ...(form.alwaysInsured
        ? [
            {
              label: "Always insured since 2025",
              value: form.alwaysInsured || "",
              key: "alwaysInsured",
            },
          ]
        : []),
      ...(form.livingInGermany
        ? [
            {
              label: "Living in Germany",
              value: form.livingInGermany || "",
              key: "livingInGermany",
            },
          ]
        : []),
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
          <ApplicationStepper currentStep="insuranceHistory" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <p className="text-sm text-slate-500 font-light mb-5">
              Review or edit the information you have provided so far.
            </p>

            {/* Proof required banner */}
            {form.proofDocumentRequired && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4"
              >
                <svg
                  className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-amber-700 font-light leading-relaxed">
                  <span className="font-semibold">
                    Proof of insurance required.
                  </span>{" "}
                  You'll be asked to upload proof of your previous insurance
                  during the document collection stage.
                </p>
              </motion.div>
            )}

            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-sm shadow-black/[0.04] overflow-hidden mb-5">
              {rows.map((row, i) => (
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
                      setScreen("steps");
                      setStepKey(row.key);
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
              </span>
              .
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
                className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-150"
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mt-6"
            >
              <button
                onClick={() => {
                  setScreen("steps");
                  setStepKey(steps[steps.length - 1]);
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
                <div className="h-full w-full bg-violet-700 rounded-full" />
              </div>
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                {rows.length}/{rows.length}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const getInputClasses = (field: string) => {
    const hasError = error && touched[field];

    return `w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
      hasError
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "border-black/[0.08] focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10"
    }`;
  };

  // ── STEP VIEW ─────────────────────────────────────────────────────────────
  const renderStep = () => {
    // ── NEW: Q1 — German insurance in past 12 months ──
    if (stepKey === "germanInsurance12m") {
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Have you had health insurance in the past 12 months?
          </h1>
          <InfoNote>
            Please do not include Mawista, Dr. Walter, or Care Concept.
          </InfoNote>
          <div className="space-y-2">
            {["Yes", "No"].map((opt) => {
              const sel = normalizeYesNo(form.germanInsurance12m) === opt;
              return (
                <motion.button
                  key={opt}
                  onClick={() => handleChange("germanInsurance12m", opt)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    // ── NEW: Q2 (if Q1 = Yes) — Provider ──
    if (stepKey === "initialProviderName") {
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            Which provider?
          </h1>
          <input
            type="text"
            placeholder="Provider name"
            value={form.initialProviderName || ""}
            onChange={(e) =>
              handleChange("initialProviderName", e.target.value)
            }
            className={getInputClasses("initialProviderName")}
          />
        </>
      );
    }

    // ── NEW: Q2 — Permanent job contract ──
    if (stepKey === "permanentContract") {
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            Do you have a permanent job contract?
          </h1>
          <div className="space-y-2">
            {["Yes", "No"].map((opt) => {
              const sel = normalizeYesNo(form.permanentContract) === opt;
              return (
                <motion.button
                  key={opt}
                  onClick={() => {
                    handleChange("permanentContract", opt);
                    setTouched((prev) => ({
                      ...prev,
                      permanentContract: true,
                    }));
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    // ── NEW: Q3 — Other insurance in past 12 months ──
    if (stepKey === "otherInsurance12m") {
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            What other insurance have you had in the past 12 months?
          </h1>
          <p className="text-sm text-slate-400 font-light mb-5">
            Please describe the type of insurance you had previously.
          </p>
          <textarea
            placeholder="e.g. Travel insurance, Mawista student plan, NHS coverage in the UK…"
            value={form.otherInsurance12m || ""}
            onChange={(e) => handleChange("otherInsurance12m", e.target.value)}
            rows={3}
            className={getInputClasses("otherInsurance12m") + " resize-none"}
          />
        </>
      );
    }

    // ── NEW: Q4 — Proof of insurance (soft capture) ──
    if (stepKey === "proofOfInsurance") {
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Do you have proof of previous insurance?
          </h1>
          <p className="text-sm text-slate-400 font-light mb-4">
            This could be a membership certificate, confirmation letter, or any
            document from your previous insurer.
          </p>
          <div className="space-y-2">
            {["Yes", "No"].map((opt) => {
              const sel = normalizeYesNo(form.proofOfInsurance) === opt;
              return (
                <motion.button
                  key={opt}
                  onClick={() => {
                    handleChange("proofOfInsurance", opt);
                    setTouched((prev) => ({ ...prev, proofOfInsurance: true }));
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <SoftCaptureNote>
            {normalizeYesNo(form.proofOfInsurance) === "Yes"
              ? "You'll be asked to upload this document in the document collection stage."
              : "Don't worry — you can still continue. If proof is available later, you'll be able to upload it in the document collection stage."}
          </SoftCaptureNote>
        </>
      );
    }

    // ── Q1 (original): Recent insurance ──
    if (stepKey === "recentInsurance") {
      const opts = [
        {
          value: "Public insurance",
          desc: "Including state healthcare systems (e.g. NHS, Medicare)",
        },
        { value: "Expat/incoming insurance", desc: "" },
        { value: "Travel health insurance", desc: "" },
        { value: "Private insurance", desc: "" },
        { value: "None", desc: "" },
      ];
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            What was your most recent health insurance?
          </h1>
          <div className="space-y-2">
            {opts.map(({ value, desc }) => {
              const sel = form.recentInsurance === value;
              return (
                <motion.button
                  key={value}
                  onClick={() => {
                    handleChange("recentInsurance", value);
                    setTouched((prev) => ({ ...prev, recentInsurance: true }));
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-start gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20 hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                    >
                      {value}
                    </p>
                    {desc && (
                      <p className="text-xs text-slate-400 font-light mt-0.5">
                        {desc}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    // ── German provider ──
    if (stepKey === "germanProvider") {
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            Is that insurance with a German health provider?
          </h1>
          <div className="space-y-2">
            {["Yes", "No"].map((opt) => {
              const sel = form.germanProvider === opt;
              return (
                <motion.button
                  key={opt}
                  onClick={() => {
                    handleChange("germanProvider", opt);
                    setTouched((prev) => ({ ...prev, germanProvider: true }));
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    // ── Insurance end date ──
    if (stepKey === "insuranceEndDate") {
      const stillActive = form.insuranceEndDate === "still-active";
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            When did your last health insurance end?
          </h1>
          <div className="mb-5" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { field: "endDay", label: "Day", placeholder: "DD" },
              { field: "endMonth", label: "Month", placeholder: "MM" },
              { field: "endYear", label: "Year", placeholder: "YYYY" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">
                  {label}
                </label>
                <input
                  type="number"
                  placeholder={placeholder}
                  value={stillActive ? "" : form[field] || ""}
                  disabled={stillActive}
                  onChange={(e) => {
                    handleChange("insuranceEndDate", "manual");
                    handleChange(field, e.target.value);
                  }}
                  className={getInputClasses(field) + " text-center"}
                />
              </div>
            ))}
          </div>
          <motion.button
            onClick={() => {
              handleChange(
                "insuranceEndDate",
                stillActive ? null : "still-active",
              );
              handleChange("endDay", "");
              handleChange("endMonth", "");
              handleChange("endYear", "");
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${stillActive ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${stillActive ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
            >
              {stillActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${stillActive ? "text-slate-900" : "text-slate-600"}`}
            >
              It's still active
            </span>
          </motion.button>
        </>
      );
    }

    // ── Coverage start ──
    if (stepKey === "coverageStart") {
      const stillActive = form.insuranceEndDate === "still-active";
      const isPublic = form.recentInsurance === "Public insurance";
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            When would you like your coverage to begin?
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
            {isPublic && stillActive
              ? "Public health insurance has a cancellation period of 2 full calendar months. If you have not canceled it yet, select a start date that is at least 2 full months from now. We'll reach out to help with the cancellation process. If you're not sure, don't worry — we can adjust the date later."
              : "The coverage has to start on the 1st day of the month."}
          </p>
          <div className="space-y-2">
            {COVERAGE_MONTHS.map((month) => {
              const sel = form.coverageStart === month.value;
              return (
                <motion.button
                  key={month.value}
                  onClick={() => handleChange("coverageStart", month.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {month.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    // ── Provider name ──
    if (stepKey === "providerName") {
      const dontKnow = form.providerName === "i-dont-know";
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            What was the name of your most recent provider?
          </h1>
          <input
            type="text"
            placeholder="Provider name"
            value={dontKnow ? "" : form.providerName || ""}
            disabled={dontKnow}
            onChange={(e) => handleChange("providerName", e.target.value)}
            className={
              getInputClasses("providerName") + " mb-3 disabled:opacity-40"
            }
          />
          <motion.button
            onClick={() =>
              handleChange("providerName", dontKnow ? "" : "i-dont-know")
            }
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${dontKnow ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${dontKnow ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
            >
              {dontKnow && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${dontKnow ? "text-slate-900" : "text-slate-600"}`}
            >
              I don't know
            </span>
          </motion.button>
        </>
      );
    }

    // ── Always insured ──
    if (stepKey === "alwaysInsured") {
      const today = new Date();
      const oneYearAgo = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate(),
      );
      const dateStr = oneYearAgo.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            Have you been health insured at all times since {dateStr}?
          </h1>
          <div className="space-y-2">
            {["Yes", "No"].map((opt) => {
              const sel = form.alwaysInsured === opt;
              return (
                <motion.button
                  key={opt}
                  onClick={() => {
                    handleChange("alwaysInsured", opt);
                    setTouched((prev) => ({ ...prev, alwaysInsured: true }));
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    // ── Living in Germany ──
    if (stepKey === "livingInGermany") {
      const startDate = form.coverageStart
        ? new Date(form.coverageStart).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "the coverage start date";
      return (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            Will you be living in Germany on {startDate}?
          </h1>
          <div className="space-y-2">
            {["Yes", "No"].map((opt) => {
              const sel = form.livingInGermany === opt;
              return (
                <motion.button
                  key={opt}
                  onClick={() => {
                    handleChange("livingInGermany", opt);
                    setTouched((prev) => ({ ...prev, livingInGermany: true }));
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
                  >
                    {sel && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${sel ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 relative overflow-hidden">
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
        <ApplicationStepper currentStep="insuranceHistory" />

        {/* Progress */}
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
            key={stepKey}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-xl shadow-black/[0.06] p-7"
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setScreen("summary")}
                className="text-xs font-semibold cursor-pointer text-violet-600 hover:text-violet-700 transition"
              >
                Review →
              </button>
            </div>

            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
                Insurance History · {stepIndex + 1}/{totalSteps}
              </span>
            </div>

            {renderStep()}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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

            <div className="mt-6 flex gap-3">
              {stepIndex > 0 && (
                <motion.button
                  onClick={goBack}
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600  text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow flex items-center justify-center gap-2"
              >
                Continue
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
