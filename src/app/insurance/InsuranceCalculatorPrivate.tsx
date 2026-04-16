"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CalculatorIcon } from "lucide-react";

type EmploymentStatus = "Employed" | "Self Employed/Freelancer" | "Other";

const statusOptions: EmploymentStatus[] = [
  "Employed",
  "Self Employed/Freelancer",
  "Other",
];

/* -------------------------------------------------------------------------- */
/*                              CALCULATION LOGIC                             */
/* -------------------------------------------------------------------------- */

export function calculateTKPremium(
  monthlyIncome: number,
  age: number,
  hasChildren: boolean,
  employmentStatus: EmploymentStatus,
  isSaxony: boolean,
): PremiumBreakdown {
  /* --------------------------- CONSTANTS (2025 TK) --------------------------- */

  const CONTRIBUTION_CEILING = 5850; // 2025 official
  const GENERAL_RATE = 0.146; // 14.6%
  // const TK_ZUSATZ = 0.0269; // 2.69%
  const TK_ZUSATZ = 0.02542; // 2.6%

  const SELF_EMPLOYED_MIN = 1318.33;

  const isSelfEmployed = employmentStatus === "Self Employed/Freelancer";

  /* ---------------------------- ROUNDING HELPER ---------------------------- */

  const round2 = (value: number) => Math.round(value * 100) / 100;

  /* ---------------------------- EFFECTIVE INCOME --------------------------- */

  let effectiveIncome = Math.min(monthlyIncome, CONTRIBUTION_CEILING);

  if (isSelfEmployed) {
    effectiveIncome = Math.max(effectiveIncome, SELF_EMPLOYED_MIN);
  }

  /* --------------------------- HEALTH PART ONLY --------------------------- */

  let healthContribution = 0;

  if (isSelfEmployed) {
    healthContribution = round2(effectiveIncome * GENERAL_RATE);
  } else {
    healthContribution = round2(effectiveIncome * (GENERAL_RATE / 2));
  }

  /* --------------------------- ZUSATZ PART ONLY --------------------------- */

  let zusatzContribution = 0;

  if (isSelfEmployed) {
    zusatzContribution = round2(effectiveIncome * TK_ZUSATZ);
  } else {
    zusatzContribution = round2(effectiveIncome * (TK_ZUSATZ / 2));
  }

  /* --------------------------- CARE INSURANCE ----------------------------- */

  let careContribution = 0;

  if (isSelfEmployed) {
    const careRate = hasChildren || age < 23 ? 0.036 : 0.042;

    careContribution = round2(effectiveIncome * careRate);
  } else {
    if (hasChildren || age < 23) {
      // With children
      careContribution = round2(effectiveIncome * (isSaxony ? 0.023 : 0.018));
    } else {
      // Childless 23+
      careContribution = round2(effectiveIncome * (isSaxony ? 0.029 : 0.024));
    }
  }

  /* ------------------------------ TOTAL ----------------------------------- */

  const totalMonthly =
    healthContribution + zusatzContribution + careContribution;

  return {
    healthContribution,
    zusatzContribution,
    careContribution,
    total: round2(totalMonthly),
  };
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

type PremiumBreakdown = {
  healthContribution: number;
  zusatzContribution: number;
  careContribution: number;
  total: number;
};

export default function InsuranceCalculatorPrivate({
  setPremium,
  premium,
}: {
  setPremium: (value: PremiumBreakdown | null) => void;
  premium: PremiumBreakdown | null;
}) {
  const [status, setStatus] = useState<EmploymentStatus>("Employed");
  const [income, setIncome] = useState("6500");
  const [age, setAge] = useState("30");
  const [hasKids, setHasKids] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaxony, setIsSaxony] = useState(false);
  const numericIncome = parseFloat(income.replace(/[^0-9.]/g, ""));
  const [showMidijobMessage, setShowMidijobMessage] = useState(false);

  const isMidijob =
    status === "Employed" && numericIncome > 0 && numericIncome <= 2000;
  const handleCalculate = () => {
    const inc = parseFloat(income.replace(/[^0-9.]/g, ""));
    const ag = parseInt(age);

    if (!inc || !ag || isNaN(inc) || isNaN(ag)) {
      setPremium(null);
      return;
    }
     if (inc <= 2000 && status === "Employed") {
    setShowMidijobMessage(true);
    setPremium(null);
    return;
  }

      setShowMidijobMessage(false);
    setIsCalculating(true);

    // Simulate calculation delay for animation effect
    setTimeout(() => {
      const result = calculateTKPremium(inc, ag, hasKids, status, isSaxony);

      setPremium(result);
      setIsCalculating(false);
    }, 800);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 left-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
              TK Calculator
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Health Insurance{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-primary">
              Premium Calculator
            </span>
          </h2>
          <p className="mt-3 text-gray-600">
            Estimate your monthly health insurance contribution
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white/20 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100"
        >
          {/* LEFT – FORM */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Employment Status (Full Width) */}
            <motion.div variants={itemVariants}>
              <label className="block font-semibold mb-3 text-gray-900">
                Employment Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <motion.button
                    key={opt}
                    onClick={() => setStatus(opt)}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all
              ${
                status === opt
                  ? "bg-linear-to-r from-purple-600 to-primary text-white border-transparent shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:shadow-md"
              }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Responsive Grid Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income */}
              <motion.div variants={itemVariants}>
                <label className="block font-semibold mb-3 text-gray-900">
                  Gross Monthly Income (€)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Max cap: €5,512.50 / month
                </p>
              </motion.div>

              {/* Age */}
              <motion.div variants={itemVariants}>
                <label className="block font-semibold mb-3 text-gray-900">
                  Age
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all"
                />
              </motion.div>

              {/* Children */}
              <motion.div variants={itemVariants}>
                <label className="block font-semibold mb-3 text-gray-900">
                  Do you have children?
                </label>
                <div className="flex gap-3">
                  {["Yes", "No"].map((opt) => (
                    <motion.button
                      key={opt}
                      onClick={() => setHasKids(opt === "Yes")}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-all
                ${
                  hasKids === (opt === "Yes")
                    ? "bg-linear-to-r from-purple-600 to-primary text-white border-transparent shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:shadow-md"
                }`}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Federal State */}
              <motion.div variants={itemVariants}>
                <label className="block font-semibold mb-3 text-gray-900">
                  Federal State
                </label>
                <div className="flex gap-3">
                  {["Employed in Saxony", "Other State"].map((opt) => (
                    <motion.button
                      key={opt}
                      onClick={() => setIsSaxony(opt === "Employed in Saxony")}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-all
                ${
                  isSaxony === (opt === "Employed in Saxony")
                    ? "bg-linear-to-r from-purple-600 to-primary text-white border-transparent shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:shadow-md"
                }`}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleCalculate}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              disabled={isCalculating}
              className="w-full py-4 rounded-xl font-semibold text-white
        bg-linear-to-r from-purple-600 to-primary
        hover:opacity-90 transition-all shadow-lg cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden"
            >
              {isCalculating ? "Calculating..." : "Calculate Monthly Premium"}
            </motion.button>
          </motion.div>

          {/* RIGHT – RESULT */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-center items-center text-center bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
          >
            {/* Logo Added */}
            <Image
              src="/icons/tk.png"
              alt="Provider Logo"
              width={60}
              height={60}
              className="mb-4 object-contain"
            />

            <p className="text-sm font-medium text-gray-600 mb-2">
              Estimated Monthly Premium
            </p>

            <motion.div className="text-5xl bg-linear-to-r from-purple-600 to-primary bg-clip-text text-transparent mb-2">
              {showMidijobMessage  ? (
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your estimated monthly contribution to health and long-term
                    care insurance
                  </h3>

                  <p className="text-gray-700 text-sm">
                    You have stated that your monthly income does not exceed
                    €2,000.00.
                  </p>

                  <p className="text-gray-600 text-sm">
                    A special contribution calculation applies to low-wage
                    earners. This is intended to reduce their contribution
                    burden. <br/> <a
                    href="https://www.tk-lex.tk.de/web/guest/externalcontent?_leongshared_serviceId=2006&_leongshared_externalcontentid=HI7546979"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 text-sm "
                  >
                    TK Midjob Calculator →
                  </a>
                  </p>

                 
                </div>
              ) : premium ? (
                <>
                  <div className="flex gap-4 text-sm text-gray-900">
                    <p className="text-sm text-gray-600 mb-2">
                      Health insurance :
                    </p>
                    {premium.healthContribution.toFixed(2)} €
                  </div>

                  <div className="flex gap-4 text-sm text-gray-900">
                    <p className="text-sm text-gray-600 mb-2">
                      TK supplementary :
                    </p>
                    {premium.zusatzContribution.toFixed(2)} €
                  </div>

                  <div className="flex gap-4 text-sm text-gray-900">
                    <p className="text-sm text-gray-600 mb-4">
                      Long-term care :
                    </p>
                    {premium.careContribution.toFixed(2)} €
                  </div>

                  <div className="border-t pt-3">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-transparent">
                      {premium.total.toFixed(2)} €
                    </div>
                    <p className="text-gray-600 text-sm">Total contribution</p>
                  </div>
                </>
              ) : (
                <div className="text-5xl text-gray-800">--</div>
              )}
            </motion.div>

            {/* <p className="text-gray-500 text-sm mb-6">
              {status === "Self Employed/Freelancer"
                ? "Full contribution"
                : "Employee portion only"}
            </p> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
