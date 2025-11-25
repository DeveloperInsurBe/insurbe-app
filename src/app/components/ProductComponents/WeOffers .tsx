"use client";
import React, { useState } from "react";
import ServiceModal from "./ServiceModal";

const plans = [
  {
    title: "Public",
    description:
      "Flexible retirement savings. Pause, increase, or withdraw as your life changes.",
    tag: "Partners",
    key: "public",
  },
  {
    title: "Expat Health",
    description:
      "Flexible retirement savings. Pause, increase, or withdraw as your life changes.",
    tag: "Partners",
    key: "expat",
  },
  {
    title: "Private Health",
    description:
      "Flexible retirement savings. Pause, increase, or withdraw as your life changes.",
    tag: "Partners",
    key: "private",
  },
];

export default function WeOffers() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative mt-6 px-4 md:px-10 lg:px-20 min-h-[520px] flex flex-col items-center bg-gradient-to-r from-[#f8f7fb] to-white">
      {/* Header */}
      <div className="mb-2 text-center">
        <div className="text-xs font-semibold tracking-wide text-gray-500 mb-1">
          Seamless Synergy
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1d1e25] mb-3">
          Plans We Offer
        </h2>
        <p className="text-base text-gray-600 mb-8">
          We partner with leading insurers in Germany to offer
        </p>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 pt-5 pb-8 flex flex-col items-start relative"
          >
            <span className="absolute top-5 right-6 bg-[#511e6d] text-white text-xs rounded-full px-4 py-1 font-semibold">
              {plan.tag}
            </span>
            <h4 className="text-lg font-semibold text-[#1d1e25] mb-2">
              {plan.title}
            </h4>
            <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
            <button
              className="mt-auto bg-[#e0daf2] text-[#511e6d] text-sm font-medium px-4 py-2 rounded shadow hover:bg-[#d9c9ef] transition"
              onClick={() => setShowModal(true)}
            >
              Explore
            </button>
          </div>
        ))}
      </div>
      {/* Modals */}
      <ServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
