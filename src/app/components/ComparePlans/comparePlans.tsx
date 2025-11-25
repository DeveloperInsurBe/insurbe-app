"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PlansCompare from "./PlanCompares";
import InsuranceCalculator from "../CalculatorComponents/InsuranceCalculator";
import { usePremiumStore } from "@/app/stores/premiumStore";

export default function ComparePlans() {
  const router = useRouter();
  const { premium } = usePremiumStore();

  const [viewMode, setViewMode] = useState("default");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState("");

  const plans = [
    {
      id: "tk",
      name: "TK",
      price: "62",
      period: "/ Month",
      logo: "/icons/tk.svg",
      description: "For short term visitors with no fixed plan of stay",
      features: [
        "24/7 medical assistance/emergency call centre",
        "English support",
        "Digital services",
        "Excellent coverage for families",
      ],
      bgColor: "bg-white",
      available: false,
    },
    {
      id: "hallesche",
      name: "Hallesche",
      price: premium ? premium.toString() : "40",
      period: "/ Month",
      logo: "/icons/h.svg",
      description:
        "For Expats who are planning to stay in Germany for a longer period",
      features: [
        "24/7 medical assistance/emergency call centre",
        "English support",
        "Digital services",
        "Great digital services and best insurance for Expats",
      ],
      bgColor: "bg-purple-50",
      highlighted: true,
      available: true,
    },
    {
      id: "dak",
      name: "DAK",
      price: "49",
      period: "/ Month",
      logo: "/icons/dak.svg",
      description: "Special discount for Residents of Kazakhstan",
      features: [
        "24/7 medical assistance/emergency call centre",
        "English support",
        "Digital services",
        "Excellent customer support in English",
      ],
      bgColor: "bg-pink-50",
      available: false,
    },
  ];

  const handlePersonalizeClick = () => {
    setViewMode("personalize");
    setShowCalculator(true);
  };

  const handleDefaultClick = () => {
    setViewMode("default");
    setShowCalculator(false);
  };

  const handlePersonalizedCalculationClick = () => {
    setViewMode("personalize");
    setShowCalculator(true);
  };

  const handleChoosePlan = (plan: typeof plans[0]) => {
    if (plan.available) {
      router.push("/calculator/submitApplication");
    } else {
      setSelectedPlanName(plan.name);
      setShowComingSoonModal(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              Best Plans suggested <br />
              based on your personal <br /> Profile
            </h1>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDefaultClick}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  viewMode === "default"
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Default
              </button>

              <button
                onClick={handlePersonalizeClick}
                className={`px-6 py-3 rounded-full cursor-pointer font-semibold transition-all ${
                  viewMode === "personalize"
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Personalize
              </button>
            </div>
          </div>

          <div className="text-left lg:text-right max-w-xs">
            <p className="text-sm text-gray-600 mb-3">
              Modify charges to match your profile
            </p>
            <button
              onClick={handlePersonalizedCalculationClick}
              className="bg-primary cursor-pointer hover:bg-primary/80 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors w-full lg:w-auto"
            >
              Personalized Calculation
            </button>
          </div>
        </div>

        {/* Insurance Calculator */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <InsuranceCalculator />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards with Equal Heights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="
            flex md:grid 
            md:grid-cols-3 gap-6 
            overflow-x-auto md:overflow-visible
            snap-x snap-mandatory md:snap-none
            pb-4
          "
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              className={`
                min-w-[85%] xs:min-w-[75%] sm:min-w-[60%] md:min-w-0
                snap-center
                rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all
                flex flex-col
                ${plan.bgColor}
                ${plan.highlighted ? "ring-2 ring-primary" : ""}
              `}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-500 text-xl">€</span>
                    <span className="text-5xl text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>

                  <div className="mt-2 font-medium text-gray-900">
                    {plan.name}
                  </div>
                </div>

                <Image
                  src={plan.logo}
                  width={50}
                  height={50}
                  alt={`${plan.name} logo`}
                  className="object-contain"
                />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-6">{plan.description}</p>

              {/* Features - Flex grow to push button down */}
              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button - Stays at bottom */}
              <button
                onClick={() => handleChoosePlan(plan)}
                className={`w-full py-3 rounded-lg font-semibold cursor-pointer transition-all mt-auto ${
                  plan.highlighted
                    ? "bg-primary text-white shadow-md hover:bg-primary/90"
                    : "bg-white text-primary border-2 border-primary hover:bg-gray-50"
                }`}
              >
                Choose plan
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Show / Hide Details Button */}
        <div className="flex justify-center mt-8">
          {expandedCard ? (
            <button
              onClick={() => setExpandedCard(null)}
              className="px-20 py-3 rounded-lg font-semibold bg-white text-primary border-2 border-primary hover:bg-gray-50 transition-all"
            >
              Hide Details
            </button>
          ) : (
            <button
              onClick={() => setExpandedCard("tk")}
              className="px-20 py-3 rounded-lg font-semibold bg-white text-primary border-2 border-primary hover:bg-gray-50 transition-all"
            >
              Show Details
            </button>
          )}
        </div>

        {/* Comparison Table */}
        {expandedCard === "tk" && (
          <div className="mt-10">
            <PlansCompare />
          </div>
        )}
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComingSoonModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-50"
            >
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Coming Soon!
                </h2>
                <p className="text-gray-600 mb-6">
                  <span className="font-semibold">{selectedPlanName}</span> integration is currently under development. We&apos;ll notify you once it&apos;s available.
                </p>

                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
