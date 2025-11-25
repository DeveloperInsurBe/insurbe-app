"use client";
import Image from "next/image";
import React, { useState } from "react";

export default function ApplicationWizard() {
  const [step, setStep] = useState(1);

  const totalSteps = 6;

  const next = () => step < totalSteps && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="w-full h-40 bg-primary relative flex items-center justify-center">
      
      {/* Left Image */}
      <div className="absolute left-0 h-full flex items-center">
        <Image
          src="/icons/leftside.svg" // replace with your left image
          alt="Left Decoration"
          width={100}
          height={100}
          className="object-cover h-full"
        />
      </div>

      {/* Center Text */}
      <div className="text-center">
        <span className="inline-block bg-white/20 rounded-full px-4 py-1 mb-2 text-sm font-medium text-white">
          Health Prioritized
        </span>
        <h1 className="text-3xl font-bold text-white">Public Health</h1>
      </div>

      {/* Right Image */}
      <div className="absolute right-0 h-full flex items-center">
        <Image
          src="/icons/rightside.svg"
          alt="Right Decoration"
          width={100}
          height={100}
          className="object-cover h-full"
        />
      </div>
    </div>
      {/* Top Progress + Header */}
      <div className="max-w-5xl mx-auto  mt-4 items-end flex flex-col">
        

        <div className="text-center mb-2 text-sm text-gray-600">Step {step} of 6</div>

        <div className="w-full bg-gray-200 h-1 rounded">
          <div
            className="bg-primary h-1 rounded"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="col-span-1 space-y-6 text-sm">
          {[
            "Personal & Current Insurance Info",
            "Declaration of Application",
            "Compulsory Long-Term Care Insurance",
            "Health Information",
            "Employment & Contribution Details",
            "Signatures & Consent",
          ].map((label, index) => (
            <div
              key={index}
              className={`cursor-pointer pb-2 border-b 
              ${step === index + 1 ? "text-primary font-semibold border-primary" : "text-gray-500"}`}
              onClick={() => setStep(index + 1)}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="col-span-3 bg-white p-8 rounded-xl shadow">

          {/* RENDER THE STEP */}
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
          {step === 6 && <Step6 />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <button onClick={prev} className="px-6 py-2 bg-gray-200 rounded">
                Previous
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                onClick={next}
                className="px-6 py-2 bg-primary text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => alert("Submit API here")}
                className="px-6 py-2 bg-green-600 text-white rounded"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}

/* ---------------- STEP COMPONENTS ---------------- */

function Step1() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <div className="space-y-5">
        <input className="w-full border p-3 rounded" placeholder="Full Name" />
      </div>
    </>
  );
}

function Step2() {
  return <div>Step 2 content…</div>;
}

function Step3() {
  return <div>Step 3 content…</div>;
}

function Step4() {
  return <div>Step 4 content…</div>;
}

function Step5() {
  return <div>Step 5 content…</div>;
}

function Step6() {
  return <div>Step 6 content…</div>;
}
