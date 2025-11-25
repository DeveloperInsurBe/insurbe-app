"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

// Step options (labels must match your image)
const steps = [
  "Select Job Industry",
  "Select Income Range",
  "What's your plan to stay?",
  "Mode of communication",
  "What's your age?",
  "Select Marital Status"
];

const jobOptions = ["Mechanical", "Technical", "Consultant"];
const incomeOptions = ["Below €30,000", "€30,000 - €50,000", "Above €50,000"];
const planOptions = ["Short term", "Permanent", "Undecided"];
const modeOptions = ["Email", "Phone"];
const maritalOptions = ["Single", "Married"];

// --- Types ---
type FormData = {
  job?: string;
  income?: string;
  plan?: string;
  mode?: string;
  age?: string;
  marital?: string;
};

type StepContentProps = {
  step: number;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

// -- Dynamic Step Panel Content --
function StepContent({ step, formData, setFormData }: StepContentProps) {
  switch (step) {
    case 0: // Job Industry
      return (
        <div className="flex justify-center gap-8">
          {jobOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-base font-medium transition-all
                ${formData.job === opt ? "bg-[#511E6D] text-white ring-4 ring-[#e0d4f5]" : "bg-white text-gray-700 border border-[#e0d4f5]"}
              `}
              onClick={() => setFormData((f) => ({ ...f, job: opt }))}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case 1: // Income Range
      return (
        <div>
          <label className="block mb-6 font-semibold text-gray-900 text-lg">Select Income Range</label>
          <select
            className="w-full rounded-md py-3 px-4 border border-[#e0d4f5] bg-white text-gray-700 text-base font-medium"
            value={formData.income ?? ""}
            onChange={(e) => setFormData((f) => ({ ...f, income: e.target.value }))}
          >
            <option value="" disabled>Select</option>
            {incomeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    case 2: // Plan to stay
      return (
        <div>
          <label className="block mb-6 font-semibold text-gray-900 text-lg">What&apos;s your plan to stay?</label>
          <div className="flex gap-4">
            {planOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`px-5 py-3 rounded-xl font-semibold transition-all
                  ${formData.plan === opt ? "bg-[#511E6D] text-white" : "bg-[#e8e7ee] text-[#511E6D]"}
                `}
                onClick={() => setFormData((f) => ({ ...f, plan: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    case 3: // Mode of communication
      return (
        <div>
          <label className="block mb-6 font-semibold text-gray-900 text-lg">Mode of communication</label>
          <div className="flex gap-8">
            {modeOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`w-24 h-24 rounded-full flex items-center justify-center font-semibold text-base transition-all
                  ${formData.mode === opt ? "bg-[#511E6D] text-white" : "bg-white text-[#511E6D] border border-[#e0d4f5]"}
                `}
                onClick={() => setFormData((f) => ({ ...f, mode: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    case 4: // Age
      return (
        <div>
          <label className="block mb-6 font-semibold text-gray-900 text-lg">What&apos;s your age?</label>
          <input
            className="w-40 border border-[#e0d4f5] rounded px-4 py-3 text-base font-medium"
            type="number"
            placeholder="Enter age"
            min={18}
            max={100}
            value={formData.age ?? ""}
            onChange={(e) => setFormData((f) => ({ ...f, age: e.target.value }))}
          />
        </div>
      );
    case 5: // Marital Status
      return (
        <div>
          <label className="block mb-6 font-semibold text-gray-900 text-lg">Select Marital Status</label>
          <div className="flex gap-8">
            {maritalOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`px-8 py-4 rounded-lg font-semibold transition-all
                  ${formData.marital === opt ? "bg-[#511E6D] text-white" : "bg-white text-[#511E6D] border border-[#e0d4f5]"}
                `}
                onClick={() => setFormData((f) => ({ ...f, marital: opt }))}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

// --- Main Form ---
export default function PensionFormSection() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({ job: "Technical" });

  return (
    <section className="bg-gradient-to-br from-[#f5f0ff] to-white py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-bold text-black mb-4"
          >
            Fill out the short form, and we’ll get in touch to <br /> schedule your free consultation.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-gray-500 text-base md:text-lg mb-2"
          >
            No calls, no commitments — unless you want them.
          </motion.p>
        </div>
        <div className="flex flex-col md:flex-row gap-10 justify-center items-start w-full">
          {/* Left steps list */}
          <div className="flex flex-col w-full md:w-1/3 gap-2">
            {steps.map((label, idx) => (
              <button
                key={label}
                type="button"
                className={`text-left px-5 py-3 rounded-md font-semibold text-base mb-1 transition-all
                  ${idx === currentStep
                    ? "bg-[#511E6D] text-white shadow"
                    : "bg-transparent text-gray-900 hover:bg-[#e0d4f5]"
                  }`}
                onClick={() => setCurrentStep(idx)}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Right dynamic panel */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:max-w-lg p-10 bg-white rounded-xl shadow"
          >
            <StepContent step={currentStep} formData={formData} setFormData={setFormData} />
            <div className="flex gap-3 mt-10 justify-end">
              <button
                type="button"
                className={`px-5 py-2 rounded border font-medium
                  ${currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#e0daf2] text-[#511E6D] hover:bg-[#d9c9ef]"
                  }`}
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              >
                Back
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded bg-[#511E6D] text-white font-medium"
                onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                Next
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
