"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type EmploymentStatus = "Salaried" | "Freelancer" | "Self Employed" | "Other";

const statusOptions: EmploymentStatus[] = [
  "Salaried",
  "Freelancer",
  "Self Employed",
  "Other",
];

// Simple premium logic
function calculatePremium(
  status: EmploymentStatus,
  income: number,
  age: number,
  hasKids: boolean
) {
  let base = 50;

  if (status === "Freelancer") base += 20;
  if (status === "Self Employed") base += 30;

  base += income * 0.003;

  if (age > 30) base += (age - 30) * 1.5;

  if (hasKids) base += 25;

  return Math.round(base);
}

export default function InsuranceCalculator() {
  const [status, setStatus] = useState<EmploymentStatus>("Salaried");
  const [income, setIncome] = useState<string>("6500");
  const [age, setAge] = useState<string>("30");
  const [hasKids, setHasKids] = useState<boolean>(false);

  const [premium, setPremium] = useState<number | null>(null);

  function handleCalculate() {
    const inc = parseFloat(income.replace(/[^0-9]/g, ""));
    const ag = parseInt(age);

    if (!inc || !ag) {
      setPremium(null);
      return;
    }

    const result = calculatePremium(status, inc, ag, hasKids);
    setPremium(result);
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 px-4">
      
      {/* MAIN CONTAINER */}
      <motion.div
        className="w-full rounded-2xl bg-white shadow-lg flex flex-col md:flex-row p-6 md:p-10 gap-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* LEFT - FORM */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Get a Premium Estimation
          </h2>
          <p className="text-gray-500">By filling basic information</p>

          {/* Employment Status */}
          <div>
            <label className="font-semibold block mb-2">
              Employment Status
            </label>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`px-5 py-2 rounded-md border transition-colors duration-150 ${
                    status === option
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Income */}
          <div>
            <label className="font-semibold block mb-2">
              Gross Monthly Income
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="€ 0"
            />
          </div>

          {/* Age */}
          <div>
            <label className="font-semibold block mb-2">Age in years</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
              min={0}
              max={120}
            />
          </div>

          {/* Kids */}
          <div>
            <label className="font-semibold block mb-2">
              Do you have kids?
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasKids(true)}
                className={`px-6 py-2 rounded-md border ${
                  hasKids
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => setHasKids(false)}
                className={`px-6 py-2 rounded-md border ${
                  !hasKids
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="mt-2 w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition"
          >
            Calculate
          </button>
        </div>

        {/* RIGHT - RESULT */}
        <div className="w-full md:w-72 flex flex-col items-center text-center">
          <p className="text-lg font-semibold mb-2">Starting from</p>

          <div className="flex items-center text-3xl font-bold text-gray-700 mb-2">
            € <span className="ml-2">{premium ?? "____"}</span>
          </div>

          <p className="text-gray-600 mb-4">Per Month</p>

          <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition">
            Compare Available Plans
          </button>
        </div>
      </motion.div>

      {/* BOTTOM BOX */}
      <motion.div
        className="w-full rounded-2xl bg-white shadow-lg flex flex-row gap-6 items-center p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src="/calculator_assets/Calculator.svg"
          alt="calculator"
          width={60}
          height={60}
        />

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-sm font-bold">
            You are eligible for private health insurance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            If you are in good health and have no dependents, private health
            insurance might be a cheaper option for you.
          </p>
        </div>

        <Image src="/icons/arrow.svg" alt="arrow" width={20} height={20} />
      </motion.div>
    </div>
  );
}
