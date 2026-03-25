"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationStepper from "@/app/components/privateApplications/ApplicationStepper";
import { useApplicationStore } from "@/app/stores/applicationStore";

// ── Country list with flags ──────────────────────────────────────────────────
const COUNTRIES = [
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "SY", name: "Syria", flag: "🇸🇾" },
];

// ── Types ────────────────────────────────────────────────────────────────────
type Form = Record<string, any>;

// ── Validation helpers ───────────────────────────────────────────────────────
function validateStep(stepIndex: number, form: Form): string | null {
  switch (stepIndex) {
    case 0:
      if (!form.firstName?.trim()) return "First name is required.";
      if (!form.lastName?.trim()) return "Last name is required.";
      return null;
    case 1:
      if (!form.email?.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
      return null;
    case 2:
      if (!form.day || !form.month || !form.year) return "Please enter your full date of birth.";
      if (isNaN(Number(form.day)) || Number(form.day) < 1 || Number(form.day) > 31) return "Invalid day.";
      if (isNaN(Number(form.month)) || Number(form.month) < 1 || Number(form.month) > 12) return "Invalid month.";
      if (isNaN(Number(form.year)) || Number(form.year) < 1900 || Number(form.year) > new Date().getFullYear()) return "Invalid year.";
      return null;
    case 3:
      if (!form.gender) return "Please select your gender.";
      return null;
    case 4:
      if (!form.street?.trim()) return "Street is required.";
      if (!form.houseNumber?.trim()) return "House number is required.";
      if (!form.postcode?.trim()) return "Postcode is required.";
      if (!form.city?.trim()) return "City is required.";
      return null;
    case 5:
      if (!form.marital) return "Please select your marital status.";
      return null;
    case 6:
      if (!form.countries || form.countries.length === 0) return "Select at least one country.";
      return null;
    case 7:
      if (!form.relocationDay || !form.relocationMonth || !form.relocationYear) return "Please enter your relocation date.";
      return null;
    case 8:
      if (!form.residence) return "Please select your residence permit type.";
      return null;
    case 9:
      // passport is optional (provide later allowed)
      return null;
    default:
      return null;
  }
}

// ── Summary row component ────────────────────────────────────────────────────
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
          {value ? value : <span className="text-slate-400 italic text-sm font-normal">Not provided</span>}
        </p>
      </div>
      <svg
        className="w-4 h-4 text-slate-300 group-hover:text-violet-400 flex-shrink-0 ml-3 transition-colors duration-150"
        viewBox="0 0 20 20" fill="currentColor"
      >
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </motion.button>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PersonalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showResidenceInfo, setShowResidenceInfo] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
//   const [application, setApplication] = useState<any>(null);
const application = useApplicationStore((s) => s.application);
const setApplication = useApplicationStore((s) => s.setApplication);
const updateStep = useApplicationStore((s) => s.updateStep);

  useEffect(() => {
  const fetchApp = async () => {
    const res = await fetch(`/api/application/${id}`);
    const data = await res.json();
    setApplication(data);
  };

  if (id) fetchApp();
}, [id]);


const steps = [
  "firstName",
  "email",
  "day",
  "gender",
  "street",
  "marital",
  "countries",
  "relocationDay",
  "residence",
];

useEffect(() => {
  if (!application?.personalDetails) return;

  const data = application.personalDetails;

  const index = steps.findIndex((key) => !data[key]);

  setStepIndex(index === -1 ? steps.length - 1 : index);
}, [application]);

// useEffect(() => {
//   if (!application?.personalDetails) return;

//   const data = application.personalDetails;
//   if (!data.firstName) return setStepIndex(0);
//   if (!data.email) return setStepIndex(1);
//   if (!data.day) return setStepIndex(2);
//   if (!data.gender) return setStepIndex(3);
//   if (!data.street) return setStepIndex(4);
//   if (!data.marital) return setStepIndex(5);
//   if (!data.countries) return setStepIndex(6);
//   if (!data.relocationDay) return setStepIndex(7);
//   if (!data.residence) return setStepIndex(8);

//   setStepIndex(9);
// }, [application]);

// useEffect(() => {
//   if (!application?.personalDetails) return;

//   const data = application.personalDetails;

//   // ✅ AUTO FILL FORM
//   setForm({
//     firstName: data.firstName || "",
//     lastName: data.lastName || "",
//     email: data.email || "",
//     day: data.day || "",
//     month: data.month || "",
//     year: data.year || "",
//     gender: data.gender || "",
//     street: data.street || "",
//     houseNumber: data.houseNumber || "",
//     additionalInfo: data.additionalInfo || "",
//     postcode: data.postcode || "",
//     city: data.city || "",
//     marital: data.marital || "",
//     countries: data.countries || [],
//     relocationDay: data.relocationDay || "",
//     relocationMonth: data.relocationMonth || "",
//     relocationYear: data.relocationYear || "",
//     residence: data.residence || "",
//     passportNumber: data.passportNumber || "",
//   });
// }, [application]);

useEffect(() => {
  if (!application?.personalDetails) return;

  setForm(application.personalDetails);
}, [application]);

  const questions = [
    { key: "name",            title: "What is your name?",                            fields: ["firstName", "lastName"],                          placeholders: ["First name", "Last name"] },
    { key: "email",           title: "What is your email address?",                   fields: ["email"],                                          placeholders: ["Email address"] },
    { key: "dob",             title: "What is your date of birth?",                   fields: ["day", "month", "year"],                           placeholders: ["DD", "MM", "YYYY"] },
    { key: "gender",          title: "What is your gender?",                          type: "radio", options: ["Male", "Female", "Other"] },
    { key: "address",         title: "What is your address?",                         fields: ["street", "houseNumber", "additionalInfo", "postcode", "city"], placeholders: ["Street", "House number", "Additional info (C/O, apartment…)", "Postcode", "City"], optional: ["additionalInfo"], provideLater: true },
    { key: "marital",         title: "What is your marital status?",                  type: "radio", options: ["Single", "Married", "Widowed", "Divorced"] },
    { key: "passportCountry", title: "Which countries do you hold a passport from?",  type: "country" },
    { key: "relocation",      title: "When did or will you relocate to Germany?",     fields: ["relocationDay", "relocationMonth", "relocationYear"], placeholders: ["DD", "MM", "YYYY"], hint: "This can be an approximate date if you're not certain." },
    { key: "residence",       title: "What type of residence permit do you have?",    type: "residence" },
    { key: "passportNumber",  title: "What is your passport number?",                 fields: ["passportNumber"],                                 placeholders: ["Passport number"], provideLater: true },
  ] as const;

  const current = questions[stepIndex] as any;
  const isLast = stepIndex === questions.length - 1;
  const progress = Math.round(((stepIndex) / questions.length) * 100);

//   const handleChange = (name: string, value: any) => {
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setError(null);
//   };

const handleChange = (name: string, value: any) => {
  setForm((prev) => {
    const updated = { ...prev, [name]: value };

    // ✅ update global store
    updateStep("personalDetails", updated);

    return updated;
  });

  setError(null);
};
  const toggleCountry = (code: string) => {
    const current = form.countries || [];
    const updated = current.includes(code)
      ? current.filter((c: string) => c !== code)
      : [...current, code];
    handleChange("countries", updated);
  };

  const handleNext = () => {
    const err = validateStep(stepIndex, form);
    if (err) { setError(err); return; }
    setError(null);
    if (isLast) {
      setShowSummary(true);
    } else {
      setStepIndex((p) => p + 1);
    }
  };

  const handleProvideLater = () => {
    setError(null);
    if (isLast) {
      setShowSummary(true);
    } else {
      setStepIndex((p) => p + 1);
    }
  };

  useEffect(() => {
  if (!id || !form) return;

  const timeout = setTimeout(async () => {
    try {
      await fetch(`/api/application/${id}/personal`, {
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

const handleSubmit = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/application/${id}/personal`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const updated = await res.json();

    // ✅ sync Zustand with latest data
    setApplication(updated);

    router.push(`/application/${id}/financial`);
  } catch (err) {
    console.error("❌ Error saving", err);
    setLoading(false);
  }
};

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountries = COUNTRIES.filter((c) => (form.countries || []).includes(c.code));

  // ── Summary view ────────────────────────────────────────────────────────────
  if (showSummary) {
    const summaryRows = [
      { label: "Full name",               value: [form.firstName, form.lastName].filter(Boolean).join(" "),                                                                                                                 step: 0 },
      { label: "Email",                   value: form.email || "",                                                                                                                                                          step: 1 },
      { label: "Date of birth",           value: form.day && form.month && form.year ? `${form.year}-${String(form.month).padStart(2,"0")}-${String(form.day).padStart(2,"0")}` : "",                                       step: 2 },
      { label: "Gender",                  value: form.gender || "",                                                                                                                                                         step: 3 },
      { label: "Address",                 value: form.street ? [form.street, form.houseNumber, form.postcode, form.city].filter(Boolean).join(", ") : "Provided separately",                                               step: 4 },
      { label: "Marital status",          value: form.marital || "",                                                                                                                                                        step: 5 },
      { label: "Nationality",             value: selectedCountries.length > 0 ? selectedCountries.map((c) => c.name).join(", ") : "",                                                                                      step: 6 },
      { label: "Relocation date",         value: form.relocationDay && form.relocationMonth && form.relocationYear ? `${form.relocationYear}-${String(form.relocationMonth).padStart(2,"0")}-${String(form.relocationDay).padStart(2,"0")}` : "", step: 7 },
      { label: "Type of residence permit", value: form.residence ? `${form.residence} residence permit` : "",                                                                                                               step: 8 },
      { label: "Passport number",         value: form.passportNumber || "Provided separately",                                                                                                                              step: 9 },
    ];

    

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
        <motion.div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none" animate={{ scale: [1,1.1,1] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-xl mx-auto px-4 py-8 relative z-10">
          <ApplicationStepper currentStep="personalDetails" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            {/* Subtitle */}
            <p className="text-sm text-slate-500 font-light mb-5">
              Review or edit the information you have provided so far.
            </p>

            {/* Rows card */}
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-sm shadow-black/[0.04] overflow-hidden mb-5">
              {summaryRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SummaryRow
                    label={row.label}
                    value={row.value}
                    onEdit={() => { setShowSummary(false); setStepIndex(row.step); }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Legal disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-xs text-slate-400 font-light leading-relaxed mb-6 px-0.5"
            >
              By selecting "Continue", I confirm to have answered all questions truthfully.
              Knowingly omitting any relevant details entitles the insurer to cancel the
              contract—either retroactively or from the date the omission is discovered—or
              change the contract in accordance with{" "}
              <span className="text-violet-600 underline underline-offset-2 cursor-pointer hover:text-violet-700">
                § 19 Abs. 5 VVG (Information on the consequences of the violation of the
                disclosure obligation)
              </span>
              .
            </motion.p>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={!loading ? { y: -2, scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-150"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    Saving…
                  </>
                ) : "Continue"}
              </motion.button>
            </motion.div>

            {/* Bottom progress strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center gap-3 mt-6"
            >
              <button
                onClick={() => { setShowSummary(false); setStepIndex(questions.length - 1); }}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 p-1"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-full bg-slate-700 rounded-full" />
              </div>
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">10/10</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Step view ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6 relative overflow-hidden">

      <motion.div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-violet-400/10 blur-[100px] pointer-events-none" animate={{ scale: [1,1.1,1], x:[0,20,0], y:[0,-15,0] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div className="absolute bottom-[-100px] right-[-80px] w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px] pointer-events-none" animate={{ scale: [1,1.08,1] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        <ApplicationStepper currentStep="personalDetails" />

        {/* Progress bar */}
        <div className="mt-6 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Question {stepIndex + 1} of {questions.length}</span>
            <span className="text-xs font-semibold text-violet-600">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
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
            {/* Step badge */}
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              <span className="text-violet-700 text-[10px] font-semibold tracking-[0.12em] uppercase">Personal Info · {stepIndex + 1}/{questions.length}</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">{current.title}</h1>
            {current.hint && <p className="text-sm text-slate-400 font-light mb-5">{current.hint}</p>}
            {!current.hint && <div className="mb-5" />}

            {/* ── TEXT INPUTS ── */}
            {current.fields && current.key !== "dob" && current.key !== "relocation" && (
              <div className="space-y-3">
                {current.fields.map((field: string, fi: number) => {
                  const isOptional = current.optional?.includes(field);
                  const isFocused = false;
                  return (
                    <div key={field} className="relative">
                      <input
                        type={field === "email" ? "email" : "text"}
                        placeholder={current.placeholders?.[fi] + (isOptional ? " (optional)" : "")}
                        value={form[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all duration-200"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── DATE INPUTS (dob / relocation) ── */}
            {(current.key === "dob" || current.key === "relocation") && (
              <div className="grid grid-cols-3 gap-3">
                {current.fields.map((field: string, fi: number) => (
                  <div key={field} className="relative">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">
                      {current.placeholders?.[fi]}
                    </label>
                    <input
                      type="number"
                      placeholder={current.placeholders?.[fi]}
                      value={form[field] || ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all duration-200 text-center"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── RADIO ── */}
            {current.type === "radio" && (
              <div className="space-y-2">
                {current.options?.map((opt: string) => {
                  const selected = form[current.key] === opt;
                  return (
                    <motion.button
                      key={opt}
                      onClick={() => handleChange(current.key, opt)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150 ${
                        selected
                          ? "border-violet-400/60 bg-violet-50"
                          : "border-black/[0.07] bg-slate-50/60 hover:border-black/20 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${selected ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-medium ${selected ? "text-slate-900" : "text-slate-600"}`}>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* ── COUNTRY MULTI-SELECT ── */}
            {current.type === "country" && (
              <div className="space-y-3">
                {/* Selected tags */}
                {selectedCountries.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                    {selectedCountries.map((c) => (
                      <motion.span
                        key={c.code}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {c.flag} {c.name}
                        <button onClick={() => toggleCountry(c.code)} className="ml-0.5 hover:opacity-70">✕</button>
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search country…"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 transition-all duration-200"
                />

                {/* Country list */}
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  {filteredCountries.map((c) => {
                    const sel = (form.countries || []).includes(c.code);
                    return (
                      <button
                        key={c.code}
                        onClick={() => toggleCountry(c.code)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all duration-100 ${
                          sel ? "bg-violet-50 text-violet-700 font-medium" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="flex-1">{c.name}</span>
                        {sel && (
                          <svg className="w-4 h-4 text-violet-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── RESIDENCE ── */}
            {current.type === "residence" && (
              <div className="space-y-3">
                {[
                  {
                    value: "Limited",
                    label: "Limited residence permit",
                    desc: "E.g. work visa, blue card, family-reunion permit, etc.",
                    icon: "⏳",
                  },
                  {
                    value: "Unlimited",
                    label: "Unlimited residence permit",
                    desc: "Permanent settlement permit (Niederlassungserlaubnis)",
                    icon: "♾️",
                  },
                ].map((opt) => {
                  const selected = form.residence === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      onClick={() => handleChange("residence", opt.value)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left px-4 py-4 rounded-xl border flex items-start gap-4 transition-all duration-150 ${
                        selected
                          ? "border-violet-400/60 bg-violet-50"
                          : "border-black/[0.07] bg-slate-50/60 hover:border-black/20"
                      }`}
                    >
                      <span className="text-xl mt-0.5">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${selected ? "text-violet-800" : "text-slate-800"}`}>{opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-light">{opt.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </motion.button>
                  );
                })}

                {/* Info toggle */}
                <button
                  onClick={() => setShowResidenceInfo((p) => !p)}
                  className="text-xs text-violet-600 underline underline-offset-2 hover:text-violet-700 mt-1"
                >
                  {showResidenceInfo ? "Hide info ↑" : "What's the difference? ↓"}
                </button>
                <AnimatePresence>
                  {showResidenceInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed space-y-2">
                        <p><strong className="text-slate-700">Limited (Aufenthaltserlaubnis):</strong> Valid for a certain period, issued for a specific purpose like work or family reunion.</p>
                        <p><strong className="text-slate-700">Unlimited (Niederlassungserlaubnis):</strong> A permanent residence permit with no expiry date.</p>
                        <p className="text-slate-400 italic">Note: A tourist visa (up to 90 days) is not a residence permit.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── ERROR ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── ACTIONS ── */}
            <div className="mt-6 flex gap-3">
              {/* Back */}
              {stepIndex > 0 && (
                <motion.button
                  onClick={() => { setStepIndex((p) => p - 1); setError(null); }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-3 rounded-xl border border-black/[0.08] text-slate-600 text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors flex-shrink-0"
                >
                  ←
                </motion.button>
              )}

              {/* Continue */}
              <motion.button
                onClick={handleNext}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow flex items-center justify-center gap-2"
              >
                {isLast ? "Review & Continue" : "Continue"}
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
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
    </div>
  );
}