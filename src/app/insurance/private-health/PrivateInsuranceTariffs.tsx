"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Diamond,
  Crown,
  ShieldCheck,
  Users,
  Award,
  Lock,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useJourneyStore } from "@/app/stores/journeyStore";

/* ------------------------------------------------------------------ */
/* DATA */
/* ------------------------------------------------------------------ */

type ComparisonKey = "standard" | "plus" | "premium";

type PlanConfig = {
  id: string;
  name: string;
  provider: string;
  description: string;
  features: string[];
  tariffIds: string[];
};

const PLAN_CONFIG: Record<ComparisonKey, PlanConfig> = {
  standard: {
    id: "hallesche-standard",
    name: "Hallesche Standard",
    provider: "Hallesche",
    description: "Private standard coverage bundle",
    features: [
      "Comprehensive outpatient care",
      "Strong dental benefits",
      "Flexible hospital options",
    ],
    tariffIds: ["35653", "24449", "24332", "1803"],
  },
  plus: {
    id: "hallesche-plus",
    name: "Hallesche Plus",
    provider: "Hallesche",
    description: "Private plus coverage bundle",
    features: [
      "Comprehensive outpatient care",
      "Strong dental benefits",
      "Flexible hospital options",
    ],
    tariffIds: ["35659", "36129", "24332", "1803"],
  },
  premium: {
    id: "hallesche-premium",
    name: "Hallesche Premium",
    provider: "Hallesche",
    description: "NK.select XL Bonus + NK.select Flex",
    features: [
      "Comprehensive private coverage",
      "Private hospital room",
      "Full dental coverage",
      "Daily hospital benefit",
      "Care insurance included",
    ],
    tariffIds: ["35659", "36129", "24332", "1803"],
  },
};

const comparisonData: Array<{ label: string } & Record<ComparisonKey, string>> =
  [
    {
      label: "Hospital accommodation",
      standard: "Shared room",
      plus: "2-bed room",
      premium: "Single room",
    },
    {
      label: "Doctor choice",
      standard: "Attending physician",
      plus: "Private doctor",
      premium: "Private doctor",
    },
    {
      label: "Medicines & remedies",
      standard: "80% up to €4,000",
      plus: "80% up to €2,000",
      premium: "100%",
    },
    {
      label: "Alternative medicine",
      standard: "–",
      plus: "€1,200 / year",
      premium: "€2,400 / year",
    },
    {
      label: "Visual aids",
      standard: "€150 / 2 years",
      plus: "€300 / 2 years",
      premium: "€450 / 2 years",
    },
    {
      label: "Dental treatment",
      standard: "100% (1 cleaning)",
      plus: "100% (2 cleanings)",
      premium: "100%",
    },
    {
      label: "Dentures & orthodontics",
      standard: "70%",
      plus: "80%",
      premium: "90%",
    },
    {
      label: "Deductible",
      standard: "€600 – €3,000",
      plus: "€600 – €3,000",
      premium: "€600 – €3,000",
    },
    {
      label: "Health bonus",
      standard: "€100 / month",
      plus: "€100 / month",
      premium: "€100 / month",
    },
  ];

const PLANS: {
  key: ComparisonKey;
  title: string;
  price: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "standard",
    title: "Standard",
    price: "€331.73",
    icon: <Diamond className="w-5 h-5" />,
  },
  {
    key: "plus",
    title: "Plus",
    price: "€526.57",
    icon: <Crown className="w-5 h-5" />,
  },
  {
    key: "premium",
    title: "Premium",
    price: "€636.00",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
];

const TRUST_ITEMS = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "For employees",
    desc: "Designed for you and your needs",
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: "Top-rated",
    desc: "95% customer recommendation",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Secure & reliable",
    desc: "Stable premiums you can count on",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Better together",
    desc: "Employer contribution up to 50%",
  },
];

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */

export default function PrivateInsuranceTariffs() {
  const router = useRouter();
  const [showCompare, setShowCompare] = useState(false);
  const setSelectedPlan = useJourneyStore((s) => s.setSelectedPlan);

  const handlePlanSelect = (
    key: ComparisonKey,
    title: string,
    price: string
  ) => {
    const cfg = PLAN_CONFIG[key];
    const planData = {
      id: cfg.id,
      name: cfg.name || title,
      provider: cfg.provider,
      description: cfg.description,
      features: cfg.features,
      tariffIds: cfg.tariffIds,
      documentCount: 0,
      loading: false,
      available: true,
      recommended: true,
      title,
      price,
      period: "/ Month",
      category: "Private",
    };
    sessionStorage.setItem("selectedPlan", JSON.stringify(planData));
    setSelectedPlan(planData as any);
    router.push("/products/insuranceJourney");
  };

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Choose Your Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            Which{" "}
            <span className="text-purple-600">tariff suits</span>{" "}
            you best
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-base">
            Maximum freedom of choice with first-class medical care.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(({ key, title, price, icon }) => {
            const isPlus = key === "plus";
            const cfg = PLAN_CONFIG[key];
            return (
              <div
                key={key}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  isPlus
                    ? "bg-purple-600 text-white shadow-2xl"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                {/* Most Popular badge */}
                {isPlus && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-400 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap"
                  >
                    <Star className="w-3 h-3 fill-white" />
                    Most Popular
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${
                    isPlus
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {icon}
                </div>

                {/* Title */}
                <h3
                  className={`text-2xl font-bold mb-1 ${
                    isPlus ? "text-white" : "text-gray-900"
                  }`}
                >
                  {title}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span
                    className={`text-3xl font-bold ${
                      isPlus ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {price}
                  </span>
                  <span
                    className={`text-sm ${
                      isPlus ? "text-white/75" : "text-gray-400"
                    }`}
                  >
                    per month
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {cfg.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${
                        isPlus ? "text-white/90" : "text-gray-500"
                      }`}
                    >
                      <CheckCircle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPlus ? "text-white/90" : "text-primary"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handlePlanSelect(key, title, price)}
                  className={`w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 ${
                    isPlus
                      ? "bg-white text-purple-600"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  Select Plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Compare Button (top — hidden when open) */}
        {!showCompare && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowCompare(true)}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-semibold shadow-lg transition-opacity hover:opacity-90 bg-purple-600"
            >
              Compare tariffs
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Comparison Table */}
        {showCompare && (
          <div className="mt-4">
            <div className="space-y-0 px-8 py-4">
              {comparisonData.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-gray-300"
                >
                  <h3 className="text-sm font-semibold pl-8 pt-4 pb-2 text-gray-800">
                    {item.label}
                  </h3>
                  <div className="grid grid-cols-3 text-sm font-medium text-gray-700 text-center py-4 rounded-lg bg-purple-50">
                    <div>{item.standard}</div>
                    <div>{item.plus}</div>
                    <div>{item.premium}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hide Button (bottom — shown when open) */}
        {showCompare && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowCompare(false)}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-semibold shadow-lg transition-opacity hover:opacity-90 bg-purple-600"
            >
              Hide tariffs
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Trust Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-200">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-600">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}