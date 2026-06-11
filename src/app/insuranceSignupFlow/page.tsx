"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  UploadCloud,
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { validateTkForm } from "../providers/tk/validator";
import { submitTkApplication } from "../providers/tk/submit";

type Step = 1 | 2 | 3 | 4;

const PROVIDERS: Record<string, { name: string; desc: string }> = {
  tk: { name: "TK", desc: "Best digital services for students" },
  dak: { name: "DAK", desc: "Excellent coverage for families" },
  aok: { name: "AOK", desc: "Personal support across Germany" },
};

const GERMAN_STATES = [
  "Bavaria",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hesse",
  "Lower Saxony",
  "Mecklenburg-Vorpommern",
  "North Rhine-Westphalia",
  "Rhineland-Palatinate",
  "Saarland",
  "Saxony",
  "Saxony-Anhalt",
  "Schleswig-Holstein",
  "Thuringia",
];

interface Country {
  name: { common: string };
  cca2: string;
}

interface City {
  name: string;
  country: string;
}

export default function InsuranceSignupFlow() {
  const router = useRouter();
  const [providerFromUrl, setProviderFromUrl] = useState<string | null>(null);

  const getStoredPartnerRef = () => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("partner_ref") ||
      localStorage.getItem("partnerRef") ||
      ""
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProviderFromUrl(params.get("provider"));
  }, []);

  const [step, setStep] = useState<Step>(1);

  // API Data States
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectPlan, setSelectPlan] = useState({
    reason: "",
    dob: "",
    provider: "",
    insuredBefore: "",
    institutionName: "", // NEW FIELD
    previousInsuranceType: "",
    previousProviderName: "",
  });
  type DocumentKey = "passport" | "contract" | "photo";

  const [documents, setDocuments] = useState<Record<DocumentKey, File | null>>({
    passport: null,
    contract: null,
    photo: null,
  });

  const [personal, setPersonal] = useState({
    gender: "",
    firstName: "",
    lastName: "",
    nationality: "",
    countryOfBirth: "",
    placeOfBirth: "",
    birthState: "",
    passportNumber: "",
    confirmPassportNumber: "",
    countryCode: "+49",
    phoneNumber: "",
    email: "",
    confirmEmail: "",
    // Address
    country: "Germany",
    city: "",
    postalCode: "",
    streetNo: "",
    additionalInfo: "",
    // Marital status
    maritalStatus: "",
    includeFamilyMembers: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const ref = params.get("ref");

    if (ref) {
      localStorage.setItem("partner_ref", ref);
      localStorage.setItem("partnerRef", ref);
    }
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch cities when country of birth changes
  // useEffect(() => {
  //   if (personal.countryOfBirth) {
  //     fetchCities(personal.countryOfBirth);
  //   }
  // }, [personal.countryOfBirth]);

  useEffect(() => {
    if (providerFromUrl && PROVIDERS[providerFromUrl]) {
      setSelectPlan((prev) => ({
        ...prev,
        provider: PROVIDERS[providerFromUrl].name,
      }));
    }
  }, [providerFromUrl]);

  // Fetch countries from REST Countries API
  const fetchCountries = async (attempt = 0) => {
    setLoadingCountries(true);
    try {
      const response = await fetch("/api/countries", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Countries API failed with ${response.status}`);
      }

      const payload = await response.json();
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const sortedCountries: Country[] = list
        .filter((item: any) => item?.name?.common && item?.cca2)
        .sort((a: Country, b: Country) =>
          a.name.common.localeCompare(b.name.common),
        );

      if (!sortedCountries.length) {
        throw new Error("Countries list is empty");
      }

      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);

      if (attempt < 2) {
        setTimeout(() => {
          fetchCountries(attempt + 1);
        }, 1200);
      } else {
        setErrors((prev) => ({ ...prev, countries: "Failed to load countries" }));
      }
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch cities from GeoDB Cities API
  const fetchCities = async (countryName: string) => {
    setLoadingCities(true);
    try {
      // Find country code from country name
      const country = countries.find((c) => c.name.common === countryName);
      if (!country) return;

      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${country.cca2}/places?limit=100&types=CITY`,
        {
          headers: {
            "X-RapidAPI-Key": "your_api_key_here", // You'll need to get a free API key from rapidapi.com
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const cityNames = data.data.map((city: any) => city.name).sort();
        setCities(cityNames);
      } else {
        // Fallback to a simpler API or manual list
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      // Fallback - allow manual entry
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Comprehensive validation function
  const validateField = (name: string, value: string): string => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) {
          error = "This field is required";
        } else if (value.trim().length < 2) {
          error = "Must be at least 2 characters";
        } else if (
          !/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(
            value,
          )
        ) {
          error = "Only letters allowed";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format";
        }
        break;

      case "confirmEmail":
        if (!value.trim()) {
          error = "Please confirm your email";
        } else if (value !== personal.email) {
          error = "Emails do not match";
        }
        break;

      case "phoneNumber":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^[\d\s-]{7,15}$/.test(value.replace(/\s/g, ""))) {
          error = "Invalid phone number (7-15 digits)";
        }
        break;

      case "countryCode":
        if (!value.trim()) {
          error = "Country code is required";
        } else if (!/^\+?\d{1,4}$/.test(value)) {
          error = "Invalid country code";
        }
        break;

      case "passportNumber":
        if (!value.trim()) {
          error = "Passport number is required";
        } else if (value.trim().length < 6) {
          error = "Passport number too short";
        } else if (!/^[A-Z0-9]{6,12}$/i.test(value)) {
          error = "Invalid passport number format";
        }
        break;

      case "confirmPassportNumber":
        if (!value.trim()) {
          error = "Please confirm passport number";
        } else if (value !== personal.passportNumber) {
          error = "Passport numbers do not match";
        }
        break;

      case "postalCode":
        if (!value.trim()) {
          error = "Postal code is required";
        } else if (personal.country === "Germany" && !/^\d{5}$/.test(value)) {
          error = "German postal code must be 5 digits";
        } else if (!/^[A-Z0-9\s-]{3,10}$/i.test(value)) {
          error = "Invalid postal code format";
        }
        break;

      case "streetNo":
        if (!value.trim()) {
          error = "Street address is required";
        } else if (value.trim().length < 3) {
          error = "Address too short";
        }
        break;

      case "city":
        if (!value.trim()) {
          error = "City is required";
        } else if (value.trim().length < 2) {
          error = "City name too short";
        }
        break;

      case "gender":
      case "nationality":
      case "countryOfBirth":
      case "placeOfBirth":
      case "country":
      case "maritalStatus":
        if (!value) {
          error = "This field is required";
        }
        break;

      case "birthState":
        if (personal.countryOfBirth === "Germany" && !value) {
          error = "Birth state is required for Germany";
        }
        break;

      case "includeFamilyMembers":
        if (!value) {
          error = "Please select an option";
        }
        break;
    }

    return error;
  };

  // Real-time validation handler
  const handlePersonalChange = (name: string, value: string) => {
    setPersonal((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Handle blur to mark field as touched
  const handleBlur = (name: string) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, personal[name as keyof typeof personal]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = [
      "gender",
      "firstName",
      "lastName",
      "nationality",
      "countryOfBirth",
      "placeOfBirth",
      "passportNumber",
      "confirmPassportNumber",
      "countryCode",
      "phoneNumber",
      "email",
      "confirmEmail",
      "country",
      "city",
      "postalCode",
      "streetNo",
      "maritalStatus",
      "includeFamilyMembers",
    ];

    if (personal.countryOfBirth === "Germany") {
      fieldsToValidate.push("birthState");
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(
        field,
        personal[field as keyof typeof personal],
      );
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    );

    return Object.keys(newErrors).length === 0;
  };

  const canProceedPlan =
    selectPlan.reason &&
    selectPlan.dob &&
    selectPlan.provider &&
    selectPlan.insuredBefore &&
    selectPlan.institutionName &&
    selectPlan.previousInsuranceType &&
    selectPlan.previousProviderName &&
    documents.passport &&
    documents.contract &&
    documents.photo;

  const next = () => {
    if (step === 2) {
      if (validateAllFields()) {
        setStep((s) => (s + 1) as Step);
      }
    } else {
      setStep((s) => (s + 1) as Step);
    }
  };

  const back = () => setStep((s) => (s - 1) as Step);

  const handleSubmitApplication = async () => {
    try {
      setLoading(true);

      /**
       * PREPARE FORM DATA
       */
      const formData = {
        personal,
        selectPlan,
        documents,
      };

      /**
       * VALIDATE TK FORM
       */
      const validation = validateTkForm(formData);

      if (!validation.isValid) {
        console.log(validation.errors);
        return;
      }

      /**
       * CHECK PROVIDER
       */
      if (providerFromUrl === "tk") {
        const submitBody = {
          ...formData,
          partnerRef: getStoredPartnerRef(),
        };

        const result = await fetch("/api/tk/submit", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(submitBody),
        });

        const data = await result.json();

        console.log("TK RESPONSE:", JSON.stringify(data, null, 2));

        /**
         * SUCCESS
         */
        if (data?.success) {
          const successUrl = new URL("/insurance/success", window.location.origin);
          successUrl.searchParams.set("appId", data.applicationId || "");
          successUrl.searchParams.set("provider", "tk");
          successUrl.searchParams.set("email", personal.email);
          router.push(successUrl.toString());
        } else {
          console.error("TK submission failed:", JSON.stringify(data, null, 2));
          setErrors((prev) => ({
            ...prev,
            submit:
              "We couldn't submit your application right now. Please check your details or try again shortly.",
          }));

          return;
        }
      }

      /**
       * DAK FLOW
       */
      if (providerFromUrl === "dak") {
        const submitData = new FormData();

        /**
         * PERSONAL
         */
        submitData.append("personal", JSON.stringify(personal));

        /**
         * SELECT PLAN
         */
        submitData.append("selectPlan", JSON.stringify(selectPlan));

        /**
         * PARTNER REF
         */
        submitData.append(
          "partnerRef",
          getStoredPartnerRef(),
        );

        /**
         * DOCUMENTS
         */
        if (documents.passport) {
          submitData.append("passport", documents.passport);
        }

        if (documents.contract) {
          submitData.append("contract", documents.contract);
        }

        if (documents.photo) {
          submitData.append("photo", documents.photo);
        }

        const response = await fetch("/api/dak/submit", {
          method: "POST",

          body: submitData,
        });

        const data = await response.json();

        console.log("DAK RESPONSE:", data);

        /**
         * SUCCESS
         */
        if (data.success) {
          const successUrl = new URL("/insurance/success", window.location.origin);
          successUrl.searchParams.set("appId", data.applicationId || "");
          successUrl.searchParams.set("provider", "dak");
          successUrl.searchParams.set("email", personal.email);
          router.push(successUrl.toString());
        } else {
          setErrors((prev) => ({
            ...prev,

            submit:
              "We couldn't submit your DAK application right now. Please try again shortly.",
          }));
        }
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            Insurance Signup
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {selectPlan.provider} - Public{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Insurance Journey
            </span>
          </h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-2xl shadow-lg p-6 sm:p-10"
        >
          {/* Stepper */}
          <div className="flex items-center justify-between mb-10">
            {["Select Plan", "Personal Info", "Review"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      step > i + 1
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : step === i + 1
                          ? "border-2 border-purple-600 text-purple-600 bg-purple-50"
                          : "bg-gray-200 text-gray-400"
                    }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className="hidden sm:block text-sm text-gray-600">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Select Plan */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Select plan
                </h2>

                {/* Reason */}
                <div className="mb-6">
                  <p className="font-medium mb-2">
                    What is the reason for your stay in Germany? *
                  </p>
                  <div className="flex gap-3">
                    {["Student", "Employee", "Trainee"].map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          setSelectPlan({ ...selectPlan, reason: r })
                        }
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                          ${
                            selectPlan.reason === r
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md"
                              : "border-gray-300 hover:border-purple-300 hover:shadow-sm"
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Conditional Institution Field */}
                {selectPlan.reason && (
                  <div className="mb-6">
                    <label className="block font-medium mb-2">
                      {selectPlan.reason === "Student" && "University name *"}
                      {selectPlan.reason === "Employee" && "Company name *"}
                      {selectPlan.reason === "Trainee" &&
                        "Training company name *"}
                    </label>

                    <input
                      type="text"
                      value={selectPlan.institutionName}
                      onChange={(e) =>
                        setSelectPlan({
                          ...selectPlan,
                          institutionName: e.target.value,
                        })
                      }
                      placeholder={
                        selectPlan.reason === "Student"
                          ? "Enter your university"
                          : "Enter company name"
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                )}

                {/* DOB */}
                <div className="mb-6">
                  <label className="block font-medium mb-2">Birth date *</label>
                  <input
                    type="date"
                    value={selectPlan.dob}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setSelectPlan({ ...selectPlan, dob: e.target.value })
                    }
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>

                {/* Selected Provider */}
                <div className="mb-6">
                  <p className="font-medium mb-2">Selected provider *</p>
                  <div className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* LOGO */}
                      <div className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center p-2">
                        <img
                          src={
                            providerFromUrl === "tk"
                              ? "/icons/tk.png"
                              : providerFromUrl === "dak"
                                ? "/icons/dak_logo.jpeg"
                                : providerFromUrl === "aok"
                                  ? "/icons/tk.png"
                                  : "/icons/dak_logo.jpeg"
                          }
                          alt={selectPlan.provider}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* TEXT */}
                      <div>
                        <p className="font-bold text-lg text-purple-700">
                          {selectPlan.provider}
                        </p>

                        <p className="text-sm text-gray-600">
                          Public health insurance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous Insurance */}
                <div className="mb-6">
                  <p className="font-medium mb-2">
                    Where were you insured before? *
                  </p>
                  <div className="flex gap-3">
                    {["Abroad", "Germany"].map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setSelectPlan({
                            ...selectPlan,
                            insuredBefore: v,
                          })
                        }
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                          ${
                            selectPlan.insuredBefore === v
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md"
                              : "border-gray-300 hover:border-purple-300 hover:shadow-sm"
                          }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Previous Insurance Details */}
                {selectPlan.insuredBefore && (
                  <div className="mb-6 space-y-6">
                    {/* Type of insurance */}
                    <div>
                      <label className="block font-medium mb-2">
                        Type of insurance *
                      </label>
                      <select
                        value={selectPlan.previousInsuranceType}
                        onChange={(e) =>
                          setSelectPlan({
                            ...selectPlan,
                            previousInsuranceType: e.target.value,
                          })
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                      >
                        <option value="">Select insurance type</option>
                        <option value="Travel Insurance">
                          Travel Insurance
                        </option>
                        <option value="Public Insurance">
                          Public Insurance
                        </option>
                        <option value="Private Insurance">
                          Private Insurance
                        </option>
                      </select>
                    </div>

                    {/* Provider Name */}
                    <div>
                      <label className="block font-medium mb-2">
                        Provider name *
                      </label>
                      <input
                        type="text"
                        value={selectPlan.previousProviderName}
                        onChange={(e) =>
                          setSelectPlan({
                            ...selectPlan,
                            previousProviderName: e.target.value,
                          })
                        }
                        placeholder="Enter previous provider name"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Upload Documents (Optional) */}
                <div className="mb-8">
                  <p className="font-medium mb-3">Upload documents </p>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { key: "passport", label: "Passport" },
                      {
                        key: "contract",
                        label: "Employment contract / Admission letter",
                      },
                      { key: "photo", label: "Portrait photo" },
                    ].map((d) => {
                      const file = documents[d.key as DocumentKey];

                      return (
                        <label
                          key={d.key}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:shadow-sm
            ${
              file
                ? "border-purple-500 bg-purple-50"
                : "border-gray-300 hover:border-purple-300"
            }`}
                        >
                          {/* Hidden file input */}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const selectedFile = e.target.files?.[0] || null;
                              setDocuments((prev) => ({
                                ...prev,
                                [d.key]: selectedFile,
                              }));
                            }}
                          />

                          {file ? (
                            <>
                              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Click to replace
                              </p>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                              <p className="text-sm font-medium">{d.label}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Click to upload
                              </p>
                            </>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  disabled={!canProceedPlan}
                  onClick={next}
                  className={`w-full py-3 cursor-pointer rounded-lg font-semibold transition-all
                    ${
                      canProceedPlan
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Further →
                </button>
              </motion.div>
            )}

            {/* STEP 2: Personal Information */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Personal information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please provide the information that is shown in your passport.
                </p>

                <div className="space-y-6">
                  {/* Gender */}
                  <div>
                    <label className="block font-medium mb-2 text-sm">
                      Gender *
                    </label>
                    <div className="flex gap-3">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handlePersonalChange("gender", g)}
                          onBlur={() => handleBlur("gender")}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                            ${
                              personal.gender === g
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent"
                                : "border-gray-300 hover:border-purple-300"
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {touched.gender && errors.gender && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        First name *
                      </label>
                      <input
                        type="text"
                        value={personal.firstName}
                        onChange={(e) =>
                          handlePersonalChange("firstName", e.target.value)
                        }
                        onBlur={() => handleBlur("firstName")}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.firstName && errors.firstName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="First name"
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Last name *
                      </label>
                      <input
                        type="text"
                        value={personal.lastName}
                        onChange={(e) =>
                          handlePersonalChange("lastName", e.target.value)
                        }
                        onBlur={() => handleBlur("lastName")}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.lastName && errors.lastName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="Last name"
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nationality & Country of Birth */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Nationality *
                      </label>
                      {loadingCountries ? (
                        <div className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <select
                          value={personal.nationality}
                          onChange={(e) =>
                            handlePersonalChange("nationality", e.target.value)
                          }
                          onBlur={() => handleBlur("nationality")}
                          className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                            touched.nationality && errors.nationality
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                          }`}
                        >
                          <option value="">Select nationality</option>
                          {countries.map((c) => (
                            <option key={c.cca2} value={c.name.common}>
                              {c.name.common}
                            </option>
                          ))}
                        </select>
                      )}
                      {touched.nationality && errors.nationality && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.nationality}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Country of birth *
                      </label>
                      {loadingCountries ? (
                        <div className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <select
                          value={personal.countryOfBirth}
                          onChange={(e) =>
                            handlePersonalChange(
                              "countryOfBirth",
                              e.target.value,
                            )
                          }
                          onBlur={() => handleBlur("countryOfBirth")}
                          className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                            touched.countryOfBirth && errors.countryOfBirth
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                          }`}
                        >
                          <option value="">Select country</option>
                          {countries.map((c) => (
                            <option key={c.cca2} value={c.name.common}>
                              {c.name.common}
                            </option>
                          ))}
                        </select>
                      )}
                      {touched.countryOfBirth && errors.countryOfBirth && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.countryOfBirth}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Place of Birth & Birth State */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Place of birth *
                      </label>
                      <input
                        type="text"
                        value={personal.placeOfBirth}
                        onChange={(e) =>
                          handlePersonalChange("placeOfBirth", e.target.value)
                        }
                        onBlur={() => handleBlur("placeOfBirth")}
                        list="cities-list"
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.placeOfBirth && errors.placeOfBirth
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="City of birth"
                      />
                      {cities.length > 0 && (
                        <datalist id="cities-list">
                          {cities.map((city) => (
                            <option key={city} value={city} />
                          ))}
                        </datalist>
                      )}
                      {touched.placeOfBirth && errors.placeOfBirth && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.placeOfBirth}
                        </p>
                      )}
                    </div>
                    {personal.countryOfBirth === "Germany" && (
                      <div>
                        <label className="block font-medium mb-2 text-sm">
                          Birth state *
                        </label>
                        <select
                          value={personal.birthState}
                          onChange={(e) =>
                            handlePersonalChange("birthState", e.target.value)
                          }
                          onBlur={() => handleBlur("birthState")}
                          className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                            touched.birthState && errors.birthState
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                          }`}
                        >
                          <option value="">Select state</option>
                          {GERMAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {touched.birthState && errors.birthState && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.birthState}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Passport Numbers */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Passport number *
                      </label>
                      <input
                        type="text"
                        value={personal.passportNumber}
                        onChange={(e) =>
                          handlePersonalChange(
                            "passportNumber",
                            e.target.value.toUpperCase(),
                          )
                        }
                        onBlur={() => handleBlur("passportNumber")}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.passportNumber && errors.passportNumber
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="A1234567"
                      />
                      {touched.passportNumber && errors.passportNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.passportNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Confirm passport number *
                      </label>
                      <input
                        type="text"
                        value={personal.confirmPassportNumber}
                        onChange={(e) =>
                          handlePersonalChange(
                            "confirmPassportNumber",
                            e.target.value.toUpperCase(),
                          )
                        }
                        onBlur={() => handleBlur("confirmPassportNumber")}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.confirmPassportNumber &&
                          errors.confirmPassportNumber
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="Confirm passport number"
                      />
                      {touched.confirmPassportNumber &&
                        errors.confirmPassportNumber && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.confirmPassportNumber}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Country Code & Phone Number */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Country Code */}
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Country code *
                      </label>

                      <div
                        className={`flex items-center rounded-xl border-2 overflow-hidden transition-all ${
                          touched.countryCode && errors.countryCode
                            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                            : "border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100"
                        }`}
                      >
                        <span className="px-4 py-3 bg-gray-50 border-r text-gray-600 font-medium">
                          +
                        </span>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={personal.countryCode.replace("+", "")}
                          onChange={(e) =>
                            handlePersonalChange(
                              "countryCode",
                              `+${e.target.value.replace(/\D/g, "")}`,
                            )
                          }
                          onBlur={() => handleBlur("countryCode")}
                          className="w-full px-4 py-3 outline-none bg-white"
                          placeholder="49"
                        />
                      </div>

                      {touched.countryCode && errors.countryCode && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.countryCode}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Phone number *
                      </label>

                      <div
                        className={`flex items-center rounded-xl border-2 transition-all ${
                          touched.phoneNumber && errors.phoneNumber
                            ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                            : "border-gray-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100"
                        }`}
                      >
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={personal.phoneNumber}
                          onChange={(e) =>
                            handlePersonalChange(
                              "phoneNumber",
                              e.target.value.replace(/[^\d\s]/g, ""),
                            )
                          }
                          onBlur={() => handleBlur("phoneNumber")}
                          className="w-full px-4 py-3 outline-none rounded-xl"
                          placeholder="123 456 7890"
                        />
                      </div>

                      {touched.phoneNumber && errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Addresses */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        value={personal.email}
                        onChange={(e) =>
                          handlePersonalChange("email", e.target.value)
                        }
                        onBlur={() => handleBlur("email")}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.email && errors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="email@example.com"
                      />
                      {touched.email && errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-sm">
                        Confirm e-mail *
                      </label>
                      <input
                        type="email"
                        value={personal.confirmEmail}
                        onChange={(e) =>
                          handlePersonalChange("confirmEmail", e.target.value)
                        }
                        onBlur={() => handleBlur("confirmEmail")}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                          touched.confirmEmail && errors.confirmEmail
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                        }`}
                        placeholder="Confirm email"
                      />
                      {touched.confirmEmail && errors.confirmEmail && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.confirmEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                      Address
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please provide your German address if you already have
                      one. If not, use your current address.
                    </p>

                    <div className="space-y-4">
                      {/* Country */}
                      <div>
                        <label className="block font-medium mb-2 text-sm">
                          Country *
                        </label>
                        {loadingCountries ? (
                          <div className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-gray-500">
                              Loading...
                            </span>
                          </div>
                        ) : (
                          <select
                            value={personal.country}
                            onChange={(e) =>
                              handlePersonalChange("country", e.target.value)
                            }
                            onBlur={() => handleBlur("country")}
                            className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                              touched.country && errors.country
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                            }`}
                          >
                            <option value="">Select country</option>
                            {countries.map((c) => (
                              <option key={c.cca2} value={c.name.common}>
                                {c.name.common}
                              </option>
                            ))}
                          </select>
                        )}
                        {touched.country && errors.country && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.country}
                          </p>
                        )}
                      </div>

                      {/* City & Postal Code */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-2 text-sm">
                            City *
                          </label>
                          <input
                            type="text"
                            value={personal.city}
                            onChange={(e) =>
                              handlePersonalChange("city", e.target.value)
                            }
                            onBlur={() => handleBlur("city")}
                            className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                              touched.city && errors.city
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                            }`}
                            placeholder="City"
                          />
                          {touched.city && errors.city && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block font-medium mb-2 text-sm">
                            Postal code *
                          </label>
                          <input
                            type="text"
                            value={personal.postalCode}
                            onChange={(e) =>
                              handlePersonalChange("postalCode", e.target.value)
                            }
                            onBlur={() => handleBlur("postalCode")}
                            className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                              touched.postalCode && errors.postalCode
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                            }`}
                            placeholder="12345"
                          />
                          {touched.postalCode && errors.postalCode && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Street No & Additional Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-2 text-sm">
                            Street, No. *
                          </label>
                          <input
                            type="text"
                            value={personal.streetNo}
                            onChange={(e) =>
                              handlePersonalChange("streetNo", e.target.value)
                            }
                            onBlur={() => handleBlur("streetNo")}
                            className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                              touched.streetNo && errors.streetNo
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                            }`}
                            placeholder="Street name and number"
                          />
                          {touched.streetNo && errors.streetNo && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.streetNo}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block font-medium mb-2 text-sm">
                            Additional information
                          </label>
                          <input
                            type="text"
                            value={personal.additionalInfo}
                            onChange={(e) =>
                              handlePersonalChange(
                                "additionalInfo",
                                e.target.value,
                              )
                            }
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                            placeholder="Apt, floor, etc."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marital Status Section */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                      Marital status
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-medium mb-2 text-sm">
                          Marital status *
                        </label>
                        <select
                          value={personal.maritalStatus}
                          onChange={(e) =>
                            handlePersonalChange(
                              "maritalStatus",
                              e.target.value,
                            )
                          }
                          onBlur={() => handleBlur("maritalStatus")}
                          className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition-all ${
                            touched.maritalStatus && errors.maritalStatus
                              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
                          }`}
                        >
                          <option value="">Select status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                        {touched.maritalStatus && errors.maritalStatus && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.maritalStatus}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-medium mb-4 text-sm">
                          Would you like to include your family members living
                          in Germany in your insurance free of charge? *
                        </label>
                        <div className="flex gap-4">
                          {["Yes", "No"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                handlePersonalChange(
                                  "includeFamilyMembers",
                                  option,
                                )
                              }
                              onBlur={() => handleBlur("includeFamilyMembers")}
                              className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium transition-all
                                ${
                                  personal.includeFamilyMembers === option
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent"
                                    : "border-gray-300 hover:border-purple-300"
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        {touched.includeFamilyMembers &&
                          errors.includeFamilyMembers && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.includeFamilyMembers}
                            </p>
                          )}
                        {personal.includeFamilyMembers === "Yes" && (
                          <p className="text-sm text-gray-600 mt-3 p-3 bg-blue-50 rounded-lg">
                            If you want to include your family members living in
                            Germany, insured and children free of charge, you
                            will receive a consultation during application from
                            the health insurance company.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={back}
                    className="flex-1 border-2 border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 font-medium hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="flex-1 py-3 cursor-pointer rounded-lg font-semibold shadow-md transition-all bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                  >
                    Review →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Review
                </h2>
                <div className="space-y-3 text-sm bg-gray-50 p-6 rounded-xl border">
                  <Review
                    label="Name"
                    value={`${personal.firstName} ${personal.lastName}`}
                  />
                  <Review label="Gender" value={personal.gender} />
                  <Review label="Email" value={personal.email} />
                  <Review
                    label="Phone"
                    value={`${personal.countryCode} ${personal.phoneNumber}`}
                  />
                  <Review label="Nationality" value={personal.nationality} />
                  <Review
                    label="Birth Place"
                    value={`${personal.placeOfBirth}, ${personal.countryOfBirth}`}
                  />
                  <Review label="Passport" value={personal.passportNumber} />
                  <Review
                    label="Address"
                    value={`${personal.streetNo}, ${personal.city} ${personal.postalCode}, ${personal.country}`}
                  />
                  <Review
                    label="Marital Status"
                    value={personal.maritalStatus}
                  />
                  <Review
                    label="Family Members"
                    value={personal.includeFamilyMembers}
                  />
                  <Review label="Reason for Stay" value={selectPlan.reason} />
                  {selectPlan.institutionName && (
                    <Review
                      label={
                        selectPlan.reason === "Student"
                          ? "University"
                          : selectPlan.reason === "Employee"
                            ? "Company"
                            : "Training Company"
                      }
                      value={selectPlan.institutionName}
                    />
                  )}
                  <Review
                    label="Insurance Provider"
                    value={selectPlan.provider}
                  />
                  <Review
                    label="Previously Insured"
                    value={selectPlan.insuredBefore}
                  />

                  <Review
                    label="Previous Insurance Type"
                    value={selectPlan.previousInsuranceType}
                  />

                  <Review
                    label="Previous Provider"
                    value={selectPlan.previousProviderName}
                  />
                </div>
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl mt-6 border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

                      <div>
                        <p className="font-semibold text-red-700">
                          Submission failed
                        </p>

                        <p className="text-sm text-red-600 mt-1 break-words">
                          {errors.submit}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={back}
                    className="flex-1 border-2 cursor-pointer border-gray-300 rounded-lg py-3 font-medium hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 cursor-pointer text-white rounded-lg py-3 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit ✓"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center py-6 sm:py-10"
              >
                <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-lg border px-6 sm:px-8 py-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                      <img
                        src="/gifs_assets/clap.png"
                        alt="Booking successful"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    Thank you for choosing{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                      InsurBe
                    </span>
                    !
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                    Your booking was successful. You will receive an email with
                    your <strong>order ID</strong>. Please use this ID when
                    contacting us via email, chat, or any other channel.
                    <br />
                    <br />
                    It may take up to <strong>24 hours</strong> for us to
                    provide all the necessary documents.
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition-all shadow-md"
                  >
                    Back Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
 
