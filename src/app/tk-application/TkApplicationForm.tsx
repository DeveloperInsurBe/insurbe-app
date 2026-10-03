"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Pencil, Shield } from "lucide-react";

import {
  activityStart,
  isEmployment,
  isStudent,
  isTrainee,
  needsPreviousInsurer,
  requiresManualProcessing,
  parseIsoDate,
  stepForField,
  TK_FILE_RULES,
  TK_STEPS,
  validateTkStep,
  type TkErrors,
  type TkStepId,
} from "@/app/providers/tkApi/rules";
import {
  CUSTOMER_GROUP_LABELS,
  EMPTY_TK_FORM,
  GENDER_LABELS,
  PENSION_TYPE_LABELS,
  type TkCustomerGroup,
  type TkFormData,
  type TkGender,
  type TkPensionType,
} from "@/app/providers/tkApi/types";
import {
  CheckboxField,
  ChoiceField,
  CountryField,
  countryName,
  DateField,
  FileField,
  Full,
  Section,
  SelectField,
  TextField,
  YesNoField,
} from "./fields";

const DRAFT_KEY = "tk-application-draft";

type Documents = {
  photo: File | null;
  passport: File | null;
  proof: File | null;
  extra: File[];
};

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const monthsFromToday = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return isoDate(date);
};

const yesNoText = (value: boolean | null) => (value === true ? "Yes" : value === false ? "No" : "–");

const formatDate = (value: string) => {
  const date = parseIsoDate(value);
  return date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "–";
};

const GROUP_OPTIONS: { value: TkCustomerGroup; label: string; description: string }[] = [
  { value: "STUDIERENDE", label: "Student", description: "Enrolled at a German university" },
  { value: "BERUFSTAETIGE", label: "Employee", description: "Employed in Germany" },
  { value: "AUSZUBILDENDE", label: "Trainee", description: "Apprenticeship / vocational training" },
  { value: "SAISONBESCHAEFTIGTE", label: "Seasonal worker", description: "Temporary seasonal job" },
];

const GENDER_OPTIONS = (Object.keys(GENDER_LABELS) as TkGender[]).map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));

const proofLabel = (group: TkFormData["customerGroup"]) =>
  group === "STUDIERENDE"
    ? "Enrolment certificate or university admission letter"
    : group === "AUSZUBILDENDE"
      ? "Training contract"
      : "Employment contract";

/** Reads image dimensions; resolves null for formats the browser can't render (e.g. TIFF). */
const readImageSize = (file: File) =>
  new Promise<{ width: number; height: number } | null>((resolve) => {
    if (file.type === "image/tiff") return resolve(null);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

const validateDocuments = async (documents: Documents): Promise<TkErrors> => {
  const errors: TkErrors = {};
  const tooBig = (file: File) => file.size > TK_FILE_RULES.maxFileBytes;

  if (!documents.photo) errors.photo = "Please upload a passport photo";
  else if (!TK_FILE_RULES.photoTypes.includes(documents.photo.type)) errors.photo = "Photo must be JPG, PNG or TIFF";
  else if (tooBig(documents.photo)) errors.photo = "Photo must be 10 MB or smaller";
  else {
    const size = await readImageSize(documents.photo);
    if (size && (size.width < TK_FILE_RULES.photoMinWidth || size.height < TK_FILE_RULES.photoMinHeight)) {
      errors.photo = `Photo must be at least ${TK_FILE_RULES.photoMinWidth} × ${TK_FILE_RULES.photoMinHeight} pixels (yours is ${size.width} × ${size.height})`;
    }
  }

  const checkDocument = (key: "passport" | "proof", file: File | null, label: string) => {
    if (!file) errors[key] = `Please upload your ${label}`;
    else if (!TK_FILE_RULES.documentTypes.includes(file.type)) errors[key] = "Use PDF, Word, JPG, PNG, BMP, TIFF or TXT";
    else if (tooBig(file)) errors[key] = "File must be 10 MB or smaller";
  };

  checkDocument("passport", documents.passport, "passport copy");
  checkDocument("proof", documents.proof, "proof document");

  if (documents.extra.some((file) => !TK_FILE_RULES.documentTypes.includes(file.type) || tooBig(file))) {
    errors.extraDocuments = "Additional documents must be PDF, Word, image or text files of 10 MB or less";
  }

  return errors;
};

export default function TkApplicationForm() {
  const router = useRouter();

  const [data, setData] = useState<TkFormData>(EMPTY_TK_FORM);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<TkErrors>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Documents>({ photo: null, passport: null, proof: null, extra: [] });
  const [partnerRef, setPartnerRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  // Birth name defaults to the last name; only shown when the user says it differs.
  const [differentBirthName, setDifferentBirthName] = useState(false);

  const step = TK_STEPS[stepIndex].id;

  /**
   * PARTNER REF + DRAFT RESTORE
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get("ref")?.trim() || "";

    try {
      ref ||= localStorage.getItem("partner_ref") || localStorage.getItem("partnerRef") || "";
    } catch {
      // storage unavailable
    }

    setPartnerRef(ref);

    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        const saved = JSON.parse(draft) as Partial<TkFormData>;
        setData((prev) => ({ ...prev, ...saved }));
        setDifferentBirthName(!!saved.birthName && saved.birthName.trim() !== (saved.lastName || "").trim());
      }
    } catch {
      // ignore broken drafts
    }
  }, []);

  // Keep a per-tab draft (without bank details) so a refresh doesn't lose progress.
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, iban: "", bic: "" }));
    } catch {
      // storage unavailable
    }
  }, [data]);

  const set = useCallback(<K extends keyof TkFormData>(key: K, value: TkFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const err = (key: string) => errors[key];

  const scrollToFirstError = (fieldErrors: TkErrors) => {
    const first = Object.keys(fieldErrors)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const goTo = (index: number) => {
    setStepIndex(index);
    setGeneralErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateCurrent = async () => {
    if (step === "documents") return validateDocuments(documents);
    return validateTkStep(step as TkStepId, data);
  };

  const next = async () => {
    setChecking(true);
    const stepErrors = await validateCurrent();
    setChecking(false);

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      scrollToFirstError(stepErrors);
      return;
    }
    goTo(stepIndex + 1);
  };

  const back = () => goTo(Math.max(0, stepIndex - 1));

  /**
   * SUBMIT
   */
  const submit = async () => {
    const reviewErrors = validateTkStep("review", data);
    setErrors(reviewErrors);
    if (Object.keys(reviewErrors).length) {
      scrollToFirstError(reviewErrors);
      return;
    }

    setSubmitting(true);
    setGeneralErrors([]);

    try {
      const body = new FormData();
      body.append("data", JSON.stringify(data));
      body.append("partnerRef", partnerRef);
      if (documents.photo) body.append("photo", documents.photo);
      if (documents.passport) body.append("passport", documents.passport);
      if (documents.proof) body.append("proof", documents.proof);
      documents.extra.forEach((file) => body.append("extraDocuments", file));

      const response = await fetch("/api/tk-application/submit", { method: "POST", body });
      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }

        const successUrl = new URL("/insurance/success", window.location.origin);
        successUrl.searchParams.set("appId", result.applicationId || "");
        successUrl.searchParams.set("provider", "tk");
        successUrl.searchParams.set("email", data.email.trim());
        router.push(successUrl.toString());
        return;
      }

      const fieldErrors: TkErrors = result?.fieldErrors || {};
      const messages: string[] = [...(result?.generalErrors || [])];

      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        const firstStep = stepForField(Object.keys(fieldErrors)[0]);
        const index = TK_STEPS.findIndex((item) => item.id === firstStep);
        if (index >= 0 && index !== stepIndex) setStepIndex(index);
        scrollToFirstError(fieldErrors);
      }

      if (!messages.length) {
        messages.push(
          result?.message || "We couldn't submit your application right now. Please try again shortly.",
        );
      }

      setGeneralErrors(messages);
    } catch {
      setGeneralErrors(["We couldn't reach our server. Please check your connection and try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  const insuranceMin = useMemo(() => monthsFromToday(-12), []);
  const insuranceMax = useMemo(() => monthsFromToday(18), []);
  const todayIso = useMemo(() => isoDate(new Date()), []);

  const student = isStudent(data);
  const employment = isEmployment(data);
  const trainee = isTrainee(data);

  /* ------------------------------------------------------------------------ */
  /*                                   STEPS                                  */
  /* ------------------------------------------------------------------------ */

  const renderPlan = () => (
    <>
      <Section>
        <Full>
          <ChoiceField
            name="customerGroup"
            label="What applies to you?"
            required
            value={data.customerGroup}
            onChange={(value) => set("customerGroup", value)}
            options={GROUP_OPTIONS}
            error={err("customerGroup")}
          />
        </Full>
        <DateField
          name="insuranceStart"
          label="When should your insurance start?"
          required
          value={data.insuranceStart}
          min={insuranceMin}
          max={insuranceMax}
          onChange={(value) => set("insuranceStart", value)}
          hint={
            data.customerGroup
              ? `Usually the day your ${student ? "studies" : trainee ? "training" : "job"} begins.`
              : undefined
          }
          error={err("insuranceStart")}
        />
        <ChoiceField
          name="language"
          label="Preferred language for TK letters"
          required
          value={data.language}
          onChange={(value) => set("language", value)}
          options={[
            { value: "EN", label: "English" },
            { value: "DE", label: "Deutsch" },
          ]}
          error={err("language")}
        />
      </Section>

      <div className="flex items-center gap-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow">
          <img src="/icons/tk.png" alt="TK logo" className="h-10 w-auto" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Techniker Krankenkasse (TK)</p>
          <p className="text-sm text-gray-600">
            Your application is sent directly to TK through their official membership API.
          </p>
        </div>
      </div>
    </>
  );

  const renderPersonal = () => (
    <>
      <Section title="About you" description="Exactly as shown in your passport.">
        <Full>
          <ChoiceField
            name="gender"
            label="Gender"
            required
            value={data.gender}
            onChange={(value) => set("gender", value)}
            options={GENDER_OPTIONS}
            error={err("gender")}
          />
        </Full>
        <TextField
          name="firstName"
          label="First name(s)"
          required
          value={data.firstName}
          onChange={(value) => set("firstName", value)}
          maxLength={27}
          autoComplete="given-name"
          error={err("firstName")}
        />
        <TextField
          name="lastName"
          label="Last name"
          required
          value={data.lastName}
          onChange={(value) => {
            set("lastName", value);
            if (!differentBirthName) set("birthName", value);
          }}
          maxLength={27}
          autoComplete="family-name"
          error={err("lastName")}
        />
        <Full>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={differentBirthName}
              onChange={(event) => {
                setDifferentBirthName(event.target.checked);
                set("birthName", event.target.checked ? "" : data.lastName);
              }}
              className="h-4 w-4 accent-purple-600"
            />
            My last name at birth was different
          </label>
        </Full>
        {(differentBirthName || err("birthName")) && (
          <TextField
            name="birthName"
            label="Last name at birth"
            required
            value={data.birthName}
            onChange={(value) => set("birthName", value)}
            maxLength={45}
            error={err("birthName")}
          />
        )}
        <TextField
          name="title"
          label="Academic title"
          value={data.title}
          onChange={(value) => set("title", value)}
          maxLength={15}
          placeholder="e.g. Dr."
          error={err("title")}
        />
        <DateField
          name="dateOfBirth"
          label="Date of birth"
          required
          value={data.dateOfBirth}
          max={todayIso}
          onChange={(value) => set("dateOfBirth", value)}
          error={err("dateOfBirth")}
        />
        <TextField
          name="placeOfBirth"
          label="Place of birth"
          required
          value={data.placeOfBirth}
          onChange={(value) => set("placeOfBirth", value)}
          maxLength={24}
          error={err("placeOfBirth")}
        />
        <CountryField
          name="countryOfBirth"
          label="Country of birth"
          required
          value={data.countryOfBirth}
          onChange={(value) => set("countryOfBirth", value)}
          error={err("countryOfBirth")}
        />
        <CountryField
          name="nationality"
          label="Nationality"
          required
          value={data.nationality}
          onChange={(value) => set("nationality", value)}
          error={err("nationality")}
        />
      </Section>

      <Section title="Contact">
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          value={data.email}
          onChange={(value) => set("email", value)}
          maxLength={65}
          inputMode="email"
          autoComplete="email"
          hint="TK will contact you at this address."
          error={err("email")}
        />
        <TextField
          name="phone"
          label="Phone number"
          type="tel"
          required
          value={data.phone}
          onChange={(value) => set("phone", value)}
          maxLength={20}
          inputMode="tel"
          autoComplete="tel"
          placeholder="+49 151 12345678"
          error={err("phone")}
        />
      </Section>

      <Section title="Address">
        <TextField
          name="street"
          label="Street"
          required
          value={data.street}
          onChange={(value) => set("street", value)}
          maxLength={23}
          autoComplete="address-line1"
          error={err("street")}
        />
        <TextField
          name="houseNumber"
          label="House number"
          required
          value={data.houseNumber}
          onChange={(value) => set("houseNumber", value)}
          maxLength={8}
          placeholder="e.g. 12a"
          error={err("houseNumber")}
        />
        <TextField
          name="postalCode"
          label="Postal code"
          required
          value={data.postalCode}
          onChange={(value) => set("postalCode", value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          autoComplete="postal-code"
          error={err("postalCode")}
        />
        <TextField
          name="city"
          label="City"
          required
          value={data.city}
          onChange={(value) => set("city", value)}
          maxLength={35}
          autoComplete="address-level2"
          error={err("city")}
        />
        <Full>
          <TextField
            name="addressExtra"
            label="Address supplement"
            value={data.addressExtra}
            onChange={(value) => set("addressExtra", value)}
            maxLength={35}
            placeholder="e.g. c/o Name, Apartment 4"
            error={err("addressExtra")}
          />
        </Full>
      </Section>

      <Section title="Personal circumstances">
        <YesNoField
          name="hasChildren"
          label="Do you have children?"
          required
          value={data.hasChildren}
          onChange={(value) => set("hasChildren", value)}
          error={err("hasChildren")}
        />
        <YesNoField
          name="coInsureFamily"
          label="Should family members be co-insured?"
          required
          value={data.coInsureFamily}
          onChange={(value) => set("coInsureFamily", value)}
          hint="TK will send you a separate family insurance form."
          error={err("coInsureFamily")}
        />
        <YesNoField
          name="receivesCivilServicePension"
          label="Do you receive pension benefits from a former employer (Versorgungsbezüge)?"
          required
          value={data.receivesCivilServicePension}
          onChange={(value) => set("receivesCivilServicePension", value)}
          error={err("receivesCivilServicePension")}
        />
        {!student && (
          <>
            <YesNoField
              name="receivesPension"
              label="Do you receive a statutory pension?"
              required
              value={data.receivesPension}
              onChange={(value) => set("receivesPension", value)}
              error={err("receivesPension")}
            />
            <YesNoField
              name="exemptFromKvPv"
              label="Have you been exempted from statutory health / care insurance?"
              required
              value={data.exemptFromKvPv}
              onChange={(value) => set("exemptFromKvPv", value)}
              error={err("exemptFromKvPv")}
            />
          </>
        )}
      </Section>
    </>
  );

  const renderInsurance = () => (
    <Section title="Your insurance history">
      <Full>
        <ChoiceField
          name="livedAbroad"
          label="Where were you insured until now?"
          required
          value={
            data.neverInsured ? "never" : data.livedAbroad === true ? "abroad" : data.livedAbroad === false ? "germany" : ""
          }
          onChange={(value) => {
            set("neverInsured", value === "never");
            set("livedAbroad", value === "germany" ? false : true);
          }}
          options={[
            { value: "abroad", label: "Outside Germany" },
            { value: "germany", label: "In Germany" },
            { value: "never", label: "I've never had health insurance" },
          ]}
          error={err("livedAbroad")}
        />
      </Full>

      {(data.livedAbroad === true || data.neverInsured) && (
        <CountryField
          name="lastInsuranceCountry"
          label={data.neverInsured ? "Which country did you live in before?" : "Country"}
          required
          value={data.lastInsuranceCountry}
          onChange={(value) => set("lastInsuranceCountry", value)}
          error={err("lastInsuranceCountry")}
        />
      )}

      {requiresManualProcessing(data) && (
        <Full>
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            No problem – our team will submit your application to TK personally and contact you if anything else is
            needed.
          </p>
        </Full>
      )}

      {needsPreviousInsurer(data) && (
        <>
          <TextField
            name="previousInsurerName"
            label="Name of your last health insurer"
            required
            value={data.previousInsurerName}
            onChange={(value) => set("previousInsurerName", value)}
            maxLength={45}
            error={err("previousInsurerName")}
          />
          <ChoiceField
            name="previousInsuranceType"
            label="Type of that insurance"
            required
            value={data.previousInsuranceType}
            onChange={(value) => set("previousInsuranceType", value)}
            options={[
              { value: "gesetzlich", label: "Public / statutory" },
              { value: "privat", label: "Private" },
            ]}
            error={err("previousInsuranceType")}
          />
        </>
      )}

      {!data.neverInsured && data.livedAbroad === false && data.previousInsuranceType === "gesetzlich" && (
        <>
          <YesNoField
            name="selfInsured"
            label="Were you a member in your own right (not family-insured)?"
            required
            value={data.selfInsured}
            onChange={(value) => set("selfInsured", value)}
            error={err("selfInsured")}
          />
          {data.selfInsured === true && (
            <YesNoField
              name="compulsorilyInsured"
              label="Were you compulsorily insured (e.g. as employee or student)?"
              required
              value={data.compulsorilyInsured}
              onChange={(value) => set("compulsorilyInsured", value)}
              error={err("compulsorilyInsured")}
            />
          )}
        </>
      )}

      {!data.neverInsured && data.livedAbroad === false && (
        <TextField
          name="insuranceNumber"
          label="Health insurance number (optional)"
          value={data.insuranceNumber}
          onChange={(value) => set("insuranceNumber", value.toUpperCase())}
          maxLength={10}
          placeholder="A123456789"
          hint="Shown on your German health insurance card."
          error={err("insuranceNumber")}
        />
      )}

    </Section>
  );

  const renderStudent = () => (
    <>
      <Section title="Your studies">
        <TextField
          name="university"
          label="University"
          required
          value={data.university}
          onChange={(value) => set("university", value)}
          maxLength={45}
          error={err("university")}
        />
        <DateField
          name="studyStart"
          label="Start of studies (semester start)"
          required
          value={data.studyStart}
          max={insuranceMax}
          onChange={(value) => set("studyStart", value)}
          error={err("studyStart")}
        />
        <YesNoField
          name="exemptFromKv"
          label="Have you been exempted from statutory health insurance for students?"
          required
          value={data.exemptFromKv}
          onChange={(value) => set("exemptFromKv", value)}
          error={err("exemptFromKv")}
        />
        <YesNoField
          name="unemploymentBenefits"
          label="Do you receive benefits from the employment agency (Agentur für Arbeit)?"
          required
          value={data.unemploymentBenefits}
          onChange={(value) => set("unemploymentBenefits", value)}
          error={err("unemploymentBenefits")}
        />
        <YesNoField
          name="benefitsInKind"
          label="Are you entitled to benefits in kind from another insurance (e.g. via your home country)?"
          required
          value={data.benefitsInKind}
          onChange={(value) => set("benefitsInKind", value)}
          error={err("benefitsInKind")}
        />
      </Section>

      <Section title="Work during your studies">
        <YesNoField
          name="studentEmployed"
          label="Are you employed alongside your studies?"
          required
          value={data.studentEmployed}
          onChange={(value) => set("studentEmployed", value)}
          error={err("studentEmployed")}
        />
        <YesNoField
          name="studentSelfEmployed"
          label="Are you self-employed alongside your studies?"
          required
          value={data.studentSelfEmployed}
          onChange={(value) => set("studentSelfEmployed", value)}
          error={err("studentSelfEmployed")}
        />

        {(data.studentEmployed === true || data.studentSelfEmployed === true) && (
          <>
            <TextField
              name="studyHoursPerWeek"
              label="Average study time (hours / week)"
              required
              value={data.studyHoursPerWeek}
              onChange={(value) => set("studyHoursPerWeek", value)}
              inputMode="decimal"
              error={err("studyHoursPerWeek")}
            />
            <YesNoField
              name="workDuringBreaks"
              label="Do you work mainly during semester breaks?"
              required
              value={data.workDuringBreaks}
              onChange={(value) => set("workDuringBreaks", value)}
              error={err("workDuringBreaks")}
            />
          </>
        )}

        {data.studentEmployed === true && (
          <>
            <TextField
              name="workHoursPerWeek"
              label="Average working time (hours / week)"
              required
              value={data.workHoursPerWeek}
              onChange={(value) => set("workHoursPerWeek", value)}
              inputMode="decimal"
              error={err("workHoursPerWeek")}
            />
            <TextField
              name="monthlyGrossSalary"
              label="Monthly gross salary (EUR)"
              required
              value={data.monthlyGrossSalary}
              onChange={(value) => set("monthlyGrossSalary", value)}
              inputMode="decimal"
              error={err("monthlyGrossSalary")}
            />
            <YesNoField
              name="internship"
              label="Is it an internship?"
              required
              value={data.internship}
              onChange={(value) => set("internship", value)}
              error={err("internship")}
            />
          </>
        )}

        {data.studentSelfEmployed === true && (
          <>
            <TextField
              name="studentSelfEmployedHours"
              label="Self-employed work (hours / week)"
              required
              value={data.studentSelfEmployedHours}
              onChange={(value) => set("studentSelfEmployedHours", value)}
              inputMode="decimal"
              error={err("studentSelfEmployedHours")}
            />
            <TextField
              name="studentSelfEmployedIncome"
              label="Monthly self-employed income (EUR)"
              required
              value={data.studentSelfEmployedIncome}
              onChange={(value) => set("studentSelfEmployedIncome", value)}
              inputMode="decimal"
              error={err("studentSelfEmployedIncome")}
            />
            <YesNoField
              name="studentSelfEmployedHasEmployees"
              label="Do you employ staff?"
              required
              value={data.studentSelfEmployedHasEmployees}
              onChange={(value) => set("studentSelfEmployedHasEmployees", value)}
              error={err("studentSelfEmployedHasEmployees")}
            />
            {data.studentSelfEmployedHasEmployees === true && (
              <YesNoField
                name="studentSelfEmployedMinijobEmployees"
                label="Are they employed on a minijob basis?"
                required
                value={data.studentSelfEmployedMinijobEmployees}
                onChange={(value) => set("studentSelfEmployedMinijobEmployees", value)}
                error={err("studentSelfEmployedMinijobEmployees")}
              />
            )}
          </>
        )}
      </Section>

      <Section title="Pension">
        <YesNoField
          name="pension"
          label="Do you receive a pension (e.g. orphan's pension)?"
          required
          value={data.pension}
          onChange={(value) => set("pension", value)}
          error={err("pension")}
        />
        {data.pension === true && (
          <SelectField
            name="pensionType"
            label="Type of pension"
            required
            value={data.pensionType}
            onChange={(value) => set("pensionType", value as TkPensionType)}
            options={(Object.keys(PENSION_TYPE_LABELS) as TkPensionType[]).map((value) => ({
              value,
              label: PENSION_TYPE_LABELS[value],
            }))}
            error={err("pensionType")}
          />
        )}
        {data.pension === true && data.pensionType === "SONSTIGE" && (
          <TextField
            name="pensionName"
            label="Name of the pension"
            required
            value={data.pensionName}
            onChange={(value) => set("pensionName", value)}
            maxLength={50}
            error={err("pensionName")}
          />
        )}
      </Section>

      <Section
        title="Direct debit (optional)"
        description="Let TK collect your monthly student contribution by SEPA direct debit. You can also set this up with TK later."
      >
        <Full>
          <CheckboxField name="sepaEnabled" checked={data.sepaEnabled} onChange={(value) => set("sepaEnabled", value)}>
            Yes, I want to pay my TK contribution by SEPA direct debit.
          </CheckboxField>
        </Full>

        {data.sepaEnabled && (
          <>
            <TextField
              name="iban"
              label="IBAN"
              required
              value={data.iban}
              onChange={(value) => set("iban", value.toUpperCase())}
              maxLength={42}
              placeholder="DE00 0000 0000 0000 0000 00"
              error={err("iban")}
            />
            <TextField
              name="bic"
              label="BIC"
              value={data.bic}
              onChange={(value) => set("bic", value.toUpperCase())}
              maxLength={11}
              hint="Only required for non-German bank accounts."
              error={err("bic")}
            />
            <Full>
              <ChoiceField
                name="accountHolderIsApplicant"
                label="Who holds the account?"
                required
                value={data.accountHolderIsApplicant ? "me" : "other"}
                onChange={(value) => set("accountHolderIsApplicant", value === "me")}
                options={[
                  { value: "me", label: "I do" },
                  { value: "other", label: "Someone else (e.g. a parent)" },
                ]}
              />
            </Full>

            {!data.accountHolderIsApplicant && (
              <>
                <Full>
                  <ChoiceField
                    name="holderGender"
                    label="Account holder gender"
                    required
                    value={data.holderGender}
                    onChange={(value) => set("holderGender", value)}
                    options={GENDER_OPTIONS}
                    error={err("holderGender")}
                  />
                </Full>
                <TextField
                  name="holderFirstName"
                  label="Account holder first name"
                  required
                  value={data.holderFirstName}
                  onChange={(value) => set("holderFirstName", value)}
                  maxLength={27}
                  error={err("holderFirstName")}
                />
                <TextField
                  name="holderLastName"
                  label="Account holder last name"
                  required
                  value={data.holderLastName}
                  onChange={(value) => set("holderLastName", value)}
                  maxLength={27}
                  error={err("holderLastName")}
                />
                <TextField
                  name="holderStreet"
                  label="Street"
                  required
                  value={data.holderStreet}
                  onChange={(value) => set("holderStreet", value)}
                  maxLength={23}
                  error={err("holderStreet")}
                />
                <TextField
                  name="holderHouseNumber"
                  label="House number"
                  required
                  value={data.holderHouseNumber}
                  onChange={(value) => set("holderHouseNumber", value)}
                  maxLength={8}
                  error={err("holderHouseNumber")}
                />
                <TextField
                  name="holderPostalCode"
                  label="Postal code"
                  required
                  value={data.holderPostalCode}
                  onChange={(value) => set("holderPostalCode", value)}
                  maxLength={10}
                  error={err("holderPostalCode")}
                />
                <TextField
                  name="holderCity"
                  label="City"
                  required
                  value={data.holderCity}
                  onChange={(value) => set("holderCity", value)}
                  maxLength={35}
                  error={err("holderCity")}
                />
                <CountryField
                  name="holderCountry"
                  label="Country"
                  required
                  value={data.holderCountry}
                  onChange={(value) => set("holderCountry", value)}
                  error={err("holderCountry")}
                />
              </>
            )}

            <Full>
              <CheckboxField
                name="sepaConsent"
                checked={data.sepaConsent}
                onChange={(value) => set("sepaConsent", value)}
                error={err("sepaConsent")}
              >
                I authorise Techniker Krankenkasse to collect the monthly contributions from this account by SEPA
                direct debit and instruct my bank to honour these debits.
              </CheckboxField>
            </Full>
          </>
        )}
      </Section>
    </>
  );

  const employerFields = (required: boolean) => (
    <Section
      title={trainee ? "Training company" : "Employer"}
      description={required ? undefined : "Optional – helps TK process your application faster."}
    >
      <Full>
        <TextField
          name="employerName"
          label={trainee ? "Training company name" : "Employer name"}
          required={required}
          value={data.employerName}
          onChange={(value) => set("employerName", value)}
          maxLength={45}
          error={err("employerName")}
        />
      </Full>
      <TextField
        name="employerStreet"
        label="Street"
        required={required}
        value={data.employerStreet}
        onChange={(value) => set("employerStreet", value)}
        maxLength={23}
        error={err("employerStreet")}
      />
      <TextField
        name="employerHouseNumber"
        label="House number"
        required={required}
        value={data.employerHouseNumber}
        onChange={(value) => set("employerHouseNumber", value)}
        maxLength={8}
        error={err("employerHouseNumber")}
      />
      <TextField
        name="employerPostalCode"
        label="Postal code"
        required={required}
        value={data.employerPostalCode}
        onChange={(value) => set("employerPostalCode", value.replace(/\D/g, "").slice(0, 5))}
        inputMode="numeric"
        error={err("employerPostalCode")}
      />
      <TextField
        name="employerCity"
        label="City"
        required={required}
        value={data.employerCity}
        onChange={(value) => set("employerCity", value)}
        maxLength={35}
        error={err("employerCity")}
      />
    </Section>
  );

  const renderEmployment = () => (
    <>
      <Section title="Your employment">
        <DateField
          name="employmentStart"
          label="Employment start date"
          required
          value={data.employmentStart}
          max={insuranceMax}
          onChange={(value) => set("employmentStart", value)}
          error={err("employmentStart")}
        />
        <TextField
          name="monthlySalary"
          label="Monthly gross salary (EUR)"
          required
          value={data.monthlySalary}
          onChange={(value) => set("monthlySalary", value)}
          inputMode="decimal"
          error={err("monthlySalary")}
        />
        <Full>
          <ChoiceField
            name="salaryClass"
            label="Salary class"
            required
            value={data.salaryClass}
            onChange={(value) => set("salaryClass", value)}
            options={[
              { value: "versicherungspflichtig", label: "Standard", description: "Most employees" },
              { value: "ueber-jaeg", label: "High earner", description: "Salary above the annual income limit (JAEG)" },
            ]}
            error={err("salaryClass")}
          />
        </Full>
        <YesNoField
          name="firstEmployment"
          label="Is this your first job in Germany?"
          required
          value={data.firstEmployment}
          onChange={(value) => set("firstEmployment", value)}
          error={err("firstEmployment")}
        />
        <YesNoField
          name="managingDirector"
          label="Are you a managing director (Geschäftsführer) of the company?"
          required
          value={data.managingDirector}
          onChange={(value) => set("managingDirector", value)}
          error={err("managingDirector")}
        />
        <YesNoField
          name="employeeSelfEmployed"
          label="Are you also self-employed?"
          required
          value={data.employeeSelfEmployed}
          onChange={(value) => set("employeeSelfEmployed", value)}
          error={err("employeeSelfEmployed")}
        />
      </Section>

      {data.employeeSelfEmployed === true && (
        <Section title="Self-employment">
          <YesNoField
            name="businessFounder"
            label="Are you a business founder (start-up phase)?"
            required
            value={data.businessFounder}
            onChange={(value) => set("businessFounder", value)}
            error={err("businessFounder")}
          />
          <YesNoField
            name="employsWorkers"
            label="Do you employ staff?"
            required
            value={data.employsWorkers}
            onChange={(value) => set("employsWorkers", value)}
            error={err("employsWorkers")}
          />
          <YesNoField
            name="employsMultipleMinijobbers"
            label="Do you employ several minijobbers?"
            required
            value={data.employsMultipleMinijobbers}
            onChange={(value) => set("employsMultipleMinijobbers", value)}
            error={err("employsMultipleMinijobbers")}
          />
          <TextField
            name="selfEmployedHoursPerWeek"
            label="Self-employed work (hours / week)"
            required
            value={data.selfEmployedHoursPerWeek}
            onChange={(value) => set("selfEmployedHoursPerWeek", value)}
            inputMode="decimal"
            error={err("selfEmployedHoursPerWeek")}
          />
          <TextField
            name="selfEmployedMonthlyIncome"
            label="Monthly self-employed income (EUR)"
            required
            value={data.selfEmployedMonthlyIncome}
            onChange={(value) => set("selfEmployedMonthlyIncome", value)}
            inputMode="decimal"
            error={err("selfEmployedMonthlyIncome")}
          />
          <TextField
            name="employeeHoursPerWeek"
            label="Employed work (hours / week)"
            required
            value={data.employeeHoursPerWeek}
            onChange={(value) => set("employeeHoursPerWeek", value)}
            inputMode="decimal"
            error={err("employeeHoursPerWeek")}
          />
        </Section>
      )}

      {employerFields(data.customerGroup === "SAISONBESCHAEFTIGTE")}
    </>
  );

  const renderTrainee = () => (
    <>
      <Section title="Your training">
        <DateField
          name="trainingStart"
          label="Training start date"
          required
          value={data.trainingStart}
          max={insuranceMax}
          onChange={(value) => set("trainingStart", value)}
          error={err("trainingStart")}
        />
        <YesNoField
          name="socialSecurityCardRequested"
          label="Have you already applied for a social security card (Sozialversicherungsausweis)?"
          required
          value={data.socialSecurityCardRequested}
          onChange={(value) => set("socialSecurityCardRequested", value)}
          error={err("socialSecurityCardRequested")}
        />
      </Section>
      {employerFields(false)}
    </>
  );

  const renderDetails = () => {
    if (student) return renderStudent();
    if (employment) return renderEmployment();
    if (trainee) return renderTrainee();
    return null;
  };

  const renderDocuments = () => (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        These are sent to TK together with your application. Max. 10 MB per file.
      </p>
      <FileField
        name="photo"
        label="Passport photo"
        description="For your TK health card – JPG, PNG or TIFF, at least 300 × 400 px, plain background."
        accept="image/jpeg,image/png,image/tiff"
        required
        files={documents.photo ? [documents.photo] : []}
        onAdd={([file]) => {
          setDocuments((prev) => ({ ...prev, photo: file }));
          setErrors((prev) => ({ ...prev, photo: undefined }));
        }}
        onRemove={() => setDocuments((prev) => ({ ...prev, photo: null }))}
        error={err("photo")}
      />
      <FileField
        name="passport"
        label="Passport copy"
        description="Page with your photo and personal details – PDF or image."
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.bmp,.tif,.tiff,.txt"
        required
        files={documents.passport ? [documents.passport] : []}
        onAdd={([file]) => {
          setDocuments((prev) => ({ ...prev, passport: file }));
          setErrors((prev) => ({ ...prev, passport: undefined }));
        }}
        onRemove={() => setDocuments((prev) => ({ ...prev, passport: null }))}
        error={err("passport")}
      />
      <FileField
        name="proof"
        label={proofLabel(data.customerGroup)}
        description="PDF or image."
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.bmp,.tif,.tiff,.txt"
        required
        files={documents.proof ? [documents.proof] : []}
        onAdd={([file]) => {
          setDocuments((prev) => ({ ...prev, proof: file }));
          setErrors((prev) => ({ ...prev, proof: undefined }));
        }}
        onRemove={() => setDocuments((prev) => ({ ...prev, proof: null }))}
        error={err("proof")}
      />
      <FileField
        name="extraDocuments"
        label="Additional documents"
        description={`Optional – e.g. visa, previous insurance certificate. Up to ${TK_FILE_RULES.maxExtraDocuments} files.`}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.bmp,.tif,.tiff,.txt"
        multiple
        files={documents.extra}
        onAdd={(files) => {
          setDocuments((prev) => ({ ...prev, extra: [...prev.extra, ...files].slice(0, TK_FILE_RULES.maxExtraDocuments) }));
          setErrors((prev) => ({ ...prev, extraDocuments: undefined }));
        }}
        onRemove={(index) =>
          setDocuments((prev) => ({ ...prev, extra: prev.extra.filter((_, i) => i !== index) }))
        }
        error={err("extraDocuments")}
      />
    </div>
  );

  const summary: { step: number; title: string; rows: [string, string][] }[] = [
    {
      step: 0,
      title: "Plan",
      rows: [
        ["Situation", data.customerGroup ? CUSTOMER_GROUP_LABELS[data.customerGroup] : "–"],
        ["Insurance start", formatDate(data.insuranceStart)],
        ["Language", data.language === "DE" ? "Deutsch" : "English"],
      ],
    },
    {
      step: 1,
      title: "Personal",
      rows: [
        ["Name", `${data.title ? `${data.title} ` : ""}${data.firstName} ${data.lastName}`.trim()],
        ["Birth name", data.birthName],
        ["Date of birth", formatDate(data.dateOfBirth)],
        ["Born in", `${data.placeOfBirth}, ${countryName(data.countryOfBirth)}`],
        ["Nationality", countryName(data.nationality)],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Address", `${data.street} ${data.houseNumber}, ${data.postalCode} ${data.city}`],
        ["Children", yesNoText(data.hasChildren)],
      ],
    },
    {
      step: 2,
      title: "Insurance history",
      rows: [
        [
          "Insured until now",
          data.neverInsured
            ? `Never insured (lived in ${countryName(data.lastInsuranceCountry)})`
            : data.livedAbroad === true
            ? `Outside Germany (${countryName(data.lastInsuranceCountry)})`
            : data.livedAbroad === false
              ? "In Germany"
              : "–",
        ],
        ...(needsPreviousInsurer(data)
          ? ([
              ["Previous insurer", data.previousInsurerName],
              ["Type", data.previousInsuranceType === "privat" ? "Private" : "Public"],
            ] as [string, string][])
          : []),
      ],
    },
    {
      step: 3,
      title: student ? "Studies" : trainee ? "Training" : "Employment",
      rows: student
        ? [
            ["University", data.university],
            ["Study start", formatDate(data.studyStart)],
            ["Employed", yesNoText(data.studentEmployed)],
            ["Direct debit", data.sepaEnabled ? `Yes (${data.iban.replace(/\s+/g, "").slice(-4).padStart(8, "•")})` : "No"],
          ]
        : trainee
          ? [
              ["Training start", formatDate(data.trainingStart)],
              ["Training company", data.employerName || "–"],
            ]
          : [
              ["Employment start", formatDate(data.employmentStart)],
              ["Monthly salary", data.monthlySalary ? `€${data.monthlySalary}` : "–"],
              ["Employer", data.employerName || "–"],
            ],
    },
    {
      step: 4,
      title: "Documents",
      rows: [
        ["Photo", documents.photo?.name || "–"],
        ["Passport", documents.passport?.name || "–"],
        ["Proof", documents.proof?.name || "–"],
        ["Additional", documents.extra.length ? `${documents.extra.length} file(s)` : "–"],
      ],
    },
  ];

  const renderReview = () => (
    <>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {summary.map((card) => (
          <div key={card.title} className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <button
                type="button"
                onClick={() => goTo(card.step)}
                className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
              </button>
            </div>
            <dl className="space-y-1.5 text-sm">
              {card.rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-gray-500">{label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-gray-900">{value || "–"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <CheckboxField
          name="brokerMandate"
          checked={data.brokerMandate}
          onChange={(value) => set("brokerMandate", value)}
          error={err("brokerMandate")}
        >
          I authorise InsurBe as my insurance broker to submit this membership application to Techniker Krankenkasse
          on my behalf and to receive status updates about it (extended broker mandate).
        </CheckboxField>
        <CheckboxField
          name="legalNotice"
          checked={data.legalNotice}
          onChange={(value) => set("legalNotice", value)}
          error={err("legalNotice")}
        >
          I confirm that all information is correct and complete. I am aware that incorrect information can affect my
          insurance cover and contributions.
        </CheckboxField>
        <CheckboxField
          name="dataConsent"
          checked={data.dataConsent}
          onChange={(value) => set("dataConsent", value)}
          error={err("dataConsent")}
        >
          I agree that InsurBe processes my data and documents and transmits them to TK for this application, as
          described in the{" "}
          <a href="/privacypolicy" target="_blank" className="font-medium text-purple-700 underline">
            privacy policy
          </a>
          .
        </CheckboxField>
        <CheckboxField name="tkWelcomeMail" checked={data.tkWelcomeMail} onChange={(value) => set("tkWelcomeMail", value)}>
          Optional: I would like to receive TK&apos;s welcome programme emails in English.
        </CheckboxField>
      </div>
    </>
  );

  const content: Record<(typeof TK_STEPS)[number]["id"], () => ReactNode> = {
    plan: renderPlan,
    personal: renderPersonal,
    insurance: renderInsurance,
    details: renderDetails,
    documents: renderDocuments,
    review: renderReview,
  };

  const isLast = stepIndex === TK_STEPS.length - 1;

  // Warn early if the chosen dates already conflict.
  const dateConflict =
    step === "details" &&
    !!parseIsoDate(activityStart(data)) &&
    !!parseIsoDate(data.insuranceStart) &&
    (parseIsoDate(data.insuranceStart) as Date) < (parseIsoDate(activityStart(data)) as Date);

  return (
    <section className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Apply for{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">TK</span> public
            health insurance
          </h1>
          <p className="mt-2 text-gray-600">Takes about 10 minutes. Have your passport and documents ready.</p>
        </motion.div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-10">
          {/* STEPPER */}
          <ol className="mb-10 flex items-center justify-between gap-1">
            {TK_STEPS.map((item, index) => (
              <li key={item.id} className="flex flex-1 items-center gap-2 last:flex-none">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    index < stepIndex
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : index === stepIndex
                        ? "border-2 border-purple-600 bg-purple-50 text-purple-600"
                        : "bg-gray-200 text-gray-400"
                  }`}
                  aria-current={index === stepIndex ? "step" : undefined}
                >
                  {index < stepIndex ? "✓" : index + 1}
                </div>
                <span className="hidden text-sm text-gray-600 lg:block">{item.label}</span>
                {index < TK_STEPS.length - 1 && <span className="mx-1 hidden h-px flex-1 bg-gray-200 sm:block" />}
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">{TK_STEPS[stepIndex].label}</h2>

              {dateConflict && (
                <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Your insurance start ({formatDate(data.insuranceStart)}) is before this start date. TK requires the
                  insurance to start on or after it –{" "}
                  <button type="button" className="font-semibold underline" onClick={() => goTo(0)}>
                    change insurance start
                  </button>
                  .
                </p>
              )}

              {content[step]()}
            </motion.div>
          </AnimatePresence>

          {generalErrors.length > 0 && (
            <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {generalErrors.map((message) => (
                <p key={message} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {message}
                </p>
              ))}
            </div>
          )}

          {/* NAVIGATION */}
          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={back}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={isLast ? submit : next}
              disabled={submitting || checking || (step === "details" && !data.customerGroup)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Submitting to TK…
                </>
              ) : isLast ? (
                <>
                  <Shield className="h-5 w-5" /> Submit application
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
