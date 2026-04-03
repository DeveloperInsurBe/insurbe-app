"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { NEW_CARD_BG } from "@/app/constants/styles";
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

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */

export default function PrivateInsuranceTariffs() {
  const router = useRouter();
  const [showCompare, setShowCompare] = useState(false);
  const journeyStore = useJourneyStore();
  const setSelectedPlan = useJourneyStore((s) => s.setSelectedPlan);

  const handlePlanSelect = (key: ComparisonKey, title: string, price: string) => {
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
    router.push("/calculator/submitApplication");
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

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Which{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-primary">
              tariff suits
            </span>{" "}
            you best
          </h2>

          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Maximum freedom of choice with first-class medical care.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["standard", "plus", "premium"] as const).map((key) => {
            const title =
              key === "standard"
                ? "Standard"
                : key === "plus"
                  ? "Plus"
                  : "Premium";

            const price =
              key === "standard"
                ? "€331.73"
                : key === "plus"
                  ? "€526.57"
                  : "€636.00";

            return (
              <TariffColumn
                key={key}
                title={title}
                price={price}
                period="per month"
                badge={
                  key === "plus"
                    ? "Most Popular"
                    : key === "premium"
                      ? "Ultimate"
                      : "Essential"
                }
                highlighted={key === "plus"}
                onSelect={() => handlePlanSelect(key, title, price)}
              />
            );
          })}
        </div>

        {/* Compare Button */}
        {/* <div className="text-center mt-8">
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="px-10 py-4 rounded-full bg-linear-to-r from-purple-600 to-primary text-white font-semibold shadow-lg inline-flex items-center gap-2"
          >
            {showCompare ? "Hide" : "Compare"} tariffs
            {showCompare ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div> */}

        {/* Button (Above Table Only When Closed) */}
        {!showCompare && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowCompare(true)}
              className="px-10 py-4 rounded-full bg-linear-to-r from-purple-600 to-primary text-white font-semibold shadow-lg inline-flex items-center gap-2"
            >
              Compare tariffs
              <ChevronDown />
            </button>
          </div>
        )}

        {/* ================= SIMPLE FEATURE COMPARISON ================= */}

        <AnimatePresence>
          {showCompare && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              {/* Scrollable Content */}
              <div className="h-full space-y-8 px-8 py-4 ">
                {comparisonData.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-400"
                  >
                    {/* Heading */}
                    <h3 className="text-md font-semibold pl-12 pt-4 text-gray-800">
                      {item.label}
                    </h3>

                    {/* Values Row */}
                    <div
                      className="grid grid-cols-3 text-sm font-medium text-gray-700 text-center py-4 
                bg-linear-to-r from-white/20 via-gray-100/60 to-purple-100/40"
                    >
                      {" "}
                      <div>{item.standard}</div>
                      <div>{item.plus}</div>
                      <div>{item.premium}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button (Below Table When Open) */}
        {showCompare && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowCompare(false)}
              className="px-10 py-4 rounded-full bg-linear-to-r from-purple-600 to-primary text-white font-semibold shadow-lg inline-flex items-center gap-2"
            >
              Hide tariffs
              <ChevronUp />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CARD COMPONENT */
/* ------------------------------------------------------------------ */

function TariffColumn({
  title,
  price,
  period,
  badge,
  highlighted,
  onSelect,
}: {
  title: string;
  price: string;
  period: string;
  badge: string;
  highlighted?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`relative p-8 rounded-3xl ${
        highlighted ? `${NEW_CARD_BG}` : "bg-white shadow-xl"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-400 to-blue-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          {badge}
        </div>
      )}

      <h3 className="text-3xl font-bold mb-4">{title}</h3>

      <div className="mb-6">
        <span className="text-3xl font-bold">{price}</span>
        <span className="ml-2 text-sm">{period}</span>
      </div>

      <ul className="space-y-4 mb-8">
        <li className="flex gap-3">
          <Check className="w-4 h-4" />
          Comprehensive outpatient care
        </li>
        <li className="flex gap-3">
          <Check className="w-4 h-4" />
          Strong dental benefits
        </li>
        <li className="flex gap-3">
          <Check className="w-4 h-4" />
          Flexible hospital options
        </li>
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-4 rounded-full font-bold ${
          highlighted
            ? "bg-white text-purple-600"
            : "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
        }`}
      >
        Select Plan
      </button>
    </div>
  );
}
