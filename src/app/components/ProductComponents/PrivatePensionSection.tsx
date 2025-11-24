'use client';

import React from 'react';

const reasons = [
  {
    title: "The State Pension Won’t Be Enough",
    description:
      "Public pensions typically replace only ~48% of your last net salary. That leaves a big gap.",
  },
  {
    title: "Tax Benefits While You Save",
    description:
      "Private pension contributions can be tax-deductible—especially helpful for high earners and freelancers.",
  },
  {
    title: "Portable Plans for Expats",
    description:
      "Your pension stays with you—even if you move countries.",
  },
  {
    title: "Financial Freedom at Retirement",
    description:
      "Choose flexible payouts: lump sum, monthly income, or a mix.",
  },
];

export default function PrivatePensionSection() {
      
  return (
    <section className="py-16 px-4 sm:px-10 lg:px-20 bg-white text-center ">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-10">
        Why You Need a Private <br /> Pension in Germany?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
        {reasons.map((item, index) => (
          <div
            key={index}
            className="border border-purple-200 p-6 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-semibold text-[#511E6D] mb-2">{item.title}</h3>
            <p className="text-gray-700 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      <button  className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-[#3a0669] transition">
        Check My Eligibility
      </button>
    </section>
  );
}
