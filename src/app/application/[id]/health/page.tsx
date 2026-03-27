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

// ── Yes/No question ───────────────────────────────────────────────────────────
function YesNoQuestion({
  questionKey,
  value,
  onChange,
}: {
  questionKey: string;
  label: string;
  value: string;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {["Yes", "No"].map((opt) => {
        const sel = value === opt;
        return (
          <motion.button
            key={opt}
            onClick={() => onChange(questionKey, opt)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${sel ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"}`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
            >
              {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600  text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow"
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

// ── All question definitions ──────────────────────────────────────────────────
const MEDICAL_QUESTIONS = [
  { key: "consent1", title: "Before we continue… (1 of 2)", type: "consent1" },
  { key: "consent2", title: "Before we continue… (2 of 2)", type: "consent2" },
  {
    key: "height",
    title: "How tall are you in centimeters?",
    type: "number",
    placeholder: "Height (cm)",
    unit: "cm",
  },
  {
    key: "weight",
    title: "What is your weight in kilograms?",
    type: "number",
    placeholder: "Weight (kg)",
    unit: "kg",
  },
  {
    key: "outpatient3y",
    title:
      "Have out-patient examinations or treatments been carried out during the last 3 years?",
    type: "yesno",
    redirectOnYes: true,
    subtitle:
      "Including medical check-ups, treatments by doctors, non-medical practitioners or other persons.",
  },
  {
    key: "inpatient5y",
    title:
      "Did in-patient examinations, treatments or operations take place within the last 5 years?",
    type: "yesno",
    redirectOnYes: true,
  },
  {
    key: "psychotherapy10y",
    title:
      "Has a psychotherapy been recommended or carried out in the last 10 years, or is one intended?",
    type: "yesno",
    redirectOnYes: true,
  },
  {
    key: "sterility3y",
    title:
      "During the last 3 years have you had examinations or treatment due to sterility or an unfulfilled wish for a child?",
    type: "yesno",
    redirectOnYes: true,
    subtitle: "To be answered by male and female applicants.",
  },
  {
    key: "plannedTreatment",
    title:
      "Is an out-patient or in-patient examination, treatment or operation necessary, intended or recommended?",
    type: "yesno",
    redirectOnYes: true,
  },
  {
    key: "untreatedDisease",
    title:
      "Have you suffered from any disease, complaint or addiction not treated in the last 3 years?",
    type: "yesno",
    redirectOnYes: true,
    subtitle:
      "Including physical or psychological faults, or need of care during the last 3 years.",
  },
  {
    key: "chronicDisease",
    title:
      "Do chronic diseases, permanent/recurring complaints, organic or physical faults, body implants or prostheses exist?",
    type: "yesno",
    redirectOnYes: true,
    subtitle:
      "Including maxillodental abnormalities, breast implants, artificial joints, etc.",
  },
  {
    key: "hiv",
    title: "Have you ever been diagnosed with HIV (e.g. by an AIDS test)?",
    type: "yesno",
    redirectOnYes: true,
  },
  {
    key: "handicap",
    title: "Do you have a recognized handicap?",
    type: "yesno",
    redirectOnYes: true,
    subtitle:
      "If yes, please have ready a copy of the recognition certificate (German GdB).",
  },
  {
    key: "regularMedication",
    title:
      "Have you taken or do you take medicaments regularly during the last 3 years?",
    type: "yesno",
    redirectOnYes: true,
    subtitle: "Including medications taken for prevention.",
  },
  {
    key: "spectacles",
    title:
      "Do you wear spectacles or contact lenses, or have they been recommended or prescribed?",
    type: "spectacles",
    subtitle:
      "Please state dioptres from +8/–8 onwards. A monthly surcharge may apply depending on your tariff.",
  },
  {
    key: "dentalExam3y",
    title:
      "Have you had dental examinations or treatment during the last 3 years?",
    type: "yesno",
    redirectOnYes: false,
    subtitle: "Including dental check-ups.",
  },
  {
    key: "dentalOngoing",
    title:
      "Are you in dental treatment at the moment, or is treatment for dental regulation, periodontosis or dentures necessary or intended?",
    type: "yesno",
    redirectOnYes: false,
  },
  {
    key: "gumDisease",
    title:
      "Does a gum disease (e.g. periodontosis, periodontitis) or an anomalous position of the teeth or jaw exist?",
    type: "yesno",
    redirectOnYes: false,
  },
  {
    key: "missingTeeth",
    title: "Are any teeth (except wisdom teeth) missing and not yet replaced?",
    type: "yesno-count",
    redirectOnYes: false,
    countKey: "missingTeethCount",
    countLabel: "Number of missing teeth",
    subtitle: "Only for persons 16 years of age and older.",
  },
  {
    key: "dentures",
    title:
      "Do you have dentures (replaced or crowned teeth, including implants, bridges, crowns and prostheses)?",
    type: "yesno-count",
    redirectOnYes: false,
    countKey: "denturesCount",
    countLabel: "Number of teeth with dentures",
    subtitle:
      "For bridges, count all relevant teeth separately including anchor/pillar teeth.",
  },
] as const;

// ── POST-SUMMARY step definitions ─────────────────────────────────────────────
const POST_STEPS = [
  { key: "documents", title: "Upload supporting documents", type: "documents" },
  {
    key: "signature",
    title: "Provide your digital signature",
    type: "signature",
  },
  { key: "sepa", title: "Set up your SEPA direct debit mandate", type: "sepa" },
] as const;

// ── Main component ────────────────────────────────────────────────────────────
export default function MedicalPage() {
  const { id } = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [postStepIndex, setPostStepIndex] = useState(0);
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("steps");
  const [dragOver, setDragOver] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const questions = MEDICAL_QUESTIONS;
  const totalSteps = questions.length;
  const current = questions[stepIndex];
  const isLast = stepIndex === totalSteps - 1;
  const progress = Math.round((stepIndex / totalSteps) * 100);
  const application = useApplicationStore((s) => s.application);
  const updateStep = useApplicationStore((s) => s.updateStep);
  const setApplication = useApplicationStore((s) => s.setApplication);
  // ── Canvas helpers ──────────────────────────────────────────────────────────
  const getCtx = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b";
    return { canvas, ctx };
  };
  const getPos = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
  ) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
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
  // ── Non-passive touch listeners (attached via useEffect) ─────────────────

  useEffect(() => {
    if (!application?.healthAnswers) return;

    setForm(application.healthAnswers || {});
  }, [application]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) * (canvas.width / rect.width);
      const y = (t.clientY - rect.top) * (canvas.height / rect.height);
      const ctx = canvas.getContext("2d")!;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) * (canvas.width / rect.width);
      const y = (t.clientY - rect.top) * (canvas.height / rect.height);
      const ctx = canvas.getContext("2d")!;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1e293b";
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      setHasDrawn(true);
    };
    const onTouchEnd = () => {
      isDrawing.current = false;
      canvas.getContext("2d")!.beginPath();
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [screen, postStepIndex]);
  const clearCanvas = () => {
    const { canvas, ctx } = getCtx();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    handleChange("signature", null);
  };
  const captureSignature = () => {
    const canvas = canvasRef.current!;
    handleChange("signature", canvas.toDataURL("image/png"));
  };

    // ✅ Sync initial data to store
    useEffect(() => {
      if (!form || Object.keys(form).length === 0) return;

      updateStep("healthAnswers", form);
    }, []);


  // ── File upload helper ──────────────────────────────────────────────────────
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
    setError(null);

    // ✅ SAVE TO GLOBAL STORE
    updateStep("healthAnswers", updated);
  };
  // ── Validate medical step ───────────────────────────────────────────────────
  const validate = (): string | null => {
    const q = current;
    if (q.type === "consent1" && !form.consent1)
      return "Please accept the terms to continue.";
    if (q.type === "consent2" && !form.consent2)
      return "Please accept the terms to continue.";
    if (q.type === "number") {
      if (!form[q.key]?.toString().trim())
        return `Please enter your ${q.key === "height" ? "height" : "weight"}.`;
      if (isNaN(Number(form[q.key])) || Number(form[q.key]) <= 0)
        return "Please enter a valid value.";
    }
    if ((q.type === "yesno" || q.type === "yesno-count") && !form[q.key])
      return "Please select an option.";
    if (q.type === "spectacles" && !form.spectacles)
      return "Please select an option.";
    if (
      q.type === "yesno-count" &&
      form[q.key] === "Yes" &&
      !form[q.countKey]?.toString().trim()
    )
      return `Please enter the ${q.countLabel.toLowerCase()}.`;
    return null;
  };

  // ── Validate post-summary step ──────────────────────────────────────────────
  const validatePost = (): string | null => {
    const s = POST_STEPS[postStepIndex];
    if (
      s.type === "documents" &&
      (!form.documents || form.documents.length === 0)
    )
      return null; // optional — allow proceed
    if (s.type === "signature") {
      if (!hasDrawn) return "Please draw your signature before continuing.";
    }
    if (s.type === "sepa") {
      if (!form.sepaName?.trim())
        return "Please enter your account holder name.";
      if (!form.sepaIban?.trim()) return "Please enter your IBAN.";
      if (!form.sepaMandateAccepted)
        return "Please accept the SEPA mandate to continue.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (
      (current.type === "yesno" || current.type === "yesno-count") &&
      current.redirectOnYes &&
      form[current.key] === "Yes"
    ) {
      setScreen("book-appointment");
      return;
    }
    if (isLast) {
      setScreen("summary");
    } else {
      setStepIndex((p) => p + 1);
    }
  };

  const handlePostNext = () => {
    const err = validatePost();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    // Capture signature before moving on
    if (POST_STEPS[postStepIndex].type === "signature" && hasDrawn)
      captureSignature();
    if (postStepIndex < POST_STEPS.length - 1) {
      setPostStepIndex((p) => p + 1);
    } else {
      handleSubmit();
    }
  };

const handleSubmit = async () => {
  setLoading(true);

  try {
    // ✅ STEP 1: Save health data
   const cleanForm = JSON.parse(JSON.stringify(form));

const healthRes = await fetch(`/api/application/${id}/health`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(cleanForm), // ✅ CLEAN DATA
});

  if (!healthRes.ok) {
  let errText = "";

  try {
    errText = await healthRes.text();
  } catch (e) {
    errText = "Could not read error response";
  }

  console.error("❌ Health API failed:");
  console.error("Status:", healthRes.status);
  console.error("Response:", errText);

  alert("Health save failed. Check console."); // 👈 helps you debug quickly

  if (!healthRes.ok) {
  console.warn("⚠️ Health save failed, retrying once...");

  await new Promise((r) => setTimeout(r, 3000));

  const retryRes = await fetch(`/api/application/${id}/health`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanForm),
  });

  if (!retryRes.ok) {
    const errText = await retryRes.text();
    console.error("❌ Final failure:", errText);

    alert("Database is waking up. Please try again.");
    return;
  }
}
}

    console.log("✅ Health saved");

    // ✅ STEP 2: Call COMPLETE API
    const completeRes = await fetch(`/api/application/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature: form.signature || null, // 🔥 IMPORTANT
      }),
    });

    if (!completeRes.ok) {
  const errText = await completeRes.text();
  console.error("❌ COMPLETE API ERROR:", errText);

  throw new Error(errText || "Complete API failed");
}

    console.log("🔥 Application completed");

    // ✅ Redirect
    router.push(`/application/${id}`);
  } catch (err) {
    console.error("❌ Error:", err);
    setLoading(false);
  }
};

  // ════════════════════════════════════════════════════════════════════════════
  // ── BOOK APPOINTMENT ───────────────────────────────────────────────────────
  if (screen === "book-appointment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 relative overflow-hidden">
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
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
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── SUMMARY ────────────────────────────────────────────────────────────────
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
        step: 3,
      },
      { label: "Out-patient (3y)", value: form.outpatient3y || "", step: 4 },
      { label: "In-patient (5y)", value: form.inpatient5y || "", step: 5 },
      {
        label: "Psychotherapy (10y)",
        value: form.psychotherapy10y || "",
        step: 6,
      },
      {
        label: "Sterility treatment (3y)",
        value: form.sterility3y || "",
        step: 7,
      },
      {
        label: "Planned treatment",
        value: form.plannedTreatment || "",
        step: 8,
      },
      {
        label: "Untreated disease (3y)",
        value: form.untreatedDisease || "",
        step: 9,
      },
      { label: "Chronic disease", value: form.chronicDisease || "", step: 10 },
      { label: "HIV diagnosis", value: form.hiv || "", step: 11 },
      { label: "Recognized handicap", value: form.handicap || "", step: 12 },
      {
        label: "Regular medication (3y)",
        value: form.regularMedication || "",
        step: 13,
      },
      {
        label: "Spectacles",
        value:
          form.spectacles === "Yes"
            ? `Yes — R: ${form.dioptreRight || "?"}, L: ${form.dioptreLeft || "?"}`
            : form.spectacles || "",
        step: 14,
      },
      { label: "Dental exam (3y)", value: form.dentalExam3y || "", step: 15 },
      {
        label: "Ongoing dental treatment",
        value: form.dentalOngoing || "",
        step: 16,
      },
      { label: "Gum disease", value: form.gumDisease || "", step: 17 },
      {
        label: "Missing teeth",
        value:
          form.missingTeeth === "Yes"
            ? `Yes — ${form.missingTeethCount || "?"} teeth`
            : form.missingTeeth || "",
        step: 18,
      },
      {
        label: "Dentures",
        value:
          form.dentures === "Yes"
            ? `Yes — ${form.denturesCount || "?"} teeth`
            : form.dentures || "",
        step: 19,
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
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
              <span className="text-violet-600 underline underline-offset-2 cursor-pointer hover:text-violet-700">
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
                onClick={() => setScreen("complete")}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-slate-900/20 transition-colors"
              >
                Continue
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── COMPLETE (3-step cards) ─────────────────────────────────────────────────
  if (screen === "complete") {
    const completionSteps = [
      { num: "1", label: "Provide digital signature", icon: "✍️" },
      { num: "2", label: "Upload documents", icon: "📄" },
      { num: "3", label: "Set up payment", icon: "💳" },
    ];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                Your application is almost complete
              </h1>
              <p className="text-slate-500 text-base font-light">
                You've nearly made it. There are three quick steps left:
              </p>
            </motion.div>

            {/* 3 step cards */}
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
              {completionSteps.map((s) => (
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

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
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
            </motion.div>

            {/* Bottom strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 mt-8"
            >
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
                21/21
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── POST-SUMMARY STEPS (docs / signature / sepa) ───────────────────────────
  if (screen === "post-summary") {
    const ps = POST_STEPS[postStepIndex];
    const postProgress = Math.round((postStepIndex / POST_STEPS.length) * 100);

    const renderPostContent = () => {
      // ── Documents ──────────────────────────────────────────────────────────
      if (ps.type === "documents") {
        const docs: any[] = form.documents || [];
        return (
          <>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
              Upload any supporting documents required for your application. You
              can always provide these later if you don't have them ready now.
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
              className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 text-center cursor-pointer mb-4"
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

            {/* File list */}
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

      // ── Signature ──────────────────────────────────────────────────────────
      if (ps.type === "signature") {
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
                  cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cline x1='12' y1='2' x2='12' y2='22' stroke='%23334155' stroke-width='1.5'/%3E%3Cline x1='2' y1='12' x2='22' y2='12' stroke='%23334155' stroke-width='1.5'/%3E%3Ccircle cx='12' cy='12' r='2' fill='none' stroke='%23334155' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, crosshair`,
                }}
                onMouseDown={startDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onMouseMove={draw}
                // touch events attached via useEffect (non-passive)
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
      }

      // ── SEPA mandate ───────────────────────────────────────────────────────
      if (ps.type === "sepa") {
        return (
          <>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
              Authorize Hallesche Krankenversicherung a.G. to collect your
              monthly premium via direct debit from your bank account.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Account holder name
                </label>
                <input
                  type="text"
                  placeholder="Full name as on bank account"
                  value={form.sepaName || ""}
                  onChange={(e) => handleChange("sepaName", e.target.value)}
                  className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  IBAN
                </label>
                <input
                  type="text"
                  placeholder="DE00 0000 0000 0000 0000 00"
                  value={form.sepaIban || ""}
                  onChange={(e) =>
                    handleChange("sepaIban", e.target.value.toUpperCase())
                  }
                  className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  BIC / SWIFT (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEUTDEDB"
                  value={form.sepaBic || ""}
                  onChange={(e) =>
                    handleChange("sepaBic", e.target.value.toUpperCase())
                  }
                  className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all font-mono"
                />
              </div>
            </div>

            {/* Mandate text */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 font-light leading-relaxed mb-3">
                By accepting, I authorize Hallesche Krankenversicherung a.G.
                (Creditor) to send instructions to my bank to debit my account
                and my bank to debit my account in accordance with these
                instructions. I am entitled to a refund from my bank under the
                terms and conditions of my agreement with my bank. A refund must
                be claimed within 8 weeks starting from the date on which my
                account was debited. This mandate is for recurring payments
                (SEPA Core Direct Debit).
              </p>
              <motion.button
                onClick={() =>
                  handleChange("sepaMandateAccepted", !form.sepaMandateAccepted)
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full px-4 py-3 rounded-xl border flex items-center gap-3 transition-all duration-150 ${form.sepaMandateAccepted ? "border-violet-400/60 bg-violet-50" : "border-black/[0.07] bg-white hover:border-black/20"}`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.sepaMandateAccepted ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}
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
                  className={`text-sm font-medium ${form.sepaMandateAccepted ? "text-violet-800" : "text-slate-600"}`}
                >
                  I accept the SEPA direct debit mandate
                </span>
              </motion.button>
            </div>
          </>
        );
      }
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

          {/* Mini step progress for post steps */}
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
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">
                  Medical History ·{" "}
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

              {/* Error */}
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

              {/* Actions */}
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

              {/* Skip for documents only */}
              {ps.type === "documents" && (
                <button
                  onClick={() => {
                    setPostStepIndex((p) => p + 1);
                    setError(null);
                  }}
                  className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
                >
                  Provide documents later →
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── MEDICAL STEPS ──────────────────────────────────────────────────────────
  const renderContent = () => {
    if (current.type === "consent1")
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
    if (current.type === "consent2")
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
    if (current.type === "number")
      return (
        <div className="relative">
          <input
            type="number"
            placeholder={current.placeholder}
            value={form[current.key] || ""}
            onChange={(e) => handleChange(current.key, e.target.value)}
            className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 pr-14 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            {current.unit}
          </span>
        </div>
      );
    if (current.type === "yesno")
      return (
        <>
          {"subtitle" in current && current.subtitle && (
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">
              {current.subtitle}
            </p>
          )}
          <YesNoQuestion
            questionKey={current.key}
            label={current.title}
            value={form[current.key] || ""}
            onChange={handleChange}
          />
        </>
      );
    if (current.type === "yesno-count")
      return (
        <>
          {current.subtitle && (
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">
              {current.subtitle}
            </p>
          )}
          <YesNoQuestion
            questionKey={current.key}
            label={current.title}
            value={form[current.key] || ""}
            onChange={handleChange}
          />
          <AnimatePresence>
            {form[current.key] === "Yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-3"
              >
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  {current.countLabel}
                </label>
                <input
                  type="number"
                  placeholder="Enter number"
                  value={form[current.countKey] || ""}
                  onChange={(e) =>
                    handleChange(current.countKey, e.target.value)
                  }
                  className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
    if (current.type === "spectacles")
      return (
        <>
          {current.subtitle && (
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">
              {current.subtitle}
            </p>
          )}
          <YesNoQuestion
            questionKey="spectacles"
            label={current.title}
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
              Question {stepIndex + 1} of {totalSteps}
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
