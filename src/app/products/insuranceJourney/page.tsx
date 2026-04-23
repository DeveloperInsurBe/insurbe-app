"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import {
  Briefcase,
  Euro,
  UserCircle,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Baby,
  Calendar,
  Globe,
  ArrowRight,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useJourneyStore } from "@/app/stores/journeyStore";
import { usePremiumStore } from "@/app/stores/premiumStore";
import { useDocumentStore } from "@/app/stores/documentStore";
import { calculateTKPremium } from "@/app/insurance/InsuranceCalculatorPrivate";

// Types
interface CountryAPI {
  name: { common: string };
  flags: { svg: string; png: string };
  cca2: string;
}

interface Country {
  name: string;
  flag: string;
  code: string;
}

// Employment normalization
type NormalizedEmployment = "self-employed" | "employed" | "other";

const getNormalizedEmployment = (
  status: string | null,
): NormalizedEmployment => {
  if (!status) return "other";
  const lower = status.toLowerCase();
  if (lower.includes("self")) return "self-employed";
  if (lower.includes("employ")) return "employed";
  return "other";
};

// Constants
const EMPLOYMENT_OPTIONS = [
  { label: "Self-employed/Freelancer", icon: UserCircle },
  { label: " Employed", icon: Building2 },
  { label: "Others", icon: Users },
] as const;

const INCOME_OPTIONS = [
  { label: "< €30,000", value: "<30000" },
  { label: "€30,001 – €77,400", value: "30001-77400" },
  { label: "> €77,400", value: ">77400" },
] as const;

const CACHE_DURATION = 24 * 60 * 60 * 1000;
const POPUP_DURATION = 3000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;

const EU_COUNTRIES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Iceland",
  "Liechtenstein",
  "Norway",
  "Switzerland",
  "United Kingdom",
] as const;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
};

const imageVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
};

const stepImages = {
  1: "/gifs_assets/step1.gif",
  99: "/gifs_assets/step2.gif",
  2: "/gifs_assets/step3.svg",
  3: "/gifs_assets/step1.gif",
  98: "/gifs_assets/step2.gif",
  4: "/gifs_assets/step2.gif",
  5: "/gifs_assets/step3.svg",
} as const;

// Memoized child components
const Popup = memo(({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 50, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    role="alert"
    className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-lg shadow-xl z-50 max-w-md text-center"
  >
    {message}
  </motion.div>
));
Popup.displayName = "Popup";

const StepImage = memo(({ step }: { step: number }) => (
  <motion.div
    variants={imageVariants}
    className="flex justify-center items-center"
  >
    <Image
      src={stepImages[step as keyof typeof stepImages] || stepImages[1]}
      alt={`Step ${step} illustration`}
      width={400}
      height={300}
      className="w-full max-w-md"
      priority={step === 1}
      unoptimized
    />
  </motion.div>
));
StepImage.displayName = "StepImage";

const EmploymentButton = memo(
  ({
    option,
    icon: Icon,
    onClick,
  }: {
    option: string;
    icon: any;
    onClick: (val: string) => void;
  }) => (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(option)}
      className="w-full p-5 border-2 border-gray-200 font-medium rounded-xl hover:border-primary hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all text-left flex items-center gap-4 group cursor-pointer shadow-sm hover:shadow-md"
    >
      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition"
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <span className="flex-1 font-semibold text-gray-800 group-hover:text-primary transition">
        {option}
      </span>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
    </motion.button>
  ),
);
EmploymentButton.displayName = "EmploymentButton";

const IncomeButton = memo(
  ({
    label,
    value,
    onClick,
  }: {
    label: string;
    value: string;
    onClick: (val: string) => void;
  }) => (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(value)}
      className="w-full p-5 border-2 border-gray-200 font-medium rounded-xl hover:border-primary hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all text-left flex items-center gap-4 group cursor-pointer shadow-sm hover:shadow-md"
    >
      <motion.div
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition"
      >
        <Euro className="w-6 h-6 text-white" />
      </motion.div>
      <span className="flex-1 font-semibold text-gray-800 group-hover:text-primary transition">
        {label}
      </span>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
    </motion.button>
  ),
);
IncomeButton.displayName = "IncomeButton";

// PROGRESS BAR COMPONENT
const ProgressBar = memo(
  ({
    currentStep,
    totalSteps,
  }: {
    currentStep: number;
    totalSteps: number;
  }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";

export default function InsuranceJourney() {
  const router = useRouter();

  // Get Zustand stores
  const {
    employmentStatus,
    otherEmployment,
    incomeRange,
    email,
    phone,
    selectedCountry,
    dob,
    actualIncome,
    setEmploymentStatus,
    setOtherEmployment,
    setIncomeRange,
    setActualIncome,
    setEmail,
    setPhone,
    setSelectedCountry,
    setDob,
  } = useJourneyStore();

  const { setTKPremium } = usePremiumStore();
  const { setHalleschePremiumDocs, setHallescheExpatDocs } = useDocumentStore();

  // Local UI States
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [popup, setPopup] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // PROGRESS HELPER FUNCTION
  const getProgressStep = useCallback((currentStep: number): number => {
    if (currentStep === 1) return 1;
    if (currentStep === 2 || currentStep === 99 || currentStep === 98) return 2;
    if (currentStep === 3) return 3;
    if (currentStep === 4) return 4;
    if (currentStep === 5) return 5;
    return 1;
  }, []);

  // Calculate TK Price
  // const calculateTKPrice = useCallback(
  //   (yearlyIncome: number, hasChildrenFlag: boolean, age: number) => {
  //     const maxIncome = 5812.5 * 12;
  //     const cappedIncome = Math.min(yearlyIncome, maxIncome);

  //     const mainPremium = cappedIncome * 0.146;
  //     const zusatzbeitrag = cappedIncome * 0.0245;
  //     const careInsuranceRate = hasChildrenFlag || age < 23 ? 0.036 : 0.042;
  //     const careInsurance = cappedIncome * careInsuranceRate;
  //     const totalAnnual = mainPremium + zusatzbeitrag + careInsurance;
  //     const monthlyPremium = totalAnnual / 12;

  //     const employeeMainPremium = cappedIncome * 0.073;
  //     const employeeZusatzbeitrag = cappedIncome * 0.01225;
  //     const employeeCareInsurance =
  //       cappedIncome * (hasChildrenFlag || age < 23 ? 0.018 : 0.024);
  //     const employeeMonthly =
  //       (employeeMainPremium + employeeZusatzbeitrag + employeeCareInsurance) /
  //       12;

  //     return {
  //       monthly: Math.round(monthlyPremium * 100) / 100,
  //       employeeMonthly: Math.round(employeeMonthly * 100) / 100,
  //       annual: Math.round(totalAnnual * 100) / 100,
  //     };
  //   },
  //   [],
  // );

  // Fetch countries
  useEffect(() => {
    let isMounted = true;

    async function fetchCountries() {
      try {
        const cached = localStorage.getItem("countries_cache");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            if (isMounted) setCountries(data);
            return;
          }
        }

        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca2",
        );
        const data: CountryAPI[] = await res.json();

        const list = data
          .map((c) => ({
            name: c.name.common,
            flag: c.flags.svg || c.flags.png,
            code: c.cca2,
          }))
          .filter((country) => country.name.trim().length > 0)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (isMounted) {
          setCountries(list);
          localStorage.setItem(
            "countries_cache",
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Popup auto hide
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(""), POPUP_DURATION);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  // =============== HANDLERS ====================
  const handleEmploymentSelect = useCallback(
    (val: string) => {
      setEmploymentStatus(val);
      setStep(val === "Others" ? 99 : 2);
    },
    [setEmploymentStatus],
  );

  const handleIncomeSelect = useCallback(
    (val: string) => {
      setIncomeRange(val);

      let income = 50000;

      if (val === "<30000") {
        income = 30000;
        setStep(98); // contact flow
      } else if (val === "30001-77400") {
        income = 54000;
        setStep(3);
      } else if (val === ">77400") {
        income = 6500 * 12; // monthly 6000 forced
        setStep(3);
      }

      setActualIncome(income);
    },
    [setIncomeRange, setActualIncome],
  );

  const handleOtherSubmit = useCallback(() => {
    if (!otherEmployment || !email || !phone) {
      setPopup("Please fill in all fields");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setPopup("Please enter a valid email address");
      return;
    }

    if (!PHONE_REGEX.test(phone)) {
      setPopup("Please enter a valid phone number");
      return;
    }

    setPopup("Thank you! We will connect with you shortly!");
    setTimeout(() => router.push("/products/privateProducts"), 2000);
  }, [otherEmployment, email, phone, router]);

  const handleContactSubmit = useCallback(() => {
    if (!email || !phone) {
      setPopup("Please fill in all fields");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setPopup("Please enter a valid email address");
      return;
    }

    if (!PHONE_REGEX.test(phone)) {
      setPopup("Please enter a valid phone number");
      return;
    }

    setPopup("We will connect with you shortly!");
    setTimeout(() => router.push("/products/privateProducts"), 2000);
  }, [email, phone, router]);

  const handleChildrenSelection = useCallback((hasKids: boolean) => {
    setHasChildren(hasKids);
    setStep(4);
  }, []);

  const handleDobSubmit = useCallback(() => {
    if (!dob) {
      setPopup("Please select your birth year");
      return;
    }
    setStep(5);
  }, [dob]);

  const handleCountrySelect = useCallback(
    (countryName: string) => {
      setSelectedCountry(countryName);
      setIsDropdownOpen(false);
      setSearchTerm("");
    },
    [setSelectedCountry],
  );

  const handleCountrySubmit = useCallback(async () => {
    if (!selectedCountry) {
      setPopup("Please select a country");
      return;
    }

    try {
      const store = useJourneyStore.getState();
      const currentSelectedCountry = store.selectedCountry;
      const currentIncomeRange = store.incomeRange;
      const currentDob = store.dob;
      const currentActualIncome = store.actualIncome || 50000;
      const currentEmploymentStatus = store.employmentStatus;
      const employmentForCalculator =
        currentEmploymentStatus === "Self-employed/Freelancer"
          ? "Self Employed/Freelancer"
          : currentEmploymentStatus === " Employed"
            ? "Employed"
            : "Other";
      const currentHasChildren = hasChildren ?? false;

      if (!currentSelectedCountry) {
        setPopup("Country not selected. Please go back.");
        return;
      }

      const isEU = EU_COUNTRIES.includes(currentSelectedCountry as any);
      const currentYear = new Date().getFullYear();
      const age = currentDob ? currentYear - parseInt(currentDob) : 25;
      const normalizedEmployment = getNormalizedEmployment(
        currentEmploymentStatus,
      );

      // const tkPrice = calculateTKPrice(
      //   currentActualIncome,
      //   currentHasChildren,
      //   age,
      // );
      const result = calculateTKPremium(
        currentActualIncome / 12, // convert yearly to monthly
        age,
        currentHasChildren,
        employmentForCalculator,
        false, // always Saxony
      );

      // let adjustedTkEmployeeMonthly = tkPrice.employeeMonthly;
      // let adjustedTkEmployeeMonthly = result.total;

      // if (normalizedEmployment === "self-employed")
      //   adjustedTkEmployeeMonthly *= 2;

      // setTKPremium(adjustedTkEmployeeMonthly);
      let adjustedTkEmployeeMonthly = result.total;

      const products: any[] = [];
      products.push({
        id: "tk",
        name: "TK Public Insurance",
        provider: "Techniker Krankenkasse",
        type: "public",
        premium: adjustedTkEmployeeMonthly,
        description: "German public health insurance",
        features: [
          "Statutory health coverage",
          "Income-based premium",
          "Family insurance available",
        ],
        loading: false,
      });

      if (
        currentIncomeRange === ">77400" ||
        normalizedEmployment === "self-employed"
      ) {
        products.push({
          id: "hallesche-premium",
          name: "Hallesche Premium",
          provider: "Hallesche",
          type: "premium",
          tariffIds: ["35659", "36129", "24332", "1803"],
          premium: null,
          loading: true,
          documentCount: 0,
          description: "NK.select XL Bonus + NK.select Flex",
          features: [
            "Comprehensive private coverage",
            "Private hospital room",
            "Full dental coverage",
            "Daily hospital benefit",
            "Care insurance included",
          ],
        });

        if (!isEU) {
          products.push({
            id: "hallesche-expat",
            name: "Hallesche Expat",
            provider: "Hallesche",
            type: "expat",
            tariffIds: ["35057", "35063", "24332", "1803"],
            premium: null,
            loading: true,
            documentCount: 0,
            description: "Hi.Germany L + Hi.Dental L",
            features: [
              "Expat-specific coverage",
              "English language support",
              "Budget-friendly option",
              "Essential health protection",
              "Care insurance included",
            ],
          });
        }
      }

      useJourneyStore.setState({
        availableProducts: products,
        selectedCountry: currentSelectedCountry,
      });
      router.push("/calculator");
    } catch (error) {
      console.error("Error:", error);
      setPopup("An error occurred. Please try again.");
    }
  }, [selectedCountry, hasChildren, setTKPremium, router]);

  const selectedCountryData = useMemo(
    () => countries.find((c) => c.name === selectedCountry),
    [countries, selectedCountry],
  );

  const filteredCountries = useMemo(
    () =>
      countries.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [countries, searchTerm],
  );

  const currentYear = new Date().getFullYear();
  const birthYears = useMemo(
    () => Array.from({ length: 100 }, (_, i) => currentYear - 18 - i),
    [currentYear],
  );

  const calculatedAge = useMemo(
    () => (dob ? currentYear - parseInt(dob) : null),
    [dob, currentYear],
  );

  const StaticSideImage = () => (
    <div className="flex flex-col justify-center items-center ">
      <Image
        src="/hero_assets/userJourney.jpg"
        alt="Journey"
        width={400}
        height={300}
        className="w-full max-w-md rounded-2xl object-cover"
        priority
      />
      <div className="flex flex-col items-start py-4 md:pl-10">
        <h2 className="text-primary">Why this question ?</h2>
        <p className="text-gray-500 text-sm">
          To better assist you, we need to get to know you better. This
          information allows us to offer you a more personalized response.
        </p>
      </div>
    </div>
  );

  // ================= UI ===================
  return (
    <section className="relative min-h-screen py-20 px-4 md:px-10 ">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center mb-10"
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-3">
          Just{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            2 minutes to find your
          </span>{" "}
          best-fit insurance
        </h1>

        <p className="text-gray-500 text-base md:text-lg">
          No calls, no commitments — unless you want them.
        </p>
      </motion.div>

      {/* PROGRESS BAR */}
      <ProgressBar currentStep={getProgressStep(step)} totalSteps={5} />

      {/* Popup */}
      <AnimatePresence>{popup && <Popup message={popup} />}</AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Step 1: Employment Status */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70  backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                  What's your employment status?
                </motion.h2>
                {EMPLOYMENT_OPTIONS.map((item) => (
                  <EmploymentButton
                    key={item.label}
                    option={item.label}
                    icon={item.icon}
                    onClick={handleEmploymentSelect}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 99: Other employment */}
        {step === 99 && (
          <motion.div
            key="step99"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                  Please provide your details
                </motion.h2>

                <motion.input
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  className="w-full border-2 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Enter employment type"
                  value={otherEmployment}
                  onChange={(e) => setOtherEmployment(e.target.value)}
                />

                <motion.input
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  className="w-full border-2 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <motion.input
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  className="w-full border-2 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOtherSubmit}
                  className="px-6 py-3 bg-primary text-white rounded-lg w-full hover:bg-primary/90 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Submit
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Income Range */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-3">
                  <Euro className="w-6 h-6 text-primary" />
                  Your yearly gross income
                </motion.h2>
                {INCOME_OPTIONS.map((item) => (
                  <IncomeButton
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    onClick={handleIncomeSelect}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Children Question */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-3"
                >
                  <Baby className="w-6 h-6 text-primary" />
                  Do you have children?
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-gray-500 mb-6"
                >
                  This affects your care insurance rate
                </motion.p>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChildrenSelection(true)}
                  className={`w-full p-5 border-2 cursor-pointer rounded-xl text-left transition shadow-sm hover:shadow-md ${
                    hasChildren === true
                      ? "border-primary bg-gradient-to-r from-green-50 to-emerald-50"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hasChildren === true
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : "bg-purple-200"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-6 h-6 ${hasChildren === true ? "text-white" : "text-purple-600"}`}
                      />
                    </motion.div>
                    <span className="font-semibold text-gray-800 flex-1">
                      Yes, I have children
                    </span>
                    {hasChildren === true && (
                      <ArrowRight className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChildrenSelection(false)}
                  className={`w-full p-5 border-2 cursor-pointer rounded-xl text-left transition shadow-sm hover:shadow-md ${
                    hasChildren === false
                      ? "border-primary bg-gradient-to-r from-blue-50 to-cyan-50"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hasChildren === false
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                          : "bg-purple-200"
                      }`}
                    >
                      <XCircle
                        className={`w-6 h-6 ${hasChildren === false ? "text-gray-500" : "text-purple-600"}`}
                      />
                    </motion.div>
                    <span className="font-semibold text-gray-800 flex-1">
                      No children
                    </span>
                    {hasChildren === false && (
                      <ArrowRight className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 98: Contact details for <30k */}
        {step === 98 && (
          <motion.div
            key="step98"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2
                  variants={itemVariants}
                  className="text-xl font-semibold mb-4 text-gray-700"
                >
                  Enter your contact details
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-gray-500 mb-4"
                >
                  We&apos;ll help you find the best option for your income range
                </motion.p>
                <motion.input
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  className="w-full border-2 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <motion.input
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  className="w-full border-2 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContactSubmit}
                  className="px-6 py-3 bg-primary cursor-pointer text-white rounded-lg w-full hover:bg-primary/90 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Submit
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Birth Year */}
        {step === 4 && (
          <motion.div
            key="step4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-3"
                >
                  <Calendar className="w-6 h-6 text-primary" />
                  What&apos;s your Birth Year?
                </motion.h2>
                <motion.select
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01 }}
                  className="w-full cursor-pointer border-2 p-3 rounded-lg focus:border-primary focus:outline-none"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                >
                  <option value="">Select Birth Year</option>
                  {birthYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </motion.select>

                <AnimatePresence>
                  {calculatedAge && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg"
                    >
                      Age:{" "}
                      <span className="font-semibold">
                        {calculatedAge} years
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  variants={itemVariants}
                  whileHover={dob ? { scale: 1.02 } : {}}
                  whileTap={dob ? { scale: 0.98 } : {}}
                  onClick={handleDobSubmit}
                  disabled={!dob}
                  className={`px-6 py-3 rounded-lg w-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    dob
                      ? "bg-primary text-white cursor-pointer hover:bg-primary/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Continue
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Country Select */}
        {step === 5 && (
          <motion.div
            key="step5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-purple-500/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <StaticSideImage />

              <motion.div variants={containerVariants} className="space-y-4">
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-3"
                >
                  <Globe className="w-6 h-6 text-primary" />
                  Where are you from?
                </motion.h2>

                <motion.div
                  variants={itemVariants}
                  className="relative"
                  ref={dropdownRef}
                >
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="w-full cursor-pointer border-2 p-3 rounded-lg text-left flex items-center justify-between hover:border-primary transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className="flex items-center gap-3">
                      {selectedCountryData ? (
                        <>
                          <Image
                            src={selectedCountryData.flag}
                            alt={selectedCountryData.name}
                            width={24}
                            height={16}
                            className="rounded"
                          />
                          <span>{selectedCountryData.name}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Select Country</span>
                      )}
                    </div>
                    <motion.svg
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-30 w-full mt-2 bg-white border-2 rounded-lg shadow-lg max-h-60 overflow-hidden"
                      >
                        <div className="p-2 border-b sticky top-0 bg-white">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border-2 rounded cursor-text focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <motion.button
                                key={country.code}
                                whileHover={{ backgroundColor: "#f3f4f6" }}
                                onClick={() =>
                                  handleCountrySelect(country.name)
                                }
                                className="w-full p-3 flex items-center cursor-pointer gap-3 transition text-left"
                              >
                                <Image
                                  src={country.flag}
                                  alt={country.name}
                                  width={24}
                                  height={16}
                                  className="rounded"
                                />
                                <span>{country.name}</span>
                              </motion.button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No countries found
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  whileHover={selectedCountry ? { scale: 1.02 } : {}}
                  whileTap={selectedCountry ? { scale: 0.98 } : {}}
                  onClick={handleCountrySubmit}
                  disabled={!selectedCountry}
                  className={`px-6 py-3 rounded-lg w-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    selectedCountry
                      ? "bg-primary text-white cursor-pointer hover:bg-primary/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  See my recommendations
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
