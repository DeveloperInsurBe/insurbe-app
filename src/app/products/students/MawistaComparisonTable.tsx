"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CheckCircle,
  X,
  Info,
  Shield,
 
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  logo: string;
  featured?: boolean;
  applyLink: string;
}

const PLANS: Plan[] = [
  {
    id: "classic",
    name: "Student Classic",
    logo: "/partners_asset/mawista.svg",
    applyLink:
      "/mawistaBooking",
  },
  {
    id: "plus",
    name: "Student Classic Plus",
    logo: "/partners_asset/mawista.svg",
    featured: true,
    applyLink:
      "/mawistaBooking",
  },
  {
    id: "comfort",
    name: "Student Comfort",
    logo: "/partners_asset/mawista.svg",
    applyLink:
      "/mawistaBooking",
  },
];

interface ComparisonRow {
  feature: string;
  tooltip?: string;
  values: {
    classic: string | boolean;
    plus: string | boolean;
    comfort: string | boolean;
  };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: "24/7 medical assistance/emergency call centre",
    values: { classic: true, plus: true, comfort: true },
  },
  {
    feature: "Outpatient treatment by a physician",
    values: { classic: true, plus: true, comfort: true },
  },
  {
    feature: "Inpatient hospital treatment",
    values: { classic: true, plus: true, comfort: true },
  },
  {
    feature: "Transport costs to nearest suitable hospital",
    values: { classic: true, plus: true, comfort: true },
  },
  {
    feature: "Medically prescribed medicines and dressings",
    values: { classic: true, plus: true, comfort: true },
  },
  {
    feature: "Repatriation costs up to €25,000 in the event of death",
    values: { classic: true, plus: true, comfort: true },
  },
  {
    feature: "We recommend an insurance card",
    tooltip: "Convenient cashless payment at doctors",
    values: { classic: false, plus: true, comfort: true },
  },
  {
    feature: "Waiting period for pregnancy treatment (in months)",
    values: { classic: "3", plus: "3", comfort: "0" },
  },
  {
    feature: "Waiting period for childbirth (in months)",
    values: { classic: "8", plus: "8", comfort: "0" },
  },
  {
    feature: "Remedy treatments (e.g. massage) per insurance year",
    values: { classic: "6", plus: "8", comfort: "8" },
  },
  {
    feature:
      "Accident-related medical aids (not including vision aids) per insurance year",
    values: { classic: "€250", plus: "€250", comfort: "€1,000" },
  },
  {
    feature:
      "Dental treatment to stop pain, repairs of dental prosthesis and temporary solutions per insurance year",
    values: { classic: "€500", plus: "€500", comfort: "€1,000" },
  },
  {
    feature: "Accident insurance for disability",
    values: { classic: false, plus: "€140,000", comfort: "€140,000" },
  },
  {
    feature: "Liability insurance for recovery measures",
    values: { classic: false, plus: "€5,000", comfort: "€5,000" },
  },
  {
    feature: "Liability insurance for damage to rented property",
    values: { classic: false, plus: "€250,000", comfort: "€250,000" },
  },
  {
    feature: "Liability insurance for personal injury and property damage",
    values: { classic: false, plus: "€1,000,000", comfort: "€1,000,000" },
  },
  {
    feature: "Loss of house key (excess €100)",
    values: { classic: false, plus: false, comfort: "€2,000" },
  },
  {
    feature:
      "Dental prosthesis up to 60% of the costs per insurance year (8 month waiting period)",
    values: { classic: false, plus: false, comfort: "€1,000" },
  },
  {
    feature:
      "Vaccinations as recommended by STIKO (Standing Vaccination Committee)",
    values: { classic: false, plus: false, comfort: "€250" },
  },
  {
    feature:
      "Accident-related vision aids per insurance year (3 month waiting period)",
    values: { classic: false, plus: false, comfort: "€100" },
  },
  {
    feature: "Insurance cover at home in Germany",
    values: { classic: false, plus: false, comfort: "Up to 6 weeks" },
  },
  {
    feature:
      "Maximum reimbursement based on GOÄ/GOZ (for international visitors to Germany)",
    values: { classic: "1.8", plus: "2.3", comfort: "3.5" },
  },
  {
    feature: "Excess (max. €250 per calendar year)",
    values: { classic: "20%", plus: "15%", comfort: "10%" },
  },
];

const PREMIUM_DATA = {
  ageRanges: [
    { label: "0 to 4 years", classic: "€55", plus: "€75", comfort: "€135" },
    { label: "5 to 17 years", classic: "€39", plus: "€49", comfort: "€89" },
    { label: "18 to 29 years", classic: "€28", plus: "€36", comfort: "€74" },
    { label: "30 to 40 years", classic: "€44", plus: "€56", comfort: "€104" },
  ],
};

export default function MawistaComparisonTable() {
  const renderValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <div className="text-gray-400 text-center">—</div>
      );
    }
    return (
      <div className="text-center font-semibold text-gray-900">{value}</div>
    );
  };

  return (
    <section className="py-12 sm:py-20 px-4 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm mb-4">
            <Shield className="w-4 h-4" />
            TARIFF GUIDE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
            Comparison of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary">
              Tariffs
            </span>
          </h2>
        </motion.div>

        {/* Mobile/Tablet View - Horizontal Scroll with Fixed Headers */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden"
          >
            {/* Fixed Header - Plan Cards */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4">
              <div className="flex gap-3 justify-center">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex-1 min-w-[100px] max-w-[140px] bg-white rounded-xl p-3 shadow-md"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-primary flex items-center justify-center mb-2">
                        <Image
                          src={plan.logo}
                          alt={plan.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">
                        MAWISTA
                      </div>
                      <div className="text-xs font-bold text-gray-900 text-center leading-tight">
                        {plan.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[500px]">
              {/* Features Comparison */}
              <div className="p-4">
                {COMPARISON_DATA.map((row, idx) => (
                  <div
                    key={idx}
                    className={`py-3 border-b border-gray-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <div className="text-xs text-gray-700 mb-2 px-2">
                      {row.feature}
                    </div>
                    <div className="flex gap-3 justify-center">
                      {PLANS.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex-1 min-w-[100px] max-w-[140px] flex items-center justify-center"
                        >
                          {renderValue(
                            row.values[plan.id as keyof typeof row.values],
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Monthly Premiums Section */}
                <div className="bg-gray-50 p-4 ">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    Monthly premiums
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Premiums for 1 to 60 months
                  </p>

                  {PREMIUM_DATA.ageRanges.map((range, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        {range.label}
                      </div>
                      <div className="flex gap-3 justify-center">
                        {PLANS.map((plan) => (
                          <div
                            key={plan.id}
                            className="flex-1 min-w-[100px] max-w-[140px] text-center"
                          >
                            <div className="text-lg font-bold text-gray-900">
                              {range[plan.id as keyof typeof range]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Buttons */}
              <div className="p-4 bg-white border-t-2 border-purple-200">
                <div className="flex gap-3 justify-center">
                  {PLANS.map((plan) => (
                    <motion.a
                      key={plan.id}
                      href={plan.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 min-w-[100px] max-w-[140px] py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg text-center text-sm"
                    >
                      APPLY
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop View - Full Table */}
        <div className="hidden lg:block overflow-x-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden"
          >
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="">
                  <th className="py-6 px-6 text-left font-semibold text-gray-700 w-2/5">
                    Features
                  </th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="py-6 px-4 w-1/5">
                      <div className="flex flex-col items-center">
                        {/* <div className="w-16 h-16 flex items-center justify-center mb-3 ">
                          <Image
                            src={plan.logo}
                            alt={plan.name}
                            width={50}
                            height={50}
                            className="object-contain"
                          />
                        </div> */}
                        <div className="text-xs text-gray-500 uppercase mb-1">
                          MAWISTA
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {plan.name}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body - Features */}
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-gray-100 hover:bg-purple-50/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {row.feature}
                        </span>
                        {row.tooltip && (
                          <div className="group relative">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                              {row.tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {renderValue(row.values.classic)}
                    </td>
                    <td className="py-4 px-4 bg-purple-50/30">
                      {renderValue(row.values.plus)}
                    </td>
                    <td className="py-4 px-4">
                      {renderValue(row.values.comfort)}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Monthly Premiums Section */}
              <tbody className="">
                <tr className="">
                  <td colSpan={4} className="py-4 px-6">
                    <div className="font-bold text-lg text-gray-900">
                      Monthly Premiums
                    </div>
                    <div className="text-sm text-gray-600">
                      Premiums for 1 to 60 months
                    </div>
                  </td>
                </tr>
                {PREMIUM_DATA.ageRanges.map((range, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-gray-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-gray-700">
                      {range.label}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-900">
                      {range.classic}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-900 bg-purple-50/30">
                      {range.plus}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-900">
                      {range.comfort}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Apply Buttons */}
              <tbody>
                <tr className="bg-white">
                  <td className="py-6 px-6">
                    <div className="flex items-center">
                      <Image
                        src="/gifs_assets/payment.png"
                        alt="Payment Methods"
                        width={200}
                        height={40}
                        className="object-contain w-40 sm:w-48 md:w-52"
                      />
                    </div>
                  </td>
                  {PLANS.map((plan) => (
                    <td key={plan.id} className="py-6 px-4">
                      <motion.a
                        href={plan.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="block w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-purple-500 shadow-lg hover:shadow-xl transition-all text-center"
                      >
                        APPLY
                      </motion.a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
