"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const stepLabels = [
  "Select Income Range",
  "What's your plan to stay?",
  "Select Marital Status",
  "Dependent Status",
  "Mode of communication",
  "What's your Email?",
  "What's your Age?",
];

const incomeOptions = ["Below 63000", "63000 - 73800", "Above 73800"];
const stayPlans = ["Yes", "No"];
const modes = ["Email", "Call"];
const maritalOptions = ["Yes", "No"];
const ageOptions = ["Below 18", "18-30", "31-45", "46-60", "Above 60"];
const dependentOptions = ["1", "2", "3", "4", "5"];

type FormData = {
  incomeRange?: string;
  plan?: string;
  mode?: string;
  email?: string;
  marital?: string;
  dependent?: string;
  age?: string;
  text?: string;
  number?: string;
};

type RightContentProps = {
  step: number;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  requiredError: boolean;
};

function RequiredNotice({ show }: { show: boolean }) {
  return show ? (
    <p className="text-xs text-red-600 mt-2 mb-0 pl-1">
      This field is required.
    </p>
  ) : null;
}

function RightContent({
  step,
  formData,
  setFormData,
  requiredError,
}: RightContentProps) {
  switch (step) {
    case 0:
      return (
        <div className="flex flex-col gap-2 items-center justify-center w-full ">
          <label className="block mb-2 font-medium text-gray-700 self-center">
            Income Range <span className="text-red-500">*</span>
          </label>
          <select
            className="w-60 bg-[#531D6F1A] rounded-md py-2 px-4 border border-gray-300 text-start mx-auto"
            required
            value={formData.incomeRange ?? ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, incomeRange: e.target.value }))
            }
          >
            <option value="" disabled>
              Select An Option
            </option>
            {incomeOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <div className="w-60 text-center mx-auto">
            <RequiredNotice show={requiredError && !formData.incomeRange} />
          </div>
        </div>
      );
    case 1:
      return (
        <div className="flex flex-col items-center text-center w-full">
          <label className="block mb-2 font-medium text-gray-700">
            Are you confident you&apos;ll stay in Germany more than 5 years?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-8 flex-wrap justify-center">
            {stayPlans.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData((f) => ({ ...f, plan: opt }))}
                className={`px-8 py-3 rounded-md border mx-auto ${
                  formData.plan === opt
                    ? "bg-[#511E6D] text-white border-[#511E6D]"
                    : "bg-white text-[#511E6D] border-gray-200"
                }`}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
          <RequiredNotice show={requiredError && !formData.plan} />
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col items-center text-center w-full">
          <label className="block mb-2 font-medium text-gray-700">
            Are you married? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-8 flex-wrap justify-center">
            {maritalOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData((f) => ({ ...f, marital: opt }))}
                className={`px-8 py-3 rounded-md border ${
                  formData.marital === opt
                    ? "bg-[#511E6D] text-white border-[#511E6D]"
                    : "bg-white text-[#511E6D] border-gray-200"
                }`}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
          <RequiredNotice show={requiredError && !formData.marital} />
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col items-center text-center w-full">
          <label className="block mb-2 font-medium text-gray-700">
            How many dependent do you want to issue?{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            className="w-60 bg-[#531D6F1A] rounded-md py-2 px-4 border border-gray-300 text-start mx-auto"
            value={formData.dependent ?? ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, dependent: e.target.value }))
            }
          >
            <option value="" disabled>
              Select An Option
            </option>
            {dependentOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <div className="w-60 text-center mx-auto">
            <RequiredNotice show={requiredError && !formData.dependent} />
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col items-center text-center w-full">
          <label className="block mb-4 font-medium text-gray-700">
            Would you prefer to be contacted by email or phone?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6 mt-4 mb-2 flex-wrap justify-center">
            {modes.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData((f) => ({ ...f, mode: opt }))}
                className={`w-24 h-24 flex items-center justify-center rounded-full border-2 transition-all text-lg font-medium ${
                  formData.mode === opt
                    ? "bg-[#511E6D] text-white border-[#511E6D]"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <RequiredNotice show={requiredError && !formData.mode} />
        </div>
      );
    case 5:
      return (
        <div className="flex flex-col items-center w-full">
          <div className="w-64 flex flex-col items-start">
            <label className="block mb-2 font-sm text-gray-700 px-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md py-2 px-4 border border-gray-300 mb-2 text-left"
              placeholder="Please Enter your Name"
              value={formData.text ?? ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, text: e.target.value }))
              }
            />
            <RequiredNotice show={requiredError && !formData.text} />

            <label className="block mb-2 font-sm text-gray-700 px-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full rounded-md py-2 px-4 border border-gray-300 mb-2 text-left"
              placeholder="Please Enter your Email"
              value={formData.email ?? ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
            />
            <RequiredNotice show={requiredError && !formData.email} />

            <label className="block mb-2 font-sm text-gray-700 px-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full rounded-md py-2 px-4 border border-gray-300 text-left"
              placeholder="Please Enter your Number"
              value={formData.number ?? ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, number: e.target.value }))
              }
            />
            <RequiredNotice show={requiredError && !formData.number} />
          </div>
        </div>
      );
    case 6:
      return (
        <div className="flex flex-col items-center text-center w-full">
          <label className="block mb-2 font-medium text-gray-700">
            Select your Age Range <span className="text-red-500">*</span>
          </label>
          <select
            className="w-60 rounded-md py-2 px-4 border border-gray-300 text-start mx-auto "
            value={formData.age ?? ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, age: e.target.value }))
            }
          >
            <option value="" disabled>
              Select An Option
            </option>
            {ageOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <div className="w-60 text-center mx-auto">
            <RequiredNotice show={requiredError && !formData.age} />
          </div>
        </div>
      );
    default:
      return <div />;
  }
}

function ThankYouModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
        <h3 className="text-xl font-bold text-[#511E6D] mb-3">Thank you!</h3>
        <p className="text-gray-700 mb-6">Your response was saved.</p>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded bg-[#511E6D] text-white hover:bg-[#3d1655] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function InsuranceSteps() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({});
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [requiredError, setRequiredError] = useState(false);

  // GKV landing redirect logic
  const redirectToGKV = () => {
    window.location.href = "https://www.tk.de/en";
  };

  // Check all steps for completion per current step
  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return !!formData.incomeRange;
      case 1:
        return !!formData.plan;
      case 2:
        return !!formData.marital;
      case 3:
        return !!formData.dependent;
      case 4:
        return !!formData.mode;
      case 5:
        return !!formData.text && !!formData.email && !!formData.number;
      case 6:
        return !!formData.age;
      default:
        return true;
    }
  };

  const handleNext = () => {
    setRequiredError(false);
    if (!isStepComplete()) {
      setRequiredError(true);
      return;
    }
    if (currentStep === 0) {
      if (
        formData.incomeRange === "Below 63000" ||
        formData.incomeRange === "63000 - 73800"
      ) {
        redirectToGKV();
        return;
      }
      setCurrentStep(1);
      return;
    }
    if (currentStep === 1) {
      if (formData.plan === "No") {
        redirectToGKV();
        return;
      }
      setCurrentStep(2);
      return;
    }
    if (currentStep === stepLabels.length - 1) {
      setThankYouOpen(true);
    } else {
      setCurrentStep((c) => Math.min(stepLabels.length - 1, c + 1));
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#f5f0ff] to-white py-16 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Just 2 minutes to find your best-fit insurance type.
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            No calls, no commitments — unless you want them.
          </p>
        </div>
        {/* Desktop View */}
        <div className="hidden md:flex gap-10 items-start justify-between">
          <div className="w-1/3 min-w-[210px] flex flex-col gap-2 pt-8">
            {stepLabels.map((step, idx) => (
              <button
                key={idx}
                type="button"
                className={`w-full text-left px-5 py-3 rounded-md text-base tracking-tight ${
                  currentStep === idx
                    ? "bg-[#511E6D] text-white shadow font-semibold"
                    : "bg-transparent text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentStep(idx)}
              >
                {step}
              </button>
            ))}
          </div>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg p-8 flex flex-col items-center justify-center"
          >
            <RightContent
              step={currentStep}
              formData={formData}
              setFormData={setFormData}
              requiredError={requiredError}
            />
            <div className="flex gap-3 mt-8 justify-center w-full">
              <button
                type="button"
                className={`px-4 py-2 rounded border font-medium ${
                  currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#e0daf2] text-[#511E6D] hover:bg-[#d9c9ef]"
                }`}
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
              >
                Back
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-[#511E6D] text-white font-medium"
                onClick={handleNext}
              >
                {currentStep === stepLabels.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </motion.div>
        </div>
        {/* Mobile View */}
        <div className="block md:hidden">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full p-4 bg-white rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center"
          >
            <p className="text-sm text-gray-500 mb-1">
              Step {currentStep + 1} of {stepLabels.length}
            </p>
            <h3 className="text-lg font-semibold mb-4 text-center">
              {stepLabels[currentStep]}
            </h3>
            <RightContent
              step={currentStep}
              formData={formData}
              setFormData={setFormData}
              requiredError={requiredError}
            />
            <div className="flex gap-3 mt-8 justify-center w-full">
              {currentStep > 0 && (
                <button
                  type="button"
                  className="px-4 py-2 rounded border font-medium bg-[#e0daf2] text-[#511E6D]"
                  onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="px-4 py-2 rounded bg-[#511E6D] text-white font-medium"
                onClick={handleNext}
              >
                {currentStep === stepLabels.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <ThankYouModal
        open={thankYouOpen}
        onClose={() => setThankYouOpen(false)}
      />
    </section>
  );
}
