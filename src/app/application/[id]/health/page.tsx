"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationStepper from "@/app/components/privateApplications/ApplicationStepper";
import { useApplicationStore } from "@/app/stores/applicationStore";

type Form = Record<string, any>;
type Screen =
  | "steps"
  | "book-appointment"
  | "summary"
  | "complete"
  | "post-summary";

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
        className="w-4 h-4 text-slate-300 group-hover:text-violet-400 flex-shrink-0 ml-3 transition-colors"
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

// ── Consent card ──────────────────────────────────────────────────────────────
function ConsentCard({
  part,
  accepted,
  onToggle,
}: {
  part: 1 | 2;
  accepted: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
      <p className="text-xs text-slate-500 font-light leading-relaxed mb-3">
        {part === 1
          ? `By selecting "Continue", I agree my health data may be processed, transferred, and used by Feather and the underwriting provider Hallesche Krankenversicherung a.G. according to their health data protection policies. I agree to the terms about the release from confidentiality to both Feather and Hallesche Krankenversicherung a.G. My health data may be collected, stored, and shared with third parties only where absolutely necessary.`
          : `By selecting "Continue", I confirm and understand according to § 19 Abs. 5 VVG (insurance law) it is important to answer the next set of questions truthfully and not to leave out any information. I understand omitting any relevant detail shall leave the insurer entitled to rescind the contract retroactively. I have taken note of the information regarding disclosure obligations.`}
      </p>
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all duration-150 ${accepted ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-white hover:border-black/20"}`}
      >
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${accepted ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
        >
          {accepted && (
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
          className={`text-sm font-medium ${accepted ? "text-violet-800" : "text-slate-600"}`}
        >
          I have read and agree to the terms above
        </span>
      </motion.button>
    </div>
  );
}

// ── Compact Yes/No (inline label + two buttons) ───────────────────────────────
function YesNoQuestion({
  questionKey,
  label,
  value,
  onChange,
  subtitle,
}: {
  questionKey: string;
  label: string;
  value: string;
  onChange: (k: string, v: string) => void;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-semibold text-slate-800 mb-1 leading-snug">
        {label}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-400 font-light leading-relaxed mb-2">
          {subtitle}
        </p>
      )}
      <div className="flex gap-2">
        {["Yes", "No"].map((opt) => {
          const sel = value === opt;
          return (
            <motion.button
              key={opt}
              onClick={() => {
                onChange(questionKey, opt);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all duration-150 text-sm font-semibold ${sel ? "border-violet-400/60 bg-violet-50 text-slate-900" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20 text-slate-500"}`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
              >
                {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Book appointment screen ───────────────────────────────────────────────────
function BookAppointmentScreen({ onBack }: { onBack: () => void }) {
  const router = useRouter();
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
          A medical review is required
        </h2>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
          Based on your answer, we need to review your medical history with a
          specialist before we can continue with your application. Please book
          an appointment with our team so we can help you find the best
          coverage.
        </p>
        <div className="space-y-3">
          <motion.button
            onClick={() => router.push("/book-appointment")}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow"
          >
            Book Appointment
          </motion.button>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── GROUPED STEP DEFINITIONS  (20 questions → 11 steps)
// ════════════════════════════════════════════════════════════════════════════
const GROUPED_STEPS = [
  // 0 — Consent 1
  {
    key: "step_consent1",
    title: "Before we continue… (1 of 2)",
    type: "consent1",
  },
  // 1 — Consent 2
  {
    key: "step_consent2",
    title: "Before we continue… (2 of 2)",
    type: "consent2",
  },
  // 2 — Height + Weight
  {
    key: "step_measurements",
    title: "Your measurements",
    type: "measurements",
    fields: [
      { key: "height", label: "Height", placeholder: "e.g. 175", unit: "cm" },
      { key: "weight", label: "Weight", placeholder: "e.g. 72", unit: "kg" },
    ],
  },
  // 3 — Out-patient + In-patient
  {
    key: "step_patient",
    title: "Recent medical visits",
    type: "multi-yesno",
    questions: [
      {
        key: "outpatient3y",
        label:
          "Have out-patient examinations or treatments been carried out during the last 3 years?",
        subtitle:
          "Including medical check-ups, treatments by doctors, non-medical practitioners or other persons.",
        redirectOnYes: true,
      },
      {
        key: "inpatient5y",
        label:
          "Did in-patient examinations, treatments or operations take place within the last 5 years?",
        redirectOnYes: true,
      },
    ],
  },
  // 4 — Psychotherapy + Sterility
  {
    key: "step_psycho_sterility",
    title: "Mental health & fertility",
    type: "multi-yesno",
    questions: [
      {
        key: "psychotherapy10y",
        label:
          "Has a psychotherapy been recommended or carried out in the last 10 years, or is one intended?",
        redirectOnYes: true,
      },
      {
        key: "sterility3y",
        label:
          "During the last 3 years have you had examinations or treatment due to sterility or an unfulfilled wish for a child?",
        subtitle: "To be answered by male and female applicants.",
        redirectOnYes: true,
      },
    ],
  },
  // 5 — Planned treatment + Untreated disease
  {
    key: "step_planned_untreated",
    title: "Planned & untreated conditions",
    type: "multi-yesno",
    questions: [
      {
        key: "plannedTreatment",
        label:
          "Is an out-patient or in-patient examination, treatment or operation necessary, intended or recommended?",
        redirectOnYes: true,
      },
      {
        key: "untreatedDisease",
        label:
          "Have you suffered from any disease, complaint or addiction not treated in the last 3 years?",
        subtitle:
          "Including physical or psychological faults, or need of care during the last 3 years.",
        redirectOnYes: true,
      },
    ],
  },
  // 6 — Chronic disease + HIV
  {
    key: "step_chronic_hiv",
    title: "Chronic conditions & HIV",
    type: "multi-yesno",
    questions: [
      {
        key: "chronicDisease",
        label:
          "Do chronic diseases, permanent/recurring complaints, organic or physical faults, body implants or prostheses exist?",
        subtitle:
          "Including maxillodental abnormalities, breast implants, artificial joints, etc.",
        redirectOnYes: true,
      },
      {
        key: "hiv",
        label: "Have you ever been diagnosed with HIV (e.g. by an AIDS test)?",
        redirectOnYes: true,
      },
    ],
  },
  // 7 — Handicap + Regular medication
  {
    key: "step_handicap_meds",
    title: "Disability & medication",
    type: "multi-yesno",
    questions: [
      {
        key: "handicap",
        label: "Do you have a recognized handicap?",
        subtitle:
          "If yes, please have ready a copy of the recognition certificate (German GdB).",
        redirectOnYes: true,
      },
      {
        key: "regularMedication",
        label:
          "Have you taken or do you take medicaments regularly during the last 3 years?",
        subtitle: "Including medications taken for prevention.",
        redirectOnYes: true,
      },
    ],
  },
  // 8 — Spectacles (solo — needs sub-fields)
  {
    key: "step_spectacles",
    title: "Vision & eyewear",
    type: "spectacles",
    subtitle:
      "Please state dioptres from +8/–8 onwards. A monthly surcharge may apply depending on your tariff.",
  },
  // 9 — Dental (3 questions)
  {
    key: "step_dental",
    title: "Dental health",
    type: "multi-yesno",
    questions: [
      {
        key: "dentalExam3y",
        label:
          "Have you had dental examinations or treatment during the last 3 years?",
        subtitle: "Including dental check-ups.",
        redirectOnYes: false,
      },
      {
        key: "dentalOngoing",
        label:
          "Are you in dental treatment at the moment, or is treatment for dental regulation, periodontosis or dentures necessary or intended?",
        redirectOnYes: false,
      },
      {
        key: "gumDisease",
        label:
          "Does a gum disease (e.g. periodontosis, periodontitis) or an anomalous position of the teeth or jaw exist?",
        redirectOnYes: false,
      },
    ],
  },
  // 10 — Missing teeth + Dentures
  {
    key: "step_teeth",
    title: "Missing teeth & dentures",
    type: "multi-yesno-count",
    questions: [
      {
        key: "missingTeeth",
        label:
          "Are any teeth (except wisdom teeth) missing and not yet replaced?",
        subtitle: "Only for persons 16 years of age and older.",
        countKey: "missingTeethCount",
        countLabel: "Number of missing teeth",
        redirectOnYes: false,
      },
      {
        key: "dentures",
        label:
          "Do you have dentures (replaced or crowned teeth, including implants, bridges, crowns and prostheses)?",
        subtitle:
          "For bridges, count all relevant teeth separately including anchor/pillar teeth.",
        countKey: "denturesCount",
        countLabel: "Number of teeth with dentures",
        redirectOnYes: false,
      },
    ],
  },
] as const;

const POST_STEPS = [
  { key: "documents", title: "Upload supporting documents", type: "documents" },
  {
    key: "signature",
    title: "Provide your digital signature",
    type: "signature",
  },
  { key: "sepa", title: "Set up your SEPA direct debit mandate", type: "sepa" },
] as const;

// ── Validate IBAN/BIC ──────────────────────────────────────────────────────────
const validateIBAN = (iban: string): boolean => {
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleanIBAN)) return false;
  if (cleanIBAN.startsWith("DE") && cleanIBAN.length !== 22) return false;
  return true;
};

const validateBIC = (bic: string): boolean => {
  const cleanBIC = bic.replace(/\s/g, "").toUpperCase();
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBIC);
};

// ════════════════════════════════════════════════════════════════════════════
export default function MedicalPage() {
  const { id } = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const hasInitialized = useRef(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [postStepIndex, setPostStepIndex] = useState(0);
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [screen, setScreen] = useState<Screen>("steps");
  const [dragOver, setDragOver] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // ── Loader / result state ───────────────────────────────────────────────
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0); // 0-3 = which row is "active"
  const [loaderDone, setLoaderDone] = useState(false);
  const [needsHealthCheck, setNeedsHealthCheck] = useState(false);

  const steps = GROUPED_STEPS;
  const totalSteps = steps.length; // 11
  const current = steps[stepIndex];
  const isLast = stepIndex === totalSteps - 1;
  const progress = Math.round((stepIndex / totalSteps) * 100);

  const updateStep = useApplicationStore((s) => s.updateStep);
  const application = useApplicationStore((s) => s.application);

  // init from store once
  useEffect(() => {
    if (!application?.healthAnswers || hasInitialized.current) return;
    setForm(application.healthAnswers || {});
    hasInitialized.current = true;
  }, [application]);

  // sync to store on every change
  useEffect(() => {
    if (!form || Object.keys(form).length === 0) return;
    updateStep("healthAnswers", form);
  }, [form]);

  // auto-save debounce
  useEffect(() => {
    if (!id || Object.keys(form).length === 0) return;
    const t = setTimeout(async () => {
      try {
        await fetch(`/api/application/${id}/health`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [form, id]);

  // ── Canvas helpers ──────────────────────────────────────────────────────
  const getCtx = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    Object.assign(ctx, {
      lineWidth: 2.5,
      lineCap: "round",
      lineJoin: "round",
      strokeStyle: "#1e293b",
    });
    return { canvas, ctx };
  };
  const getPos = (canvas: HTMLCanvasElement, cx: number, cy: number) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: (cx - r.left) * (canvas.width / r.width),
      y: (cy - r.top) * (canvas.height / r.height),
    };
  };
  const startDraw = (e: React.MouseEvent) => {
    isDrawing.current = true;
    const { canvas, ctx } = getCtx();
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const endDraw = () => {
    isDrawing.current = false;
    getCtx().ctx.beginPath();
  };
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const { canvas, ctx } = getCtx();
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTS = (e: TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const t = e.touches[0];
      const r = canvas.getBoundingClientRect();
      const x = (t.clientX - r.left) * (canvas.width / r.width);
      const y = (t.clientY - r.top) * (canvas.height / r.height);
      const ctx = canvas.getContext("2d")!;
      Object.assign(ctx, {
        lineWidth: 2.5,
        lineCap: "round",
        lineJoin: "round",
        strokeStyle: "#1e293b",
      });
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const onTM = (e: TouchEvent) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const t = e.touches[0];
      const r = canvas.getBoundingClientRect();
      const x = (t.clientX - r.left) * (canvas.width / r.width);
      const y = (t.clientY - r.top) * (canvas.height / r.height);
      const ctx = canvas.getContext("2d")!;
      Object.assign(ctx, {
        lineWidth: 2.5,
        lineCap: "round",
        lineJoin: "round",
        strokeStyle: "#1e293b",
      });
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      setHasDrawn(true);
    };
    const onTE = () => {
      isDrawing.current = false;
      canvas.getContext("2d")!.beginPath();
    };
    canvas.addEventListener("touchstart", onTS, { passive: false });
    canvas.addEventListener("touchmove", onTM, { passive: false });
    canvas.addEventListener("touchend", onTE, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTS);
      canvas.removeEventListener("touchmove", onTM);
      canvas.removeEventListener("touchend", onTE);
    };
  }, [screen, postStepIndex]);

  const clearCanvas = () => {
    const { canvas, ctx } = getCtx();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    handleChange("signature", null);
  };
  const captureSignature = () =>
    handleChange("signature", canvasRef.current!.toDataURL("image/png"));

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const uploaded = await Promise.all(
      Array.from(files).map(
        (f) =>
          new Promise<any>((res, rej) => {
            const r = new FileReader();
            r.onload = () =>
              res({ name: f.name, size: f.size, base64: r.result });
            r.onerror = rej;
            r.readAsDataURL(f);
          }),
      ),
    );
    handleChange("documents", [...(form.documents || []), ...uploaded]);
  };

  const handleChange = (name: string, value: any) => {
    const updated = { ...form, [name]: value };

    setForm(updated);

    // ✅ mark touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // ✅ LIVE VALIDATION
    const err = validateWithData(updated);
    setError(err);

    updateStep("healthAnswers", updated);
  };

  // ── Validate current grouped step ──────────────────────────────────────
  const validate = (): string | null => {
    const s = current as any;
    if (s.type === "consent1" && !form.consent1 && touched.consent1)
      return "Please accept the terms to continue.";
    if (s.type === "consent2" && !form.consent2)
      return "Please accept the terms to continue.";
    if (s.type === "measurements") {
      for (const f of s.fields) {
        if (!form[f.key]?.toString().trim())
          return `Please enter your ${f.label.toLowerCase()}.`;
        if (isNaN(Number(form[f.key])) || Number(form[f.key]) <= 0)
          return `Please enter a valid ${f.label.toLowerCase()}.`;
      }
    }
    if (s.type === "multi-yesno" || s.type === "multi-yesno-count") {
      for (const q of s.questions) {
        if (!form[q.key])
          return "Please answer all questions before continuing.";
        if (
          s.type === "multi-yesno-count" &&
          form[q.key] === "Yes" &&
          !form[q.countKey]?.toString().trim()
        )
          return `Please enter the ${q.countLabel.toLowerCase()}.`;
      }
    }
    if (s.type === "spectacles" && !form.spectacles)
      return "Please select an option.";
    return null;
  };

  const validateWithData = (data: Form): string | null => {
    const s = current as any;

    if (s.type === "consent1" && !data.consent1)
      return "Please accept the terms to continue.";

    if (s.type === "consent2" && !data.consent2)
      return "Please accept the terms to continue.";

    if (s.type === "measurements") {
      for (const f of s.fields) {
        if (!data[f.key]?.toString().trim())
          return `Please enter your ${f.label.toLowerCase()}.`;
        if (isNaN(Number(data[f.key])) || Number(data[f.key]) <= 0)
          return `Please enter a valid ${f.label.toLowerCase()}.`;
      }
    }

    if (s.type === "multi-yesno" || s.type === "multi-yesno-count") {
      for (const q of s.questions) {
        if (!data[q.key])
          return "Please answer all questions before continuing.";

        if (
          s.type === "multi-yesno-count" &&
          data[q.key] === "Yes" &&
          !data[q.countKey]?.toString().trim()
        )
          return `Please enter the ${q.countLabel.toLowerCase()}.`;
      }
    }

    if (s.type === "spectacles" && !data.spectacles)
      return "Please select an option.";

    return null;
  };

  const checkRedirect = (): boolean => {
    const s = current as any;
    if (s.type === "multi-yesno" || s.type === "multi-yesno-count") {
      return s.questions.some(
        (q: any) => q.redirectOnYes && form[q.key] === "Yes",
      );
    }
    return false;
  };

  const handleNext = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (checkRedirect()) {
      setScreen("book-appointment");
      return;
    }
    isLast ? setScreen("summary") : setStepIndex((p) => p + 1);
  };

  const validatePost = (): string | null => {
    const s = POST_STEPS[postStepIndex];
    if (s.type === "documents") {
      if (!form.documents || form.documents.length === 0) {
        return "Please upload pending document to continue.";
      }
    }
    if (s.type === "signature" && !form.signature && !hasDrawn)
      return "Please draw your signature before continuing.";
    if (s.type === "sepa") {
      if (!form.sepaName?.trim())
        return "Please enter your account holder name.";
      if (!form.sepaIban?.trim()) return "Please enter your IBAN.";
      if (!validateIBAN(form.sepaIban))
        return "Please enter a valid IBAN (e.g., DE89 3704 0044 0532 0130 00).";
      if (form.sepaBic?.trim() && !validateBIC(form.sepaBic))
        return "Please enter a valid BIC/SWIFT code (e.g., DEUTDEFF).";
      if (!form.sepaPaymentFrequency)
        return "Please select a payment frequency.";
      if (!form.sepaMandateAccepted)
        return "Please accept the SEPA mandate to continue.";
    }
    return null;
  };

  const handlePostNext = () => {
    const err = validatePost();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (POST_STEPS[postStepIndex].type === "signature" && hasDrawn)
      captureSignature();
    postStepIndex < POST_STEPS.length - 1
      ? setPostStepIndex((p) => p + 1)
      : handleSubmit();
  };

  const handleSubmit = async () => {
    // ── Show the animated loader immediately ──────────────────────────────
    setLoading(true);
    setShowLoader(true);
    setLoaderStep(0);
    setLoaderDone(false);
    setNeedsHealthCheck(false);

    // Helper: advance the loader row with a delay
    const advanceLoader = (step: number, ms: number) =>
      new Promise<void>((res) =>
        setTimeout(() => {
          setLoaderStep(step);
          res();
        }, ms),
      );

    try {
      const cleanForm = JSON.parse(JSON.stringify(form));

      // Row 0 "Reviewing answers" — fires immediately (already set above)
      await advanceLoader(1, 900); // move to row 1 after 900ms

      // ── Save health data ──────────────────────────────────────────────
      let healthRes = await fetch(`/api/application/${id}/health`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanForm),
      });
      if (!healthRes.ok) {
        console.warn("⚠️ Database cold start, retrying...");

        // show loader message instead of alert
        setLoaderStep(0); // stays on "Reviewing answers"

        await new Promise((r) => setTimeout(r, 2500));

        healthRes = await fetch(`/api/application/${id}/health`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanForm),
        });

        if (!healthRes.ok) {
         
          setError("Server is waking up… please try again in a moment.");
          setLoading(false);
          setShowLoader(false);
          return;
        }
      }

      await advanceLoader(2, 700); // "Analysing risk profile" → "Skipping the doctor's visit"

      // ── Complete application ──────────────────────────────────────────
      const completeRes = await fetch(`/api/application/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: form.signature || null }),
      });
      if (!completeRes.ok) throw new Error("Complete API failed");

      await advanceLoader(3, 600); // "Doing last checks"

      // ── Send acknowledgement email ────────────────────────────────────
      try {
        const appRes = await fetch(`/api/application/${id}`);
        const appData = await appRes.json();
        const userEmail =
          appData?.user?.email || appData?.personalDetails?.email || "";
        if (userEmail) {
          await fetch("/api/sendAcknowledgement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              name: userEmail.split("@")[0],
              orderId: appData?.orderId,
              formType: "private",
              pdfBase64: appData?.pdfBase64,
              filename: "Hallesche.pdf",
            }),
          });
          console.log("📧 Acknowledgement email sent to:", userEmail);
        }
      } catch (emailErr) {
        console.warn("⚠️ Email send failed (non-fatal):", emailErr);
      }

      // ── Determine if a health check warning should show ───────────────
      // Any redirectOnYes question answered Yes means a health check may be needed.
      // (In practice user wouldn't reach submit if redirected, but flag anyway.)
      const healthCheckFields = [
        "outpatient3y",
        "inpatient5y",
        "psychotherapy10y",
        "sterility3y",
        "plannedTreatment",
        "untreatedDisease",
        "chronicDisease",
        "hiv",
        "handicap",
        "regularMedication",
      ];
      const flagged = healthCheckFields.some((k) => cleanForm[k] === "Yes");
      setNeedsHealthCheck(flagged);

      // ── Finish loader ─────────────────────────────────────────────────
      await new Promise((r) => setTimeout(r, 500));
      setLoaderDone(true);
      sessionStorage.setItem("justCompleted", "1");

      // Auto-redirect after user sees result (3 s for success, stays for health-check until they click Continue)
      if (!flagged) {
        setTimeout(() => router.push("/dashboard"), 3000);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setLoading(false);
      setShowLoader(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // ── SUBMISSION LOADER / RESULT SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (showLoader) {
    const LOADER_ROWS = [
      { label: "Reviewing answers" },
      { label: "Analysing risk profile" },
      { label: "Skipping the doctor's visit" },
      { label: "Doing last checks" },
    ];

    // Before result is shown: animated "Checking your answers" view
    if (!loaderDone) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/50 to-purple-50/30 px-6">
          {/* Icon */}
          <div className="w-24 h-24 rounded-2xl bg-white border border-purple/[0.08] flex items-center justify-center mb-8 shadow-sm">
            <svg
              className="w-12 h-12 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-purple-700 mb-2 text-center">
            Checking your answers
          </h1>
          <p className="text-slate-500 text-base mb-12 text-center">
            We're reviewing your data to assess your eligibility
          </p>

          {/* Progress rows */}
          <div className="w-full max-w-lg space-y-6">
            {LOADER_ROWS.map((row, i) => {
              const isActive = i === loaderStep;
              const isComplete = i < loaderStep;
              return (
                <div key={row.label} className="flex items-center gap-6">
                  <span
                    className={`text-sm font-medium w-52 flex-shrink-0 transition-colors duration-300 ${isActive || isComplete ? "text-slate-800" : "text-slate-400"}`}
                  >
                    {row.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                    {isComplete && (
                      <div className="absolute inset-0 bg-slate-800 rounded-full" />
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-slate-800 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "92%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  {isActive && (
                    <svg
                      className="w-5 h-5 text-slate-500 animate-spin flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Result screen — success or health-check warning
    const rowColors = needsHealthCheck
      ? ["#6d28d9", "#7c3aed", "#f59e0b", "#a78bfa"]
      : ["#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa"];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-6">
        {/* Icon */}
        <div className="w-24 h-24 rounded-2xl bg-white border border-purple/[0.08] flex items-center justify-center mb-8 shadow-sm">
          {needsHealthCheck ? (
            <svg
              className="w-12 h-12 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01"
              />
            </svg>
          ) : (
            <svg
              className="w-12 h-12 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          )}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 mb-3 text-center"
        >
          {needsHealthCheck
            ? "You might need a health check"
            : "Application submitted!"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base mb-12 text-center max-w-md"
        >
          {needsHealthCheck
            ? "A doctor's visit might be required to evaluate your health condition. We'll be in touch after you submit your application."
            : "Your application is complete. We've sent a confirmation to your email. Redirecting to your dashboard…"}
        </motion.p>

        {/* Completed rows */}
        <div className="w-full max-w-lg space-y-6 mb-12">
          {LOADER_ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-6"
            >
              <span className="text-sm font-medium w-52 flex-shrink-0 text-slate-800">
                {row.label}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: "#e2e8f0" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: "100%", background: rowColors[i] }}
                />
              </div>
              {needsHealthCheck && i === 2 && (
                <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-500 text-xs font-bold">!</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push("/dashboard")}
          className="px-12 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors shadow-lg"
        >
          Continue
        </motion.button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 relative overflow-hidden">
    <motion.div
      className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px] pointer-events-none"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 12, repeat: Infinity, delay: 3 }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
    <div className="max-w-xl mx-auto relative z-10">
      <ApplicationStepper currentStep="healthAnswers" />
      <div className="mt-6">
        <BookAppointmentScreen
          onBack={() => {
            setScreen("steps");
            setError(null);
          }}
        />
      </div>
    </div>
  </div>;

  // ════════════════════════════════════════════════════════════════════════
  if (screen === "summary") {
    const summaryRows = [
      {
        label: "Height",
        value: form.height ? `${form.height} cm` : "",
        step: 2,
      },
      {
        label: "Weight",
        value: form.weight ? `${form.weight} kg` : "",
        step: 2,
      },
      { label: "Out-patient (3y)", value: form.outpatient3y || "", step: 3 },
      { label: "In-patient (5y)", value: form.inpatient5y || "", step: 3 },
      {
        label: "Psychotherapy (10y)",
        value: form.psychotherapy10y || "",
        step: 4,
      },
      {
        label: "Sterility treatment (3y)",
        value: form.sterility3y || "",
        step: 4,
      },
      {
        label: "Planned treatment",
        value: form.plannedTreatment || "",
        step: 5,
      },
      {
        label: "Untreated disease (3y)",
        value: form.untreatedDisease || "",
        step: 5,
      },
      { label: "Chronic disease", value: form.chronicDisease || "", step: 6 },
      { label: "HIV diagnosis", value: form.hiv || "", step: 6 },
      { label: "Recognized handicap", value: form.handicap || "", step: 7 },
      {
        label: "Regular medication (3y)",
        value: form.regularMedication || "",
        step: 7,
      },
      {
        label: "Spectacles",
        value:
          form.spectacles === "Yes"
            ? `Yes — R: ${form.dioptreRight || "?"}, L: ${form.dioptreLeft || "?"}`
            : form.spectacles || "",
        step: 8,
      },
      { label: "Dental exam (3y)", value: form.dentalExam3y || "", step: 9 },
      {
        label: "Ongoing dental treatment",
        value: form.dentalOngoing || "",
        step: 9,
      },
      { label: "Gum disease", value: form.gumDisease || "", step: 9 },
      {
        label: "Missing teeth",
        value:
          form.missingTeeth === "Yes"
            ? `Yes — ${form.missingTeethCount || "?"} teeth`
            : form.missingTeeth || "",
        step: 10,
      },
      {
        label: "Dentures",
        value:
          form.dentures === "Yes"
            ? `Yes — ${form.denturesCount || "?"} teeth`
            : form.dentures || "",
        step: 10,
      },
    ];

    const handleDownloadPDF = async () => {
      try {
        const res = await fetch(`/api/application/${id}`);
        const data = await res.json();

        if (!data?.pdfBase64) {
          alert("PDF not ready yet");
          return;
        }

        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.pdfBase64}`;
        link.download = "Hallesche_Application.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Download failed", err);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
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
        <div className="max-w-xl mx-auto px-4 py-8 relative z-10">
          <ApplicationStepper currentStep="healthAnswers" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <SummaryRow
                    label={row.label}
                    value={row.value}
                    onEdit={() => {
                      setScreen("steps");
                      setStepIndex(row.step);
                    }}
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed mb-6 px-0.5">
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
            </p>
            <motion.button
              onClick={() => setScreen("complete")}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-slate-900/20 transition-colors"
            >
              Continue
            </motion.button>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setScreen("steps");
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
                <div className="h-full w-full bg-violet-600 rounded-full" />
              </div>
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                {summaryRows.length}/{summaryRows.length}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  if (screen === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
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
        <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
          <ApplicationStepper currentStep="healthAnswers" />
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                Your application is almost complete
              </h1>
              <p className="text-slate-500 text-base font-light">
                You've nearly made it. There are three quick steps left:
              </p>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                },
              }}
            >
              {[
                { num: "2", label: "Upload documents", icon: "📄" },
                { num: "1", label: "Provide digital signature", icon: "✍️" },
                { num: "3", label: "Set up payment", icon: "💳" },
              ].map((s) => (
                <motion.div
                  key={s.num}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm shadow-black/[0.04]"
                >
                  <span className="text-xs font-bold text-violet-400 mb-3">
                    {s.num}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-3xl mb-4">
                    {s.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            <motion.button
              onClick={() => {
                setScreen("post-summary");
                setPostStepIndex(0);
                setError(null);
              }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-slate-900/20 transition-colors flex items-center gap-2"
            >
              Continue{" "}
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setScreen("summary")}
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
                <div className="h-full w-full bg-violet-600 rounded-full" />
              </div>
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                11/11
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  if (screen === "post-summary") {
    // ── Yield to full-screen loader as soon as submit is clicked ──────────
    if (showLoader) return null;

    const ps = POST_STEPS[postStepIndex];
    const postProgress = Math.round((postStepIndex / POST_STEPS.length) * 100);
    const renderPostContent = () => {
      if (ps.type === "documents") {
        const docs: any[] = form.documents || [];
        return (
          <>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
              Upload any supporting documents required.
            </p>
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
              className={`border-2 border-dashed rounded-xl p-8 ${
                error && (!form.documents || form.documents.length === 0)
                  ? "border-red-400 bg-red-50"
                  : ""
              } flex flex-col items-center gap-3 text-center cursor-pointer mb-4`}
            >
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
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
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {dragOver ? "Drop files here" : "Choose file or drag & drop"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supports images, PDFs and documents
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </motion.div>
            <AnimatePresence>
              {docs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {docs.map((doc, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 bg-slate-50 border border-black/[0.07] rounded-xl px-3.5 py-2.5 group"
                    >
                      <span className="text-lg">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleChange(
                            "documents",
                            docs.filter((_: any, j: number) => j !== i),
                          )
                        }
                        className="w-6 h-6 rounded-full bg-black/[0.04] hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg
                          className="w-3 h-3 text-slate-400 hover:text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );
      }
      if (ps.type === "signature")
        return (
          <>
            <p className="text-sm text-slate-400 font-light mb-5">
              Sign in the box below using your mouse or finger.
            </p>
            <motion.div
              animate={
                hasDrawn
                  ? {
                      borderColor: "rgba(139,92,246,0.4)",
                      boxShadow: "0 0 0 3px rgba(139,92,246,0.08)",
                    }
                  : { borderColor: "rgba(0,0,0,0.1)", boxShadow: "none" }
              }
              transition={{ duration: 0.25 }}
              className="relative rounded-xl border-2 border-dashed overflow-hidden bg-slate-50 mb-2"
            >
              <AnimatePresence>
                {!hasDrawn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2"
                  >
                    <svg
                      className="w-7 h-7 text-slate-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                    <p className="text-slate-300 text-xs font-light">
                      Sign here
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-[28px] left-8 right-8 h-px bg-black/[0.06]" />
              <p className="absolute bottom-[10px] left-8 text-[10px] text-slate-400 font-light">
                Signature
              </p>
              <canvas
                ref={canvasRef}
                width={520}
                height={180}
                className="w-full touch-none"
                style={{
                  display: "block",
                  touchAction: "none",
                  cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cline x1='12' y1='2' x2='12' y2='22' stroke='%23334155' stroke-width='1.5'/%3E%3Cline x1='2' y1='12' x2='22' y2='12' stroke='%23334155' stroke-width='1.5'/%3E%3Ccircle cx='12' cy='12' r='2' fill='none' stroke='%23334155' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, crosshair`,
                }}
                onMouseDown={startDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onMouseMove={draw}
              />
            </motion.div>
            <div className="flex justify-end">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-black/[0.04]"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear signature
              </button>
            </div>
          </>
        );
      if (ps.type === "sepa")
        return (
          <>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
              Authorize Hallesche Krankenversicherung a.G. to collect your
              premium via direct debit from your bank account.
            </p>
            <div className="space-y-3 mb-4">
              {[
                {
                  key: "sepaName",
                  label: "Account holder name",
                  placeholder: "Full name as on bank account",
                  mono: false,
                  validate: undefined as ((v: string) => boolean) | undefined,
                },
                {
                  key: "sepaIban",
                  label: "IBAN",
                  placeholder: "DE00 0000 0000 0000 0000 00",
                  mono: true,
                  validate: validateIBAN as
                    | ((v: string) => boolean)
                    | undefined,
                },
                {
                  key: "sepaBic",
                  label: "BIC / SWIFT (optional)",
                  placeholder: "e.g. DEUTDEFF",
                  mono: true,
                  validate: validateBIC as ((v: string) => boolean) | undefined,
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={form[f.key] || ""}
                    onChange={(e) => {
                      const value = f.mono
                        ? e.target.value.toUpperCase()
                        : e.target.value;
                      handleChange(f.key, value);
                    }}
                    onBlur={() => {
                      if (f.validate && form[f.key]?.trim()) {
                        const isValid = f.validate(form[f.key]);
                        if (!isValid) {
                          setError(
                            f.key === "sepaIban"
                              ? "Invalid IBAN format"
                              : "Invalid BIC format",
                          );
                        }
                      }
                    }}
                    className={`w-full bg-slate-50 border ${
                      f.validate &&
                      form[f.key]?.trim() &&
                      !f.validate(form[f.key])
                        ? "border-red-300"
                        : "border-black/[0.08]"
                    } rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all ${f.mono ? "font-mono" : ""}`}
                  />
                  {f.validate &&
                    form[f.key]?.trim() &&
                    !f.validate(form[f.key]) && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Invalid format
                      </p>
                    )}
                </div>
              ))}

              {/* Payment Frequency */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Payment Frequency *
                </label>
                <div className="space-y-2">
                  {[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "half-yearly", label: "Half-yearly" },
                    { value: "yearly", label: "Yearly (3% discount)" },
                  ].map((option) => {
                    const isSelected =
                      form.sepaPaymentFrequency === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() =>
                          handleChange("sepaPaymentFrequency", option.value)
                        }
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all duration-150 ${
                          isSelected
                            ? "border-violet-400/60 bg-violet-50"
                            : "border-black/[0.07] bg-white hover:border-black/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "border-violet-600 bg-violet-600"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-violet-800" : "text-slate-600"
                          }`}
                        >
                          {option.label}
                        </span>
                        {option.value === "yearly" && (
                          <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Save 3%
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 font-light leading-relaxed mb-3">
                By accepting, I authorize Hallesche Krankenversicherung a.G.
                (Creditor) to send instructions to my bank to debit my account
                in accordance with these instructions. A refund must be claimed
                within 8 weeks from the date my account was debited. This
                mandate is for recurring payments (SEPA Core Direct Debit).
              </p>
              <motion.button
                onClick={() =>
                  handleChange("sepaMandateAccepted", !form.sepaMandateAccepted)
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all duration-150 ${
                  form.sepaMandateAccepted
                    ? "border-violet-400/60 bg-violet-50"
                    : "border-black/[0.07] bg-white hover:border-black/20"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    form.sepaMandateAccepted
                      ? "border-violet-600 bg-violet-600"
                      : "border-slate-300"
                  }`}
                >
                  {form.sepaMandateAccepted && (
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
                  className={`text-sm font-medium ${
                    form.sepaMandateAccepted
                      ? "text-violet-800"
                      : "text-slate-600"
                  }`}
                >
                  I accept the SEPA direct debit mandate
                </span>
              </motion.button>
            </div>
          </>
        );
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
          <ApplicationStepper currentStep="healthAnswers" />
          <div className="mt-6 mb-3 flex items-center gap-2">
            {POST_STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= postStepIndex ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">
              Step {postStepIndex + 1} of {POST_STEPS.length}
            </span>
            <span className="text-xs font-semibold text-violet-600">
              {postProgress}%
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={ps.key}
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
                  {" "}
                  {postStepIndex === 0
                    ? "Documents"
                    : postStepIndex === 1
                      ? "Signature"
                      : "Payment"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {ps.title}
              </h1>
              <div className="mb-4" />
              {renderPostContent()}
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
                {postStepIndex > 0 && (
                  <motion.button
                    onClick={() => {
                      setPostStepIndex((p) => p - 1);
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
                  onClick={handlePostNext}
                  disabled={loading}
                  whileHover={!loading ? { y: -1, scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow flex items-center justify-center gap-2 disabled:opacity-50"
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
                      Submitting…
                    </>
                  ) : postStepIndex === POST_STEPS.length - 1 ? (
                    <>
                      Submit Application{" "}
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      Continue{" "}
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
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // ── MAIN MEDICAL STEPS
  // ════════════════════════════════════════════════════════════════════════
  const renderContent = () => {
    const s = current as any;

    if (s.type === "consent1")
      return (
        <>
          <p className="text-sm text-slate-500 font-light leading-relaxed mb-4">
            It is important that you are aware of the following:
          </p>
          <ConsentCard
            part={1}
            accepted={!!form.consent1}
            onToggle={() => handleChange("consent1", !form.consent1)}
          />
        </>
      );
    if (s.type === "consent2")
      return (
        <>
          <p className="text-sm text-slate-500 font-light leading-relaxed mb-2">
            The following questions are asked by the insurer (Hallesche
            Krankenversicherung a.G.) to determine the details of your coverage.
          </p>
          <p className="text-sm text-slate-500 font-light leading-relaxed mb-4">
            It is important that you are aware of the following:
          </p>
          <ConsentCard
            part={2}
            accepted={!!form.consent2}
            onToggle={() => handleChange("consent2", !form.consent2)}
          />
        </>
      );

    if (s.type === "measurements")
      return (
        <div className="grid grid-cols-2 gap-4">
          {s.fields.map((f: any) => (
            <div key={f.key} className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                {f.label}
              </label>
              <input
                type="number"
                placeholder={f.placeholder}
                value={form[f.key] || ""}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
              />
              <span className="absolute right-4 bottom-3 text-slate-400 text-sm font-medium">
                {f.unit}
              </span>
            </div>
          ))}
        </div>
      );

    if (s.type === "multi-yesno")
      return (
        <div>
          {s.questions.map((q: any, i: number) => (
            <div key={q.key}>
              {i > 0 && <div className="my-3 border-t border-slate-100" />}
              <YesNoQuestion
                questionKey={q.key}
                label={q.label}
                subtitle={q.subtitle}
                value={form[q.key] || ""}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      );

    if (s.type === "multi-yesno-count")
      return (
        <div>
          {s.questions.map((q: any, i: number) => (
            <div key={q.key}>
              {i > 0 && <div className="my-3 border-t border-slate-100" />}
              <YesNoQuestion
                questionKey={q.key}
                label={q.label}
                subtitle={q.subtitle}
                value={form[q.key] || ""}
                onChange={handleChange}
              />
              <AnimatePresence>
                {form[q.key] === "Yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-2"
                  >
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                      {q.countLabel}
                    </label>
                    <input
                      type="number"
                      placeholder="Enter number"
                      value={form[q.countKey] || ""}
                      onChange={(e) => handleChange(q.countKey, e.target.value)}
                      className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      );

    if (s.type === "spectacles")
      return (
        <>
          {s.subtitle && (
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">
              {s.subtitle}
            </p>
          )}
          <YesNoQuestion
            questionKey="spectacles"
            label="Do you wear spectacles or contact lenses, or have they been recommended or prescribed?"
            value={form.spectacles || ""}
            onChange={handleChange}
          />
          <AnimatePresence>
            {form.spectacles === "Yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-3"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Dioptres (state from +8 / –8 onwards)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "dioptreRight", label: "Right eye" },
                    { key: "dioptreLeft", label: "Left eye" },
                  ].map((eye) => (
                    <div key={eye.key}>
                      <label className="text-[11px] text-slate-400 mb-1 block">
                        {eye.label}
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        placeholder="e.g. −2.50"
                        value={form[eye.key] || ""}
                        onChange={(e) => handleChange(eye.key, e.target.value)}
                        className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all text-center"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
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
        <ApplicationStepper currentStep="healthAnswers" />
        <div className="mt-6 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <span className="text-xs font-semibold text-violet-600">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
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
                onClick={() => setScreen("summary")}
                className="text-xs font-semibold cursor-pointer text-violet-600 hover:text-violet-700 transition"
              >
                Review →
              </button>
            </div>
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
                Medical Info · {stepIndex + 1}/{totalSteps}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
              {current.title}
            </h1>
            <div className="mb-4" />
            {renderContent()}
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow flex items-center justify-center gap-2"
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
