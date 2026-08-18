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
  User,
  Stethoscope,
  HeartHandshake,
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
  flag: string | null;
  code: string;
}

const BackButton = memo(({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: -3 }}
    whileTap={{ scale: 0.95 }}
    className="mt-8 p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-[#820ad1] hover:bg-white transition-all shadow-sm hover:shadow-md group"
  >
    <svg
      className="w-5 h-5 text-gray-600 group-hover:text-[#820ad1] transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </motion.button>
));
BackButton.displayName = "BackButton";

const AGE_YOUNG_MAX = 34;
const INCOME_LOW_MAX = 30000;
const INCOME_MID_MAX = 77400;

type AlreadyInGermany = "yes" | "no" | "";
type UniversityType = "public" | "private" | "";
type IncomeBucket = "low" | "mid" | "high";
type NormalizedEmployment =
  | "self"
  | "student"
  | "aupair_worktravel"
  | "employed"
  | "others";

const getNormalizedEmployment = (
  status: string | null,
): NormalizedEmployment => {
  if (!status) return "others";
  const lower = status.trim().toLowerCase();
  if (
    lower.includes("au pair") ||
    lower.includes("work and travel") ||
    lower.includes("work & travel") ||
    lower.includes("work&travel")
  ) {
    return "aupair_worktravel";
  }
  if (lower.includes("student")) return "student";
  if (lower.includes("self") || lower.includes("freelance")) return "self";
  if (lower.includes("employ")) return "employed";
  return "others";
};

type JourneyProduct = {
  id: string;
  name: string;
  provider: string;
  type: string;
  description: string;
  features: string[];
  loading: boolean;
  premium?: number | null;
  tariffIds?: string[];
  documentCount?: number;
  recommended?: boolean;
};

type BuildProductsContext = {
  alreadyInGermany: AlreadyInGermany;
  employmentStatus: string | null;
  incomeRange?: string;
  actualIncome?: number | null;
  age: number;
  universityType?: UniversityType;
  currentFlowProducts: JourneyProduct[];
  tkPremium?: number;
};

const buildHMRProduct = (age: number): JourneyProduct => {
  const isYoung = age <= AGE_YOUNG_MAX;
  if (isYoung) {
    return {
      id: "hansemerkur-young-travel",
      name: "HanseMerkur Young Travel",
      provider: "HanseMerkur",
      type: "incoming-young",
      premium: null,
      loading: false,
      documentCount: 0,
      description: "Incoming coverage for young travelers",
      features: [
        "Student-friendly incoming coverage",
        "Travel-focused health protection",
        "Easy onboarding for young applicants",
      ],
    };
  }
  return {
    id: "hansemerkur-incoming",
    name: "HanseMerkur Normal Insurance",
    provider: "HanseMerkur",
    type: "incoming",
    premium: null,
    loading: false,
    documentCount: 0,
    description: "Standard incoming insurance coverage",
    features: [
      "Incoming insurance for visitors",
      "Flexible protection period",
      "Designed for short and mid stays",
    ],
  };
};

const buildTKProduct = (premium: number): JourneyProduct => ({
  id: "tk",
  name: "TK Public Insurance",
  provider: "Techniker Krankenkasse",
  type: "public",
  premium,
  description: "German public health insurance",
  features: [
    "Statutory health coverage",
    "Income-based premium",
    "Family insurance available",
  ],
  loading: false,
});

const buildDAKProduct = (premium: number): JourneyProduct => ({
  id: "dak",
  name: "DAK Gesundheit",
  provider: "DAK-Gesundheit",
  type: "public",
  premium: premium * 1.02,
  description: "Germany's most popular public health insurance",
  features: [
    "Comprehensive health coverage",
    "Income-based premium",
    "Family insurance included",
    "Digital health services",
  ],
  loading: false,
  recommended: true,
});

const buildHallescheExpatProduct = (): JourneyProduct => ({
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

const getIncomeBucket = (
  incomeRange?: string,
  actualIncome?: number | null,
): IncomeBucket => {
  if (typeof actualIncome === "number" && !Number.isNaN(actualIncome)) {
    if (actualIncome <= INCOME_LOW_MAX) return "low";
    if (actualIncome <= INCOME_MID_MAX) return "mid";
    return "high";
  }
  if (incomeRange === "<30000") return "low";
  if (incomeRange === "30001-77400") return "mid";
  return "high";
};

const buildProductsForJourney = (
  context: BuildProductsContext,
): JourneyProduct[] => {
  const employment = getNormalizedEmployment(context.employmentStatus);
  const incomeBucket = getIncomeBucket(context.incomeRange, context.actualIncome);
  const hmrProduct = buildHMRProduct(context.age);
  const tkPremium = context.tkPremium ?? 0;

  // Rule: if already in Germany, no HMR logic.
  // Student-like profiles keep special handling without HMR:
  // public university => TK + DAK.
  if (context.alreadyInGermany === "yes") {
    if (employment === "student" || employment === "aupair_worktravel") {
      if (context.universityType === "public") {
        return [buildTKProduct(tkPremium), buildDAKProduct(tkPremium)];
      }
    }
    return [...context.currentFlowProducts];
  }

  if (employment === "self") {
    if (incomeBucket === "low") return [hmrProduct];
    if (incomeBucket === "mid") {
      return [buildTKProduct(tkPremium), buildHallescheExpatProduct(), hmrProduct];
    }
    return [...context.currentFlowProducts];
  }

  if (employment === "student" || employment === "aupair_worktravel") {
    if (context.universityType === "public") {
      return [buildTKProduct(tkPremium), buildDAKProduct(tkPremium), hmrProduct];
    }
    if (context.universityType === "private") {
      return [hmrProduct];
    }
    return [...context.currentFlowProducts];
  }

  // Employed + Others remain unchanged.
  return [...context.currentFlowProducts];
};

const EMPLOYMENT_OPTIONS = [
  { label: "Self-employed/Freelancer", icon: UserCircle },
  { label: "Students", icon: User },
  { label: "Au Pair / Work & Travel", icon: Briefcase },
  { label: " Employed", icon: Building2 },
  { label: "Others", icon: Users },
] as const;

const INCOME_OPTIONS = [
  { label: "< €30,000", value: "<30000" },
  { label: "€30,001 – €77,400", value: "30001-77400" },
  { label: "> €77,400", value: ">77400" },
] as const;

const UNIVERSITY_OPTIONS = [
  { label: "Public University", value: "public" as const },
  { label: "Private University", value: "private" as const },
] as const;

const STEP_ALREADY_IN_GERMANY = 1;
const STEP_EMPLOYMENT = 2;
const STEP_INCOME = 3;
const STEP_CHILDREN = 4;
const STEP_DOB = 5;
const STEP_UNIVERSITY = 6;
const STEP_COUNTRY = 7;
const STEP_OTHER_CONTACT = 99;

const CACHE_DURATION = 24 * 60 * 60 * 1000;
const COUNTRIES_CACHE_KEY = "countries_cache_v2";
const POPUP_DURATION = 3000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
};

// ── Popup ──────────────────────────────────────────────
const Popup = memo(({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#820ad1] text-white px-6 py-3 rounded-2xl shadow-2xl z-50 text-sm font-medium"
    role="alert"
  >
    {message}
  </motion.div>
));
Popup.displayName = "Popup";

// ── MSH-style option row ───────────────────────────────
const OptionRow = memo(
  ({
    label,
    icon: Icon,
    onClick,
    subLabel,
  }: {
    label: string;
    icon: any;
    onClick: () => void;
    subLabel?: string;
  }) => (
    <motion.button
      variants={itemVariants}
      whileHover="hovered"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group w-full flex items-center gap-4 px-5 py-4 border border-gray-200 rounded-2xl bg-white hover:border-[#820ad1]/40 hover:bg-[#f8f5ff] transition-all text-left cursor-pointer"
    >
      {/* Small icon box */}
      <span className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#f0ebff] text-[#820ad1] group-hover:bg-[#820ad1] group-hover:text-white transition-colors duration-200">
        <Icon className="w-4 h-4" />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-medium text-gray-800 group-hover:text-[#820ad1] transition-colors leading-tight">
          {label}
        </span>
        {subLabel && (
          <span className="block text-xs text-gray-400 mt-0.5">{subLabel}</span>
        )}
      </span>

      {/* Arrow — always visible but animates on hover */}
      <motion.span
        variants={{ hovered: { x: 3 } }}
        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-[#820ad1] group-hover:bg-[#820ad1] transition-all duration-200"
      >
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
      </motion.span>
    </motion.button>
  ),
);
OptionRow.displayName = "OptionRow";

// ── "Next" button with sliding arrow — auto width ─────
const NextButton = memo(
  ({
    label = "Next",
    onClick,
    disabled = false,
  }: {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <div className="mt-6">
      <p className="text-xs text-gray-400 mb-3">* Required fields</p>
      <motion.button
        whileHover={disabled ? {} : "hovered"}
        whileTap={disabled ? {} : { scale: 0.97 }}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center overflow-hidden rounded-2xl font-semibold text-[15px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#820ad1] focus:ring-offset-2
          ${
            disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed px-8 py-4"
              : "bg-[#820ad1] text-white cursor-pointer pl-8 pr-4 py-4 shadow-lg shadow-[#820ad1]/30"
          }`}
      >
        <span>{label}</span>
        {!disabled && (
          <motion.span
            variants={{ hovered: { width: 40, marginLeft: 14, opacity: 1 } }}
            initial={{ width: 0, marginLeft: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-center justify-center bg-white rounded-xl overflow-hidden shrink-0 h-8"
          >
            <ArrowRight className="w-4 h-4 text-[#820ad1]" />
          </motion.span>
        )}
      </motion.button>
    </div>
  ),
);
NextButton.displayName = "NextButton";

// ── Progress bar ───────────────────────────────────────
const ProgressBar = memo(
  ({ current, total }: { current: number; total: number }) => {
    const pct = Math.round((current / total) * 100);
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
          <span>
            Step {current} of {total}
          </span>
          <span>{pct}% complete</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#820ad1] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";

// ── Right-panel image & "Why do we ask" card ──────────
const RightPanel = memo(
  ({ imageSrc = "/hero_assets/userJourney1.png" }: { imageSrc?: string }) => (
    <div className="hidden md:flex flex-col h-full">
      <div className="relative flex-1 rounded-3xl overflow-hidden min-h-[500px]">
        <Image
          src={imageSrc}
          alt="Illustration"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle purple swirl overlay hint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#820ad1]/10 to-transparent pointer-events-none" />
      </div>

      {/* "Why do we ask?" card — matches screenshot */}
      <div className="mt-5 bg-[#f8f5ff] rounded-2xl px-6 py-5">
        <p className="text-[#820ad1] font-semibold text-base mb-1">
          Why do we ask this?
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          To support you better, we need to get to know you better. This
          information will enable us to provide you with a more personalized
          solution.
        </p>
      </div>
    </div>
  ),
);
RightPanel.displayName = "RightPanel";

// ── Styled text input ──────────────────────────────────
const StyledInput = memo(
  ({
    type,
    placeholder,
    value,
    onChange,
  }: {
    type: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <motion.input
      variants={itemVariants}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#820ad1] focus:ring-2 focus:ring-[#820ad1]/20 transition bg-white"
    />
  ),
);
StyledInput.displayName = "StyledInput";

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function InsuranceJourney() {
  const router = useRouter();

  const {
    alreadyInGermany,
    employmentStatus,
    otherEmployment,
    universityType,
    incomeRange,
    email,
    phone,
    selectedCountry,
    dob,
    actualIncome,
    setAlreadyInGermany,
    setEmploymentStatus,
    setOtherEmployment,
    setUniversityType,
    setIncomeRange,
    setActualIncome,
    setEmail,
    setPhone,
    setSelectedCountry,
    setDob,
  } = useJourneyStore();

  const { setTKPremium } = usePremiumStore();
  const { setHalleschePremiumDocs, setHallescheExpatDocs } = useDocumentStore();

  const [step, setStep] = useState(STEP_ALREADY_IN_GERMANY);
  const [countries, setCountries] = useState<Country[]>([]);
  const [popup, setPopup] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getProgressStep = useCallback((s: number) => {
    if (s === STEP_ALREADY_IN_GERMANY) return 1;
    if (s === STEP_EMPLOYMENT || s === STEP_OTHER_CONTACT) return 2;
    if (s === STEP_INCOME) return 3;
    if (s === STEP_CHILDREN) return 4;
    if (s === STEP_DOB) return 5;
    if (s === STEP_UNIVERSITY) return 6;
    if (s === STEP_COUNTRY) return 7;
    return 1;
  }, []);

  // Fetch countries
  useEffect(() => {
    let mounted = true;
    async function load() {
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
            Date.now() - timestamp < CACHE_DURATION &&
            sanitizedCached.length
          ) {
            if (mounted) setCountries(sanitizedCached);
            return;
          }
        }
        const res = await fetch("/api/countries?fields=name,flags,cca2");
        const data: CountryAPI[] = await res.json();
        const list = data
          .map((c) => normalizeCountry(c))
          .filter((c): c is Country => Boolean(c))
          .sort((a, b) => a.name.localeCompare(b.name));
        if (mounted) {
          setCountries(list);
          localStorage.setItem(
            COUNTRIES_CACHE_KEY,
            JSON.stringify({ data: list, timestamp: Date.now() }),
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (popup) {
      const t = setTimeout(() => setPopup(""), POPUP_DURATION);
      return () => clearTimeout(t);
    }
  }, [popup]);

  const handleBack = useCallback(() => {
    const normalizedEmployment = getNormalizedEmployment(employmentStatus);
    const plannedToCome = alreadyInGermany === "no";

    if (step === STEP_ALREADY_IN_GERMANY) {
      router.push("/products/privateProducts");
      return;
    }

    if (step === STEP_EMPLOYMENT) {
      setStep(STEP_ALREADY_IN_GERMANY);
      return;
    }

    if (step === STEP_INCOME) {
      setStep(STEP_EMPLOYMENT);
      return;
    }

    if (step === 98) {
      setStep(STEP_INCOME);
      return;
    }

    if (step === STEP_CHILDREN) {
      setStep(STEP_INCOME);
      return;
    }

    if (step === STEP_DOB) {
      if (normalizedEmployment === "student" || normalizedEmployment === "aupair_worktravel") {
        setStep(STEP_EMPLOYMENT);
        return;
      }
      if (plannedToCome && normalizedEmployment === "self") {
        setStep(STEP_INCOME);
        return;
      }
      setStep(STEP_CHILDREN);
      return;
    }

    if (step === STEP_UNIVERSITY) {
      setStep(STEP_DOB);
      return;
    }

    if (step === STEP_COUNTRY) {
      if (normalizedEmployment === "student" || normalizedEmployment === "aupair_worktravel") {
        setStep(STEP_UNIVERSITY);
        return;
      }
      setStep(STEP_DOB);
      return;
    }

    if (step === STEP_OTHER_CONTACT) {
      setStep(STEP_EMPLOYMENT);
    }
  }, [step, router, employmentStatus, alreadyInGermany]);

  // ── Handlers ─────────────────────────────────────────
  const handleAlreadyInGermanySelect = useCallback(
    (value: AlreadyInGermany) => {
      setAlreadyInGermany(value);
      setStep(STEP_EMPLOYMENT);
    },
    [setAlreadyInGermany],
  );

  const handleEmploymentSelect = useCallback(
    (val: string) => {
      setEmploymentStatus(val);
      const normalizedEmployment = getNormalizedEmployment(val);
      const isStudentLike =
        normalizedEmployment === "student" ||
        normalizedEmployment === "aupair_worktravel";

      if (!isStudentLike) {
        setUniversityType("");
      }

      if (normalizedEmployment === "others") {
        setStep(STEP_OTHER_CONTACT);
        return;
      }

      if (isStudentLike) {
        setStep(STEP_DOB);
        return;
      }

      setStep(STEP_INCOME);
    },
    [setEmploymentStatus, alreadyInGermany, setUniversityType],
  );

  const handleIncomeSelect = useCallback(
    (val: string) => {
      setIncomeRange(val);
      let income = 50000;
      if (val === "<30000") {
        income = 30000;
      } else if (val === "30001-77400") {
        income = 54000;
      } else if (val === ">77400") {
        income = 6500 * 12;
      }
      setActualIncome(income);
      const normalizedEmployment = getNormalizedEmployment(employmentStatus);
      const followsCurrentFlow =
        alreadyInGermany === "yes" || normalizedEmployment === "employed";

      // Keep legacy behavior for current-flow under-30k paths:
      // show personalized assistance instead of direct recommendation flow.
      if (val === "<30000" && followsCurrentFlow) {
        setStep(98);
        return;
      }

      if (followsCurrentFlow) {
        setStep(STEP_CHILDREN);
        return;
      }

      setStep(STEP_DOB);
    },
    [setIncomeRange, setActualIncome, employmentStatus, alreadyInGermany],
  );

  const handleOtherSubmit = useCallback(() => {
    if (!otherEmployment || !email || !phone)
      return setPopup("Please fill in all fields");
    if (!EMAIL_REGEX.test(email))
      return setPopup("Please enter a valid email address");
    if (!PHONE_REGEX.test(phone))
      return setPopup("Please enter a valid phone number");
    setPopup("Thank you! We will connect with you shortly!");
    router.push("/products/privateProducts");
  }, [otherEmployment, email, phone, router]);

  const handleContactSubmit = useCallback(() => {
    if (!email || !phone) return setPopup("Please fill in all fields");
    if (!EMAIL_REGEX.test(email))
      return setPopup("Please enter a valid email address");
    if (!PHONE_REGEX.test(phone))
      return setPopup("Please enter a valid phone number");
    setPopup("We will connect with you shortly!");
    router.push("/products/privateProducts");
  }, [email, phone, router]);

  const handleChildrenSelection = useCallback((v: boolean) => {
    setHasChildren(v);
    setStep(STEP_DOB);
  }, []);

  const handleDobSubmit = useCallback(() => {
    if (!dob) return setPopup("Please select your birth year");
    const normalizedEmployment = getNormalizedEmployment(employmentStatus);

    if (normalizedEmployment === "student" || normalizedEmployment === "aupair_worktravel") {
      setStep(STEP_UNIVERSITY);
      return;
    }

    setStep(STEP_COUNTRY);
  }, [dob, employmentStatus]);

  const handleUniversitySelect = useCallback(
    (value: UniversityType) => {
      setUniversityType(value);
      const normalizedEmployment = getNormalizedEmployment(employmentStatus);
      const isStudentLike =
        normalizedEmployment === "student" ||
        normalizedEmployment === "aupair_worktravel";

      if (
        alreadyInGermany === "yes" &&
        isStudentLike &&
        value === "private"
      ) {
        setStep(98);
        return;
      }
      setStep(STEP_COUNTRY);
    },
    [setUniversityType, alreadyInGermany, employmentStatus],
  );

  const handleCountrySelect = useCallback(
    (name: string) => {
      setSelectedCountry(name);
      setIsDropdownOpen(false);
      setSearchTerm("");
    },
    [setSelectedCountry],
  );

  const handleCountrySubmit = useCallback(async () => {
    if (!selectedCountry) return setPopup("Please select a country");
    try {
      const store = useJourneyStore.getState();
      const {
        selectedCountry: sc,
        incomeRange: ir,
        dob: d,
        actualIncome: ai,
        employmentStatus: es,
      } = store;
      const empForCalc =
        es === "Self-employed/Freelancer"
          ? "Self Employed/Freelancer"
          : es === " Employed"
            ? "Employed"
            : "Other";
      const hc = hasChildren ?? false;
      if (!sc) return setPopup("Country not selected. Please go back.");
      const isEU = EU_COUNTRIES.includes(sc as any);
      const age = d ? new Date().getFullYear() - parseInt(d) : 25;
      const normalizedEmp = getNormalizedEmployment(es);
      const isStudent = normalizedEmp === "student";
      const result = calculateTKPremium(
        (ai || 50000) / 12,
        age,
        hc,
        empForCalc,
        false,
      );
      const adjusted = result.total;

      // ✅ Determine if we should show DAK
      const isEmployed = es === " Employed";
      const isMidIncome = ir === "30001-77400";
      const shouldShowDAK = isEmployed && isMidIncome;

      let products: any[] = [
        {
          id: "tk",
          name: "TK Public Insurance",
          provider: "Techniker Krankenkasse",
          type: "public",
          premium: adjusted,
          description: "German public health insurance",
          features: [
            "Statutory health coverage",
            "Income-based premium",
            "Family insurance available",
          ],
          loading: false,
        },
      ];

      // ✅ Add DAK if conditions match
      if (shouldShowDAK) {
        products.push({
          id: "dak",
          name: "DAK Gesundheit",
          provider: "DAK-Gesundheit",
          type: "public",
          premium: adjusted * 1.02, // Slightly different premium
          description: "Germany's most popular public health insurance",
          features: [
            "Comprehensive health coverage",
            "Income-based premium",
            "Family insurance included",
            "Digital health services",
          ],
          loading: false,
          recommended: true, // ✅ Mark as recommended
        });
      }

      const shouldIncludeHallesche =
        isStudent || ir === ">77400" || normalizedEmp === "self";

      if (shouldIncludeHallesche) {
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
        if (!isEU || isStudent)
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
      const resolvedProducts = buildProductsForJourney({
        alreadyInGermany: store.alreadyInGermany,
        employmentStatus: es,
        incomeRange: ir,
        actualIncome: ai,
        age,
        universityType: store.universityType,
        currentFlowProducts: products as JourneyProduct[],
        tkPremium: adjusted,
      });

      useJourneyStore.setState({
        availableProducts: resolvedProducts,
        selectedCountry: sc,
      });
      setIsNavigating(true);
      router.push("/calculator");
    } catch (e) {
      console.error(e);
      setIsNavigating(false);
      setPopup("An error occurred. Please try again.");
    }
  }, [selectedCountry, hasChildren, router]);

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

  // ── Shared page shell ─────────────────────────────────
  const Shell = ({
    children,
    stepNum,
  }: {
    children: React.ReactNode;
    stepNum: number;
  }) => (
    <div
      className={`min-h-screen bg-[#F5F5F7] flex flex-col ${isNavigating ? "pointer-events-none" : ""}`}
    >
      {/* Hero headline */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-2 text-center">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold tracking-widest text-[#820ad1] uppercase mb-2"
        >
          Health Insurance Finder
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight"
        >
          Just <span className="text-[#820ad1]">2 minutes</span> to find your
          best-fit insurance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-gray-400 mt-1.5"
        >
          No calls, no commitments — unless you want them.
        </motion.p>
      </div>

      {/* Progress */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <ProgressBar current={getProgressStep(stepNum)} total={7} />
      </div>

      {/* Card grid */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 pb-12">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* LEFT — question panel */}
          <AnimatePresence>
            <motion.div
              key={`step-${stepNum}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative rounded-3xl   p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* RIGHT — image panel */}
          <RightPanel />
        </div>
      </div>

      <AnimatePresence>{popup && <Popup message={popup} />}</AnimatePresence>
    </div>
  );

  // ── Step label ─────────────────────────────────────────
  const StepLabel = ({ n }: { n: number }) => (
    <p className="text-xs font-semibold text-[#820ad1] uppercase tracking-widest mb-3">
      Step {n}
    </p>
  );

  // ══════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════

  /* Step 1 */
  if (step === STEP_ALREADY_IN_GERMANY)
    return (
      <Shell stepNum={STEP_ALREADY_IN_GERMANY}>
        <StepLabel n={1} />
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          Are you already in Germany?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm text-gray-400 mb-6"
        >
          If yes, we keep you on the current recommendation flow.
        </motion.p>

        <div className="flex flex-col gap-3 mt-2">
          <OptionRow
            label="Yes, I am already in Germany"
            icon={CheckCircle2}
            onClick={() => handleAlreadyInGermanySelect("yes")}
          />
          <OptionRow
            label="No, I am planning to come to Germany"
            icon={Globe}
            onClick={() => handleAlreadyInGermanySelect("no")}
          />
        </div>
      </Shell>
    );

  /* Step 2 — Employment */
  if (step === STEP_EMPLOYMENT)
    return (
      <Shell stepNum={STEP_EMPLOYMENT}>
        <StepLabel n={2} />
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          What's your employment status?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm text-gray-400 mb-6"
        >
          This helps us match you with the right insurance plan.
        </motion.p>

        <div className="flex flex-col gap-3 mt-2">
          {EMPLOYMENT_OPTIONS.map((item) => (
            <OptionRow
              key={item.label}
              label={item.label.trim()}
              icon={item.icon}
              onClick={() => handleEmploymentSelect(item.label)}
            />
          ))}
        </div>
        <BackButton onClick={handleBack} />
      </Shell>
    );

  if (step === STEP_OTHER_CONTACT)
    return (
      <Shell stepNum={STEP_OTHER_CONTACT}>
        <motion.div variants={itemVariants} className="w-full max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            {/* Top Gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500" />

            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-violet-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.73 21a2 2 0 01-3.46 0"
                  />
                </svg>
              </div>

              {/* Heading */}
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold tracking-tight text-slate-900 mb-3"
              >
                Speak with a Specialist
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md mb-8"
              >
                Based on your employment status, we'd like one of our
                specialists to guide you personally and help you choose the best
                insurance setup.
              </motion.p>

              {/* Info Box */}
              <div className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-violet-100 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-violet-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16h6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.24-1.06L3 21l1.06-4.76A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      Personalized Guidance
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Our specialist will review your situation and help you
                      with the next steps for your insurance eligibility and
                      onboarding.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/book-appointment")}
                className="w-full sm:w-auto cursor-pointer px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Book an Appointment
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
          </div>
        </motion.div>
        <BackButton onClick={handleBack} />
      </Shell>
    );

  /* Step 2 — Income */
  if (step === STEP_INCOME)
    return (
      <Shell stepNum={STEP_INCOME}>
        <StepLabel n={3} />
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          Your yearly gross income
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm text-gray-400 mb-6"
        >
          This determines which plans you qualify for.
        </motion.p>

        <div className="flex flex-col gap-3 mt-2">
          {INCOME_OPTIONS.map((item) => (
            <OptionRow
              key={item.value}
              label={item.label}
              icon={Euro}
              onClick={() => handleIncomeSelect(item.value)}
            />
          ))}
        </div>
        <BackButton onClick={handleBack} />
      </Shell>
    );

  /* Step 3 — Children */
  if (step === STEP_CHILDREN)
    return (
      <Shell stepNum={STEP_CHILDREN}>
        <StepLabel n={4} />
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          Do you have children?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm text-gray-400 mb-6"
        >
          This affects your care insurance rate.
        </motion.p>

        <div className="flex flex-col gap-3 mt-2">
          <OptionRow
            label="Yes, I have children"
            icon={Baby}
            onClick={() => handleChildrenSelection(true)}
          />
          <OptionRow
            label="No children"
            icon={XCircle}
            onClick={() => handleChildrenSelection(false)}
          />
        </div>
        <BackButton onClick={handleBack} />
      </Shell>
    );

  /* Step 98 — Contact for <30k */
  if (step === 98)
    return (
      <Shell stepNum={98}>
        <motion.div variants={itemVariants} className="w-full max-w-xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
            {/* Top Gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500" />

            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-violet-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-3.866 0-7 2.239-7 5 0 1.12.52 2.154 1.4 3L5 21l4.1-2.05c.9.3 1.87.45 2.9.45 3.866 0 7-2.239 7-5s-3.134-5-7-5z"
                  />
                  <circle cx="9" cy="13" r="1" fill="currentColor" />
                  <circle cx="12" cy="13" r="1" fill="currentColor" />
                  <circle cx="15" cy="13" r="1" fill="currentColor" />
                </svg>
              </div>

              {/* Heading */}
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold tracking-tight text-slate-900 mb-3"
              >
                Get Personalized Assistance
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md mb-8"
              >
                Based on your profile, one of our insurance specialists will
                help you explore the most suitable coverage options available
                for you.
              </motion.p>

              {/* Info Card */}
              <div className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-violet-100 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-violet-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16h6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.24-1.06L3 21l1.06-4.76A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      Specialist Consultation
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Our team will guide you through the available insurance
                      plans and help you choose the best fit for your situation.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/book-appointment")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Book an Appointment
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
          </div>
        </motion.div>
        <BackButton onClick={handleBack} />
      </Shell>
    );

  /* Step 4 — Birth Year */
  if (step === STEP_DOB)
    return (
      <Shell stepNum={STEP_DOB}>
        <StepLabel n={5} />
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          What's your birth year?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm text-gray-400 mb-6"
        >
          Your age affects premium calculations.
        </motion.p>

        <div className="flex flex-col gap-3">
          <motion.select
            variants={itemVariants}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:border-[#820ad1] focus:ring-2 focus:ring-[#820ad1]/20 transition bg-white cursor-pointer"
          >
            <option value="">Select birth year</option>
            {birthYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </motion.select>

          <AnimatePresence>
            {calculatedAge && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-[#820ad1] bg-[#f0ebff] px-4 py-3 rounded-2xl"
              >
                Age:{" "}
                <span className="font-semibold">{calculatedAge} years old</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NextButton label="Next" onClick={handleDobSubmit} disabled={!dob} />
        <BackButton onClick={handleBack} />
      </Shell>
    );

  /* Step 6 — University */
  if (step === STEP_UNIVERSITY)
    return (
      <Shell stepNum={STEP_UNIVERSITY}>
        <StepLabel n={6} />
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          Which type of university are you enrolled in?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm text-gray-400 mb-6"
        >
          This helps us decide public vs private student eligibility.
        </motion.p>

        <div className="flex flex-col gap-3 mt-2">
          {UNIVERSITY_OPTIONS.map((item) => (
            <OptionRow
              key={item.value}
              label={item.label}
              icon={Building2}
              onClick={() => handleUniversitySelect(item.value)}
            />
          ))}
        </div>
        <BackButton onClick={handleBack} />
      </Shell>
    );

  /* Step 7 — Country */
if (step === STEP_COUNTRY)
  return (
    <Shell stepNum={STEP_COUNTRY}>
      <StepLabel n={7} />

      <motion.h2
        variants={itemVariants}
        className="text-2xl font-bold text-gray-900 mb-1"
      >
        Where are you from?
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-sm text-gray-400 mb-6"
      >
        We use this as informational context for your profile.
      </motion.p>

      <div className="flex flex-col gap-3">
        <motion.div
          variants={itemVariants}
          className="relative"
          ref={dropdownRef}
        >
          {/* SELECT BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen((prev) => !prev);
            }}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm flex items-center justify-between bg-white hover:border-[#820ad1] focus:outline-none focus:border-[#820ad1] focus:ring-2 focus:ring-[#820ad1]/20 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {selectedCountryData ? (
                <>
                  {selectedCountryData.flag ? (
                    <Image
                      src={selectedCountryData.flag}
                      alt={selectedCountryData.name}
                      width={22}
                      height={14}
                      className="rounded object-cover"
                    />
                  ) : (
                    <span
                      className="w-[22px] h-[14px] rounded border border-gray-200 bg-gray-100 shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  <span className="text-gray-800 font-medium">
                    {selectedCountryData.name}
                  </span>
                </>
              ) : (
                <span className="text-gray-400">
                  Select your country
                </span>
              )}
            </div>

            <motion.svg
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-400 shrink-0"
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

          {/* DROPDOWN */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="max-h-72 overflow-y-auto py-1">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        handleCountrySelect(country.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-sm text-left transition-all duration-150 cursor-pointer
                      ${
                        selectedCountry === country.name
                          ? "bg-[#f3e8ff]"
                          : "hover:bg-[#faf5ff]"
                      }`}
                    >
                      {country.flag ? (
                        <Image
                          src={country.flag}
                          alt={country.name}
                          width={22}
                          height={14}
                          className="rounded object-cover shrink-0"
                        />
                      ) : (
                        <span
                          className="w-[22px] h-[14px] rounded border border-gray-200 bg-gray-100 shrink-0"
                          aria-hidden="true"
                        />
                      )}

                      <span className="text-gray-700 font-medium">
                        {country.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <NextButton
        label={isNavigating ? "Loading…" : "See my recommendations"}
        onClick={handleCountrySubmit}
        disabled={!selectedCountry || isNavigating}
      />

      <BackButton onClick={handleBack} />
    </Shell>
  );

  return null;
}
