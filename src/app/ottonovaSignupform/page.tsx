"use client";

import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import SignatureCanvas from "react-signature-canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Heart,
  Activity,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building2,
  GraduationCap,
  Ruler,
  Weight as WeightIcon,
  Sparkles,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  // Step 1: Email & Phone Verification
  email: string;
  confirmEmail: string;
  phoneNumber: string;
  confirmPhoneNumber: string;

  // Step 2: Personal Information
  firstName: string;
  lastName: string;
  birthday: string;
  nationality: string;
  permanentResidencePermit: string;
  temporaryResidencePermitSince: string;
  inGermanySince: string;
  address: string;
  city: string;
  postalCode: string;

  // Step 3: Previous Insurance
  currentInsuranceStatus: string;
  insuranceCompanyName: string;
  insuranceCountry: string;
  insuredSince: string;
  insurancePolicyCancelled: string;

  // Step 4: Occupation/Study
  occupationStatus: string;
  university: string;
  courseOfStudy: string;
  studyStartDate: string;
  studyEndDate: string;

  // Step 5: Health Information (Basic)
  gender: string;
  height: string;
  weight: string;

  // Step 6: Health Questions (Detailed)
  healthQ1: string; // Allergies
  healthQ2: string; // Treatments/examinations
  healthQ3: string; // Addiction treatment
  healthQ4: string; // Medication
  healthQ5: string; // HIV
  healthQ6: string; // Chronic illnesses
  healthQ7: string; // Impairments
  healthQ7_1: string; // Prosthesis
  healthQ7_2: string; // Hearing aid
  healthQ7_3: string; // Infertility
  healthQ7_4: string; // Body implant
  healthQ7_5: string; // Missing teeth
  healthQ7_6: string; // Disability/deformity
  healthQ7_7: string; // Reduced earning capacity
  healthQ8: string; // Cancer treatments
  healthQ9: string; // Scheduled treatments
  healthQ10: string; // Mental health
  healthQ11: string; // Hospitalization
  section19Accepted: boolean; // Section 19a acceptance

  // Step 7: Insurance Plan Selection
  selectedPlan: string;
  insuranceStartDate: string;

  // Terms
  acceptTerms: boolean;
  acceptMarketing: boolean;
  grantImmediateExecution: boolean;
  confirmHealthPackage: boolean;
  consultationProtocol: boolean;
  confirmCorrectInformation: boolean;
  authorizeInsurBe: boolean;
  insuranceContractDocuments: boolean;
  healthDataDeclaration: boolean;
  signatureConsent: boolean;
}

// Types
interface CountryAPI {
  name: { common: string };
  flags: { svg: string; png: string };
  cca2: string;
}

interface Country {
  name: string;
  flag: string | null;
  code: string;
}

const COUNTRIES_CACHE_KEY = "countries_cache_v2";
const COUNTRIES_CACHE_DURATION = 24 * 60 * 60 * 1000;

const getValidFlagUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (
    normalized.startsWith("/") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }
  return null;
};

const normalizeCountry = (entry: unknown): Country | null => {
  if (!entry || typeof entry !== "object") return null;

  const source = entry as {
    name?: { common?: unknown } | unknown;
    flags?: { svg?: unknown; png?: unknown };
    flag?: unknown;
    cca2?: unknown;
    code?: unknown;
  };

  const name =
    typeof source.name === "object" &&
    source.name !== null &&
    "common" in source.name &&
    typeof source.name.common === "string"
      ? source.name.common.trim()
      : typeof source.name === "string"
        ? source.name.trim()
        : "";

  const code =
    typeof source.cca2 === "string"
      ? source.cca2.trim()
      : typeof source.code === "string"
        ? source.code.trim()
        : "";

  if (!name || !code) return null;

  return {
    name,
    code,
    flag:
      getValidFlagUrl(source.flags?.svg) ??
      getValidFlagUrl(source.flags?.png) ??
      getValidFlagUrl(source.flag),
  };
};

export default function ComprehensiveInsuranceForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    email: "",
    confirmEmail: "",
    phoneNumber: "",
    confirmPhoneNumber: "",

    // Step 2
    firstName: "",
    lastName: "",
    birthday: "",
    nationality: "",
    permanentResidencePermit: "",
    temporaryResidencePermitSince: "",
    inGermanySince: "",
    address: "",
    city: "",
    postalCode: "",

    // Step 3
    currentInsuranceStatus: "",
    insuranceCompanyName: "",
    insuranceCountry: "",
    insuredSince: "",
    insurancePolicyCancelled: "",

    // Step 4
    occupationStatus: "",
    university: "",
    courseOfStudy: "",
    studyStartDate: "",
    studyEndDate: "",

    // Step 5
    gender: "",
    height: "",
    weight: "",

    // Step 6
    healthQ1: "",
    healthQ2: "",
    healthQ3: "",
    healthQ4: "",
    healthQ5: "",
    healthQ6: "",
    healthQ7: "",
    healthQ7_1: "",
    healthQ7_2: "",
    healthQ7_3: "",
    healthQ7_4: "",
    healthQ7_5: "",
    healthQ7_6: "",
    healthQ7_7: "",
    healthQ8: "",
    healthQ9: "",
    healthQ10: "",
    healthQ11: "",
    section19Accepted: false,

    // Step 7
    selectedPlan: "study-protect",
    insuranceStartDate: "",

    // Terms
    acceptTerms: false,
    acceptMarketing: false,
    // General
    grantImmediateExecution: false,

    // Health Insurance
    confirmHealthPackage: false,
    consultationProtocol: false,
    confirmCorrectInformation: false,
    healthDataDeclaration: false,
    insuranceContractDocuments: false,
    authorizeInsurBe: false,
    signatureConsent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [signatureError, setSignatureError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{
    title: string;
    price: string;
    category: string;
    age: string;
    degree: string;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPlan");
    if (stored) {
      setSelectedPlan(JSON.parse(stored));
    }
  }, []);

  // Add this useEffect to fetch countries
  useEffect(() => {
    let isMounted = true;

    async function fetchCountries() {
      try {
        const cached = localStorage.getItem(COUNTRIES_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached) as {
            data?: unknown;
            timestamp?: unknown;
          };
          const sanitizedCached = Array.isArray(data)
            ? data
                .map((item) => normalizeCountry(item))
                .filter((item): item is Country => Boolean(item))
            : [];
          if (
            typeof timestamp === "number" &&
            Date.now() - timestamp < COUNTRIES_CACHE_DURATION &&
            sanitizedCached.length
          ) {
            if (isMounted) setCountries(sanitizedCached);
            return;
          }
        }

        const res = await fetch("/api/countries?fields=name,flags,cca2");

        const data: CountryAPI[] = await res.json();

        const list = data
          .map((c) => normalizeCountry(c))
          .filter((c): c is Country => Boolean(c))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (isMounted) {
          setCountries(list);
          localStorage.setItem(
            COUNTRIES_CACHE_KEY,
            JSON.stringify({ data: list, timestamp: Date.now() }),
          );
        }
      } catch (e) {
        console.error("Error loading countries", e);
      }
    }

    fetchCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  // Validation
  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // STEP 1 – Personal Info
    if (currentStep === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email format";

      if (!formData.phoneNumber)
        newErrors.phoneNumber = "Phone number is required";

      if (!formData.firstName) newErrors.firstName = "First name is required";

      if (!formData.lastName) newErrors.lastName = "Last name is required";

      if (!formData.birthday) {
        newErrors.birthday = "Birthday is required";
      } else {
        const birthDate = new Date(formData.birthday);
        const today = new Date();

        const age =
          today.getFullYear() -
          birthDate.getFullYear() -
          (today <
          new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate(),
          )
            ? 1
            : 0);

        if (age <= 20) {
          newErrors.birthday = "Enter a valid date";
        }
      }

      if (!formData.nationality)
        newErrors.nationality = "Nationality is required";

      if (!formData.address) newErrors.address = "Address is required";

      if (!formData.city) newErrors.city = "City is required";

      if (!formData.postalCode)
        newErrors.postalCode = "Postal code is required";
    }

    // STEP 2 – Previous Insurance
    if (currentStep === 2) {
      if (!formData.currentInsuranceStatus)
        newErrors.currentInsuranceStatus = "Please select insurance status";
    }

    // STEP 3 – Occupation
    if (currentStep === 3) {
      if (!formData.occupationStatus)
        newErrors.occupationStatus = "Occupation status is required";

      if (formData.occupationStatus === "Student") {
        if (!formData.university)
          newErrors.university = "University is required";
        if (!formData.courseOfStudy)
          newErrors.courseOfStudy = "Course of study is required";
        if (!formData.studyStartDate)
          newErrors.studyStartDate = "Study start date is required";
      }
    }

    // STEP 4 – Health Basic
    if (currentStep === 4) {
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.height) newErrors.height = "Height is required";
      if (!formData.weight) newErrors.weight = "Weight is required";
    }

    // STEP 5 – Health Detailed
    if (currentStep === 5) {
      const questions = [
        "healthQ1",
        "healthQ2",
        "healthQ3",
        "healthQ4",
        "healthQ5",
        "healthQ6",
        "healthQ7",
        "healthQ8",
        "healthQ9",
        "healthQ10",
        "healthQ11",
        "section19Accepted",
      ] as const;

      questions.forEach((q) => {
        if (!formData[q]) {
          newErrors[q] = "Please answer this question";
        }
      });

      if (formData.healthQ7 === "Yes") {
        const subs = [
          "healthQ7_1",
          "healthQ7_2",
          "healthQ7_3",
          "healthQ7_4",
          "healthQ7_5",
          "healthQ7_6",
          "healthQ7_7",
        ] as const;

        subs.forEach((q) => {
          if (!formData[q]) {
            newErrors[q] = "Required";
          }
        });
      }
      if (!formData.section19Accepted) {
        newErrors.section19Accepted =
          "You must accept Section 19 notice to continue.";
      }
    }

    // STEP 6 – Plan & Terms
    if (currentStep === 6) {
      if (!formData.insuranceStartDate)
        newErrors.insuranceStartDate = "Insurance start date is required";

      if (!formData.acceptTerms) newErrors.acceptTerms = "Required";

      if (!formData.confirmHealthPackage)
        newErrors.confirmHealthPackage = "Required";

      if (!formData.consultationProtocol)
        newErrors.consultationProtocol = "Required";

      if (!formData.healthDataDeclaration)
        newErrors.healthDataDeclaration = "Required";

      if (!formData.insuranceContractDocuments)
        newErrors.insuranceContractDocuments = "Required";

      if (!formData.authorizeInsurBe) newErrors.authorizeInsurBe = "Required";

      if (!formData.confirmCorrectInformation)
        newErrors.confirmCorrectInformation = "Required";
      if (!formData.signatureConsent)
        newErrors.signatureConsent = "You must confirm consent";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleDownloadSection19 = () => {
    const link = document.createElement("a");
    link.href = "/pdfs/Section19_VVG_Notice.pdf"; // place PDF inside public/pdfs/
    link.download = "Section19_VVG_Notice.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadProtocol = async () => {
    const res = await fetch("/api/generate-protocol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "InsurBe-Consultation-Protocol.pdf";
    a.click();
  };

  const downloadPdf = (fileName: string) => {
    const link = document.createElement("a");
    link.href = `/pdfs/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 6) as Step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (validateStep(6)) {
      localStorage.setItem("insuranceFormData", JSON.stringify(formData));
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const stepTitles = {
    1: "Personal Information",
    2: "Previous Insurance",
    3: "Occupation Details",
    4: "Health Information",
    5: "Detailed Health Questions",
    6: "Insurance Plan & Confirmation",
  };

  if (isSubmitted) {
    const downloadPDF = () => {
      const doc = new jsPDF("p", "mm", "a4");
      const marginX = 15;
      let y = 20;

      const addSection = (title: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(title, marginX, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      };

      const addField = (label: string, value: string | boolean) => {
        const text = `${label}: ${value || "N/A"}`;
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, marginX, y);
        y += lines.length * 6;

        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      };

      // HEADER
      doc.setFontSize(16);
      doc.text("INSURANCE APPLICATION SUMMARY", marginX, y);
      y += 12;

      // STEP 1 – PERSONAL INFO
      addSection("Personal Information");
      addField("Email", formData.email);
      addField("Phone", formData.phoneNumber);
      addField("First Name", formData.firstName);
      addField("Last Name", formData.lastName);
      addField("Birthday", formData.birthday);
      addField("Nationality", formData.nationality);
      addField(
        "Address",
        `${formData.address}, ${formData.city}, ${formData.postalCode}`,
      );

      // STEP 2 – PREVIOUS INSURANCE
      addSection("Previous Insurance");
      addField("Insurance Status", formData.currentInsuranceStatus);
      addField("Company", formData.insuranceCompanyName);
      addField("Country", formData.insuranceCountry);
      addField("Insured Since", formData.insuredSince);
      addField("Policy Cancelled", formData.insurancePolicyCancelled);

      // STEP 3 – OCCUPATION
      addSection("Occupation Details");
      addField("Occupation Status", formData.occupationStatus);
      addField("University", formData.university);
      addField("Course of Study", formData.courseOfStudy);
      addField(
        "Study Period",
        `${formData.studyStartDate || ""} - ${formData.studyEndDate || ""}`,
      );

      // STEP 4 – HEALTH BASIC
      addSection("Health Information");
      addField("Gender", formData.gender);
      addField("Height (cm)", formData.height);
      addField("Weight (kg)", formData.weight);

      // STEP 5 – HEALTH QUESTIONS
      addSection("Health Questionnaire");
      addField("Allergies", formData.healthQ1);
      addField("Treatments", formData.healthQ2);
      addField("Addiction Treatment", formData.healthQ3);
      addField("Medication", formData.healthQ4);
      addField("HIV", formData.healthQ5);
      addField("Chronic Illness", formData.healthQ6);
      addField("Impairments", formData.healthQ7);
      addField("Cancer Treatment", formData.healthQ8);
      addField("Scheduled Treatment", formData.healthQ9);
      addField("Mental Health", formData.healthQ10);
      addField("Hospitalization", formData.healthQ11);

      if (formData.healthQ7 === "Yes") {
        addField("Prosthesis", formData.healthQ7_1);
        addField("Hearing Aid", formData.healthQ7_2);
        addField("Infertility", formData.healthQ7_3);
        addField("Body Implant", formData.healthQ7_4);
        addField("Missing Teeth", formData.healthQ7_5);
        addField("Disability / Deformity", formData.healthQ7_6);
        addField("Reduced Earning Capacity", formData.healthQ7_7);
      }

      // STEP 6 – PLAN
      addSection("Insurance Plan");
      addField("Selected Plan", formData.selectedPlan);
      addField("Insurance Start Date", formData.insuranceStartDate);
      addField("Accepted Terms", formData.acceptTerms ? "Yes" : "No");
      addField("Marketing Consent", formData.acceptMarketing ? "Yes" : "No");

      doc.save("insurance-application.pdf");
    };

    return (
      <section className="min-h-screen py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
            {/* Profile Image */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <User className="w-16 h-16 text-purple-600" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thank you, {formData.firstName}!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              We will contact you on{" "}
              <strong>February 27, 2026 at 4:00 PM</strong> (German time / CET)
              to clarify a few questions by phone. Until then, you can review
              your information below.
            </p>

            {/* User Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full mb-12 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                1
              </div>
              <span className="font-semibold">
                {formData.firstName} {formData.lastName}
              </span>
            </div>

            {/* Plan Summary */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your plan
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  €{selectedPlan?.price ?? "--"}
                </div>
                <div className="text-gray-600 mb-6">monthly</div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    {selectedPlan?.title ?? "Selected Plan"}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedPlan?.category === "Public"
                      ? "Statutory public health insurance"
                      : "Private student health insurance"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between py-4 border-t border-gray-200">
                <span className="text-gray-600">Insurance start date</span>
                <span className="font-bold text-gray-900">
                  {formData.insuranceStartDate}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadPDF}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
              >
                Download overview
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-purple-500 hover:text-purple-600 transition"
              >
                Return to Homepage
              </motion.button>
            </div>

            {/* Contact */}
            <div className="mt-8 text-center text-gray-700">
              <p className="flex items-center justify-center gap-2 text-purple-600">
                <Mail className="w-5 h-5" />
                Need more details?
              </p>
              <p className="mt-1">
                Reach us at{" "}
                <a
                  href="mailto:info@insurbe.com"
                  className="font-semibold text-purple-600 hover:underline"
                >
                  info@insurbe.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-12 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            Insurance Application
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-2">
            Get Your student{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary">
              Health Insurance
            </span>
          </h1>
          <p className="text-gray-600">
            Complete your application in 6 easy steps
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 6
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((step / 6) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s < step
                      ? "bg-gradient-to-r from-purple-600 to-primary text-white"
                      : s === step
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                <span className="text-xs text-gray-500 mt-2 hidden sm:block text-center max-w-[80px]">
                  {s === 1 && "Personal info"}
                  {s === 2 && "Insurance history"}
                  {s === 3 && "Occupation"}
                  {s === 4 && "medical basic"}
                  {s === 5 && "Health Q&A"}
                  {s === 6 && "Terms & Plan"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {stepTitles[step]}
          </h2>
          <p className="text-gray-600 mb-8">
            Please provide accurate information for your application
          </p>

          <AnimatePresence mode="wait">
            {/* STEP 2: Personal Information */}
            {step === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField label="Email Address *" error={errors.email}>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        placeholder="you@example.com"
                      />
                    </div>
                  </FormField>
                  <FormField label="Phone Number *" error={errors.phoneNumber}>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleChange("phoneNumber", e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        placeholder="+49 123 456 7890"
                      />
                    </div>
                  </FormField>
                  <FormField label="First Name *" error={errors.firstName}>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                      placeholder="John"
                    />
                  </FormField>

                  <FormField label="Last Name *" error={errors.lastName}>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                      placeholder="Doe"
                    />
                  </FormField>

                  <FormField label="Birthday *" error={errors.birthday}>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleChange("birthday", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                    />
                  </FormField>

                  <FormField label="Nationality *" error={errors.nationality}>
                    {loadingCountries ? (
                      <div className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-gray-600">
                          Loading countries...
                        </span>
                      </div>
                    ) : countries.length === 0 ? (
                      <div className="px-4 py-3 border-2 border-red-200 rounded-xl text-red-600">
                        Failed to load countries. Please refresh the page.
                      </div>
                    ) : (
                      <select
                        value={formData.nationality}
                        onChange={(e) =>
                          handleChange("nationality", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      >
                        <option value="">Select nationality</option>

                        {countries.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormField>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField label="Permanent Residence Permit">
                    <select
                      value={formData.permanentResidencePermit}
                      onChange={(e) =>
                        handleChange("permanentResidencePermit", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormField>

                  <FormField label="Temporary Residence Permit Since">
                    <input
                      type="date"
                      value={formData.temporaryResidencePermitSince}
                      onChange={(e) =>
                        handleChange(
                          "temporaryResidencePermitSince",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                    />
                  </FormField>

                  <FormField label="In Germany Since">
                    <input
                      type="date"
                      value={formData.inGermanySince}
                      onChange={(e) =>
                        handleChange("inGermanySince", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                    />
                  </FormField>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Address in Germany
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <FormField
                        label="Street Address *"
                        error={errors.address}
                      >
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            handleChange("address", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                          placeholder="Street name and number"
                        />
                      </FormField>
                    </div>

                    <FormField label="City *" error={errors.city}>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        placeholder="Berlin"
                      />
                    </FormField>

                    <FormField label="Postal Code *" error={errors.postalCode}>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) =>
                          handleChange("postalCode", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        placeholder="10115"
                      />
                    </FormField>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Previous Insurance */}
            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <FormField
                  label="Current Insurance Status *"
                  error={errors.currentInsuranceStatus}
                >
                  <select
                    value={formData.currentInsuranceStatus}
                    onChange={(e) =>
                      handleChange("currentInsuranceStatus", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                  >
                    <option value="">Select status</option>
                    <option value="Foreign insurance">Foreign insurance</option>
                    <option value="German public">
                      German public insurance
                    </option>
                    <option value="German private">
                      German private insurance
                    </option>
                    <option value="No insurance">No insurance</option>
                  </select>
                </FormField>

                {formData.currentInsuranceStatus &&
                  formData.currentInsuranceStatus !== "No insurance" && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField label="Name of Insurance Company">
                        <input
                          type="text"
                          value={formData.insuranceCompanyName}
                          onChange={(e) =>
                            handleChange("insuranceCompanyName", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                          placeholder="Company name"
                        />
                      </FormField>

                      <FormField label="Country">
                        {loadingCountries ? (
                          <div className="flex items-center gap-2 px-4 py-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <select
                            value={formData.insuranceCountry}
                            onChange={(e) =>
                              handleChange("insuranceCountry", e.target.value)
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                          >
                            <option value="">Select country</option>

                            {countries.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </FormField>

                      <FormField label="Insured Since">
                        <input
                          type="month"
                          value={formData.insuredSince}
                          onChange={(e) =>
                            handleChange("insuredSince", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        />
                      </FormField>

                      <FormField label="Insurance Policy Cancelled">
                        <select
                          value={formData.insurancePolicyCancelled}
                          onChange={(e) =>
                            handleChange(
                              "insurancePolicyCancelled",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </FormField>
                    </div>
                  )}
              </motion.div>
            )}

            {/* STEP 4: Occupation */}
            {step === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <FormField
                  label="Occupation Status *"
                  error={errors.occupationStatus}
                >
                  <select
                    value={formData.occupationStatus}
                    onChange={(e) =>
                      handleChange("occupationStatus", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                  >
                    <option value="">Select status</option>
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>

                {formData.occupationStatus === "Student" && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      label="Your University *"
                      error={errors.university}
                    >
                      <input
                        type="text"
                        value={formData.university}
                        onChange={(e) =>
                          handleChange("university", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        placeholder="University name"
                      />
                    </FormField>

                    <FormField
                      label="Your Course of Study *"
                      error={errors.courseOfStudy}
                    >
                      <input
                        type="text"
                        value={formData.courseOfStudy}
                        onChange={(e) =>
                          handleChange("courseOfStudy", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        placeholder="Computer Science"
                      />
                    </FormField>

                    <FormField
                      label="Study Start Date *"
                      error={errors.studyStartDate}
                    >
                      <input
                        type="date"
                        value={formData.studyStartDate}
                        onChange={(e) =>
                          handleChange("studyStartDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                      />
                    </FormField>

                    <FormField label="Expected End Date">
                      <input
                        type="date"
                        value={formData.studyEndDate}
                        onChange={(e) =>
                          handleChange("studyEndDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                      />
                    </FormField>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Basic Health Info */}
            {step === 4 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <FormField label="Gender *" error={errors.gender}>
                  <div className="flex gap-4">
                    {["Male", "Female", "Diverse"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleChange("gender", g)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition ${
                          formData.gender === g
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField label="Height (cm) *" error={errors.height}>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleChange("height", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        placeholder="172"
                      />
                    </div>
                  </FormField>

                  <FormField label="Weight (kg) *" error={errors.weight}>
                    <div className="relative">
                      <WeightIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleChange("weight", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                        placeholder="65"
                      />
                    </div>
                  </FormField>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Detailed Health Questions */}
            {step === 5 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 max-h-[600px] overflow-y-auto pr-2"
              >
                <HealthQuestion
                  number={1}
                  question="Do you have or have you had any allergies within the last 3 years?"
                  value={formData.healthQ1}
                  onChange={(val) => handleChange("healthQ1", val)}
                  error={errors.healthQ1}
                />

                <HealthQuestion
                  number={2}
                  question="Have you had any treatments or examinations (including follow-up care) by doctors or therapists within the last 3 years?"
                  value={formData.healthQ2}
                  onChange={(val) => handleChange("healthQ2", val)}
                  error={errors.healthQ2}
                />

                <HealthQuestion
                  number={3}
                  question="Have you ever been in treatment for alcohol, medication, drug addiction or any other addiction?"
                  value={formData.healthQ3}
                  onChange={(val) => handleChange("healthQ3", val)}
                  error={errors.healthQ3}
                />

                <HealthQuestion
                  number={4}
                  question="Have you taken any medication for at least two consecutive weeks within the last three years?"
                  value={formData.healthQ4}
                  onChange={(val) => handleChange("healthQ4", val)}
                  error={errors.healthQ4}
                />

                <HealthQuestion
                  number={5}
                  question="Have you ever been diagnosed with an HIV infection?"
                  value={formData.healthQ5}
                  onChange={(val) => handleChange("healthQ5", val)}
                  error={errors.healthQ5}
                />

                <HealthQuestion
                  number={6}
                  question="Do you have any chronic illnesses?"
                  value={formData.healthQ6}
                  onChange={(val) => handleChange("healthQ6", val)}
                  error={errors.healthQ6}
                />

                <div className="space-y-4">
                  <HealthQuestion
                    number={7}
                    question="Do you have one or more of the impairments listed below?"
                    value={formData.healthQ7}
                    onChange={(val) => handleChange("healthQ7", val)}
                    error={errors.healthQ7}
                  />

                  {formData.healthQ7 === "Yes" && (
                    <div className="ml-6 space-y-4 border-l-4 border-purple-200 pl-4">
                      <SubHealthQuestion
                        label="1. Do you wear a prosthesis? (Dentures don't count)"
                        value={formData.healthQ7_1}
                        onChange={(val) => handleChange("healthQ7_1", val)}
                        error={errors.healthQ7_1}
                      />
                      <SubHealthQuestion
                        label="2. Do you wear a hearing aid?"
                        value={formData.healthQ7_2}
                        onChange={(val) => handleChange("healthQ7_2", val)}
                        error={errors.healthQ7_2}
                      />
                      <SubHealthQuestion
                        label="3. Have you been diagnosed with infertility or impaired fertility?"
                        value={formData.healthQ7_3}
                        onChange={(val) => handleChange("healthQ7_3", val)}
                        error={errors.healthQ7_3}
                      />
                      <SubHealthQuestion
                        label="4. Do you have a body implant? (Dental implants don't count)"
                        value={formData.healthQ7_4}
                        onChange={(val) => handleChange("healthQ7_4", val)}
                        error={errors.healthQ7_4}
                      />
                      <SubHealthQuestion
                        label="5. Do you have any missing teeth that haven't been replaced? (Wisdom teeth don't count)"
                        value={formData.healthQ7_5}
                        onChange={(val) => handleChange("healthQ7_5", val)}
                        error={errors.healthQ7_5}
                      />
                      <SubHealthQuestion
                        label="6. Do you have a disability, a malformation of an organ, or a physical deformity?"
                        value={formData.healthQ7_6}
                        onChange={(val) => handleChange("healthQ7_6", val)}
                        error={errors.healthQ7_6}
                      />
                      <SubHealthQuestion
                        label="7. Do you have a reduced earning capacity or are you unable to work?"
                        value={formData.healthQ7_7}
                        onChange={(val) => handleChange("healthQ7_7", val)}
                        error={errors.healthQ7_7}
                      />
                    </div>
                  )}
                </div>

                <HealthQuestion
                  number={8}
                  question="Have you had any treatments or examinations (including follow-up care) for malignant cancers within the last 10 years?"
                  value={formData.healthQ8}
                  onChange={(val) => handleChange("healthQ8", val)}
                  error={errors.healthQ8}
                />

                <HealthQuestion
                  number={9}
                  question="Are you scheduled, advised, or expected to undergo any treatments, examinations (including follow-up care), or operations by doctors or therapists?"
                  value={formData.healthQ9}
                  onChange={(val) => handleChange("healthQ9", val)}
                  error={errors.healthQ9}
                />

                <HealthQuestion
                  number={10}
                  question="Have you had any treatments or examinations (including follow-up care) for mental or psychosomatic illnesses or complaints within the last 10 years?"
                  value={formData.healthQ10}
                  onChange={(val) => handleChange("healthQ10", val)}
                  error={errors.healthQ10}
                />

                <HealthQuestion
                  number={11}
                  question="Have you had any treatment requiring hospitalization or any operations without hospitalization within the last 5 years?"
                  value={formData.healthQ11}
                  onChange={(val) => handleChange("healthQ11", val)}
                  error={errors.healthQ11}
                />
                {/* Section 19 Declaration */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="section19"
                      checked={formData.section19Accepted}
                      onChange={(e) =>
                        handleChange("section19Accepted", e.target.checked)
                      }
                      className="mt-1 w-5 h-5 accent-purple-600"
                    />

                    <label
                      htmlFor="section19"
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      I have taken note of the separate notice on the
                      consequences of a breach of the duty of disclosure
                      pursuant to Section 19 (5) of the German Insurance
                      Contract Act (Versicherungsvertragsgesetz) and I
                      understand that I must answer the health questions
                      carefully, completely and correctly to the best of my
                      knowledge. I am aware that a breach of the pre-contractual
                      duty of disclosure may entitle ottonova
                      Krankenversicherung AG to withdraw from or terminate the
                      contract or lead to an amendment of my insurance contract.
                      <br />
                      <span
                        onClick={handleDownloadSection19}
                        className="text-purple-600 underline cursor-pointer font-medium hover:text-purple-800"
                      >
                        Read Section 19 (5) VVG Notice
                      </span>
                    </label>
                  </div>

                  {errors.section19Accepted && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.section19Accepted}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 7: Plan Selection & Terms */}
            {step === 6 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Plan Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-blue-900">
                      Study Protect
                    </h3>
                    <div className="text-3xl font-bold text-blue-600">
                      €117.63
                    </div>
                  </div>
                </div>

                <FormField
                  label="Insurance Start Date *"
                  error={errors.insuranceStartDate}
                >
                  <input
                    type="date"
                    value={formData.insuranceStartDate}
                    onChange={(e) =>
                      handleChange("insuranceStartDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                  />
                </FormField>
                {/* ================= SIGNATURE SECTION ================= */}
                <div className="mt-10 bg-white rounded-2xl shadow-sm border p-6">
                  <h2 className="text-2xl font-semibold mb-2">
                    Sign your application
                  </h2>
                  <p className="text-gray-600 mb-6">
                    In order to start processing your application, we need a
                    clear signature as a means of consent.
                  </p>

                  {/* Signature Pad */}
                  <div className="bg-gray-100 rounded-xl p-4 relative">
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{
                        className:
                          "w-full h-[200px] bg-white rounded-xl border border-gray-300",
                      }}
                    />

                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        sigCanvas.current?.clear();
                        setSignatureError("");
                      }}
                      className="absolute bottom-4 right-6 text-sm text-gray-500 hover:text-black"
                    >
                      Reset
                    </button>
                  </div>

                  {signatureError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signatureError}
                    </p>
                  )}

                  {/* Consent Checkbox */}
                  {/* <label className="flex items-start gap-3 mt-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.signatureConsent}
                      onChange={(e) =>
                        handleChange("signatureConsent", e.target.checked)
                      }
                      className="mt-1 w-5 h-5 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and understood the{" "}
                      <span className="underline cursor-pointer">
                        privacy policy
                      </span>
                      , <span className="underline cursor-pointer">T&Cs</span>{" "}
                      and{" "}
                      <span className="underline cursor-pointer">
                        Feather broker mandate
                      </span>{" "}
                      and I hereby confirm that I give my full consent.
                    </span>
                  </label> */}
                </div>

                {/* ================= TERMS SECTION ================= */}
                <div className="space-y-8 border-t pt-6">
                  {/* ================= GENERAL SECTION ================= */}
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <h3 className="text-lg font-semibold mb-4">General</h3>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) =>
                          handleChange("acceptTerms", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I have read and accept the{" "}
                        <span
                          onClick={() => router.push("/termscondition")}
                          className="text-purple-600 font-semibold underline cursor-pointer"
                        >
                          Terms and Conditions
                        </span>{" "}
                        and{" "}
                        <span
                          onClick={() => router.push("/privacypolicy")}
                          className="text-purple-600 font-semibold underline cursor-pointer"
                        >
                          Privacy Policy
                        </span>
                        .
                      </span>
                    </label>

                    {/* Grant Immediate Execution (Checked in Image) */}
                    <label className="flex items-start gap-3 cursor-pointer mt-4">
                      <input
                        type="checkbox"
                        checked={formData.grantImmediateExecution}
                        onChange={(e) =>
                          handleChange(
                            "grantImmediateExecution",
                            e.target.checked,
                          )
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        I grant my consent to immediately execute the contracts
                        mentioned above.
                      </span>
                    </label>
                  </div>

                  {/* ================= HEALTH INSURANCE SECTION ================= */}
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <h3 className="text-lg font-semibold mb-6">
                      Health Insurance
                    </h3>

                    {/* 1. Health Insurance Plus */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.confirmHealthPackage}
                        onChange={(e) =>
                          handleChange("confirmHealthPackage", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I want to conclude the Health Insurance Plus package. I
                        confirm that I have downloaded, read and agreed to
                        InsurBe’s{" "}
                        <span
                          onClick={() => router.push("/termscondition")}
                          className="text-purple-600 underline cursor-pointer"
                        >
                          Special Terms and Conditions Packages
                        </span>{" "}
                        including the instructions about the right of
                        withdrawal.
                      </span>
                    </label>

                    {/* 2. Consultation Protocol */}
                    <label className="flex items-start gap-3 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={formData.consultationProtocol}
                        onChange={(e) =>
                          handleChange("consultationProtocol", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I have downloaded, read, and agreed to the{" "}
                        <span
                          onClick={downloadProtocol}
                          className="text-purple-600 underline cursor-pointer"
                        >
                          Consultation Protocol
                        </span>{" "}
                        of the conclusion of my health insurance contracts.
                      </span>
                    </label>

                    {/* 3. Health Data Declaration */}
                    <label className="flex items-start gap-3 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={formData.healthDataDeclaration}
                        onChange={(e) =>
                          handleChange(
                            "healthDataDeclaration",
                            e.target.checked,
                          )
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I hereby declare my consent to the collection and use of
                        health data by the insurer in accordance with the{" "}
                        <span
                          onClick={() =>
                            downloadPdf("health-data-declaration.pdf")
                          }
                          className="text-purple-600 underline cursor-pointer"
                        >
                          declaration on the collection and use of health data
                          and release from the duty of confidentiality
                        </span>
                        .
                      </span>
                    </label>

                    {/* 4. Insurance Contract Documents */}
                    <label className="flex items-start gap-3 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={formData.insuranceContractDocuments}
                        onChange={(e) =>
                          handleChange(
                            "insuranceContractDocuments",
                            e.target.checked,
                          )
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I have taken note of the right of revocation, have read
                        and accepted the{" "}
                        <span
                          onClick={() =>
                            downloadPdf("insurance-contract-documents.pdf")
                          }
                          className="text-purple-600 underline cursor-pointer"
                        >
                          documents regarding my insurance contract
                        </span>{" "}
                        and agree to the validity of the insurance contract.
                      </span>
                    </label>

                    {/* 5. Authorize InsurBe’s */}
                    <label className="flex items-start gap-3 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={formData.authorizeInsurBe}
                        onChange={(e) =>
                          handleChange("authorizeInsurBe", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I authorize InsurBe to accept the insurance policy
                        issued by the insurer. In this respect, I release
                        InsurBe from the obligation to act on its own behalf in
                        accordance with Section 181 BGB. I am aware that the
                        insurance contract is effectively concluded at the time
                        of receipt of the insurance policy by InsurBe
                      </span>
                    </label>

                    {/* 6. Confirm Information Correct */}
                    <label className="flex items-start gap-3 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={formData.confirmCorrectInformation}
                        onChange={(e) =>
                          handleChange(
                            "confirmCorrectInformation",
                            e.target.checked,
                          )
                        }
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I confirm that the information I have provided is
                        complete and correct. The insurance coverage begins at
                        the agreed time in accordance with the insurance
                        conditions. I agree to the commencement of the insurance
                        coverage, even if it is before the expiry of the
                        revocation period (details in the revocation
                        instructions).
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            {step > 1 && (
              <motion.button
                type="button"
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </motion.button>
            )}
            {step < 6 ? (
              <motion.button
                type="button"
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 bg-gradient-to-r from-primary to-blue-600 cursor-pointer text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Submit Application
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          🔒 Your data is encrypted and secure. Questions? Email{" "}
          <a
            href="mailto:info@insurbe.com"
            className="text-purple-600 font-semibold hover:underline"
          >
            info@insurbe.com
          </a>
        </p>
      </div>
    </section>
  );
}

// Helper Components
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

interface HealthQuestionProps {
  number: number;
  question: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function HealthQuestion({
  number,
  question,
  value,
  onChange,
  error,
}: HealthQuestionProps) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition">
      <p className="text-sm font-medium text-gray-900 mb-3">
        {number}. {question}
      </p>
      <div className="flex gap-4">
        {["Yes", "No"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition ${
              value === option
                ? option === "No"
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-orange-600 bg-orange-50 text-orange-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

interface SubHealthQuestionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function SubHealthQuestion({
  label,
  value,
  onChange,
  error,
}: SubHealthQuestionProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-sm text-gray-700 mb-2">{label}</p>
      <div className="flex gap-3">
        {["Yes", "No"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 py-1.5 px-3 rounded-lg border-2 text-sm font-medium transition ${
              value === option
                ? option === "No"
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-orange-600 bg-orange-50 text-orange-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
