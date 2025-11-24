"use client";

import Image from "next/image";
import React from "react";

const plans = [
  {
    logo: "ottonova",
    logoAlt: "ottonova",
    logoSrc: "/partners/ottonova.png",
    title: "Rürup Pension",
    description:
      "Ideal for self-employed professionals and high-income earners. Enjoy tax advantages and lifelong income.",
    partner: true,
  },
  {
    logo: "barmer",
    logoAlt: "barmer",
    logoSrc: "/partners/barmer.png",
    title: "Company Pension Advisory",
    description: "Learn how to make the most of employer contributions.",
    partner: true,
    highlightTitle: true,
  },
  {
    logo: "mawista",
    logoAlt: "mawista logo",
    logoSrc: "/partners/mawista.svg",
    title: "Private Pension Plans",
    description:
      "Flexible retirement savings. Pause, increase, or withdraw as your life changes.",
    partner: true,
  },
  {
    logo: "barmer",
    logoAlt: "barmer logo",
    logoSrc: "/partners/barmer.png",
    title: "ETF-Linked Pension Options",
    description: "Build wealth over time with low-cost, market-based plans.",
    partner: true,
    highlightTitle: true,
  },
];

export default function PensionPlansSection() {
  return (
    <section className=" px-4 sm:px-10 lg:px-24 bg-gradient-to-b from-white to-gray-50 text-center">
      <span className="inline-block text-black/80 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-300">
        Seamless Synergy
      </span>
      <h2 className="text-[54px] font-extrabold text-gray-900 mb-3">Plans We Offer</h2>

      <p className="text-gray-500 max-w-xl mx-auto mb-12">
        We partner with leading insurers in Germany to offer
      </p>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10"> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-14">
        {plans.map(({ logoSrc, logoAlt, title, description, partner }, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            {/* Logo and Partner badge row */}
            <div className="flex items-center justify-between mb-4">
              {/* Logo only */}
              <div className="flex items-center">
                {logoSrc.endsWith(".svg") ? (
                  <Image
                    src={logoSrc}
                    alt={logoAlt || "Logo"}
                    width={100}
                    height={20}
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src={logoSrc}
                    alt={logoAlt || "Logo"}
                    width={100}
                    height={20}
                    className="object-contain"
                  />
                )}
              </div>

              {/* Partner Badge */}
              {partner && (
                <div className="bg-primary text-white rounded-full px-3 py-1 text-xs font-semibold uppercase">
                  Partners
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-left text-lg font-semibold text-gray-900 mb-2">{title}</h3>

            {/* Description */}
            <p className="text-left text-gray-600 text-sm mb-6 flex-grow">{description}</p>

            {/* Explore Button */}
            <button className="self-start bg-purple-100 text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-200 transition">
              Explore
            </button>
          </div>
        ))}
      </div>

      {/* See All Button */}
      <button className="inline-flex items-center bg-primary text-white rounded-md px-8 py-3 hover:bg-primary transition">
        See all
        <svg
          className="ml-3 h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
