"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

type ComparisonMode = "default" | "special_tk_hallesche_combo";

interface Plan {
  id: string;
  name: string;
  logo: string;
  price: string;
}

interface PlansCompareProps {
  plans: Plan[];
  comparisonMode?: ComparisonMode;
}

const specialColumns = [
  { id: "tk", header: "Public Health" },
  { id: "hallesche-expat", header: "Hallesche Expat" },
  { id: "hallesche-premium", header: "Hallesche Premium" },
] as const;

const specialRows = [
  {
    feature: "Best for",
    values: {
      tk: "Standard employees / family cover",
      "hallesche-expat": "Expats with temporary residence",
      "hallesche-premium": "Long-term private coverage",
    },
  },
  {
    feature: "Coverage type",
    values: {
      tk: "Statutory public",
      "hallesche-expat": "Temporary private comprehensive",
      "hallesche-premium": "Full private comprehensive",
    },
  },
  {
    feature: "Outpatient treatment",
    values: {
      tk: "Statutory catalogue",
      "hallesche-expat": "100% under Hi.Medical L",
      "hallesche-premium": "100% under NK.select XL",
    },
  },
  {
    feature: "Hospital room",
    values: {
      tk: "Standard public coverage",
      "hallesche-expat": "One-bed / two-bed options covered",
      "hallesche-premium": "One-bed / two-bed / multi-bed covered",
    },
  },
  {
    feature: "Private doctor treatment in hospital",
    values: {
      tk: "Limited / supplementary cover usually needed",
      "hallesche-expat": "Covered as optional service",
      "hallesche-premium": "Covered",
    },
  },
  {
    feature: "Dental",
    values: {
      tk: "Statutory dental scope",
      "hallesche-expat": "100% up to EUR 1,500/year under Hi.Dental L",
      "hallesche-premium": "100% treatment, 90% dentures / orthodontics",
    },
  },
  {
    feature: "Vision",
    values: {
      tk: "Limited statutory scope",
      "hallesche-expat": "Up to EUR 250 visual aids",
      "hallesche-premium": "Up to EUR 450 visual aids",
    },
  },
  {
    feature: "LASIK / refractive surgery",
    values: {
      tk: "Usually not standard",
      "hallesche-expat": "Up to EUR 750 per eye",
      "hallesche-premium": "Up to EUR 2,500 per eye",
    },
  },
  {
    feature: "Bonus / deductible",
    values: {
      tk: "Not applicable like private tariff",
      "hallesche-expat": "Deductible tariff levels apply",
      "hallesche-premium": "EUR 100/month bonus option",
    },
  },
  {
    feature: "English support",
    values: {
      tk: "Depends on provider",
      "hallesche-expat": "Hallesche English support",
      "hallesche-premium": "Hallesche English support",
    },
  },
  {
    feature: "Duration",
    values: {
      tk: "Ongoing if eligible",
      "hallesche-expat": "Up to 60 months",
      "hallesche-premium": "Long-term private tariff",
    },
  },
] as const;

export default function PlansCompare({
  plans,
  comparisonMode = "default",
}: PlansCompareProps) {
  const isSpecialDataAvailable = specialColumns.every((column) =>
    plans.some((plan) => plan.id === column.id),
  );

  const shouldRenderSpecial =
    comparisonMode === "special_tk_hallesche_combo" && isSpecialDataAvailable;

  if (shouldRenderSpecial) {
    return (
      <div className="w-full py-8">
        <div className="overflow-x-auto">
          <div className="min-w-[1120px] overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-violet-900 text-white">
                  <th className="w-[260px] border border-violet-200 px-4 py-3 text-left text-lg font-bold">
                    Feature
                  </th>
                  {specialColumns.map((column) => (
                    <th
                      key={column.id}
                      className="border border-violet-200 px-4 py-3 text-left text-lg font-bold"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specialRows.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={index % 2 === 0 ? "bg-violet-50/40" : "bg-white"}
                  >
                    <td className="border border-violet-200 bg-violet-50 px-4 py-3 text-2xl font-bold text-black">
                      {row.feature}
                    </td>
                    {specialColumns.map((column) => (
                      <td
                        key={column.id}
                        className="border border-violet-200 px-4 py-3 text-2xl text-gray-900"
                      >
                        {row.values[column.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-violet-200 px-4 py-4 text-lg text-gray-600">
              Benefit summary for website comparison. Final coverage is subject
              to insurer tariff terms, eligibility, underwriting, and legally
              binding policy documents.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      label: "Monthly Premium",
      values: plans.map((p) =>
        p.id === "tk" ? `approx. EUR ${p.price}` : `EUR ${p.price}`,
      ),
    },
    {
      label: "24/7 Medical Assistance",
      values: plans.map(() => true),
    },
    {
      label: "English Support",
      values: plans.map(() => true),
    },
    {
      label: "Digital Services & App",
      values: plans.map(() => true),
    },
    {
      label: "Dental Coverage",
      values: plans.map(() => true),
    },
    {
      label: "Vision Coverage",
      values: plans.map(() => true),
    },
    {
      label: "Alternative Medicine",
      values: plans.map(() => true),
    },
    {
      label: "Hospital Private Room",
      values: plans.map((p) => p.id !== "tk"),
    },
    {
      label: "Chief Physician Treatment",
      values: plans.map((p) => p.id !== "tk"),
    },
    {
      label: "Worldwide Coverage",
      values: plans.map((p) => p.id !== "tk"),
    },
    {
      label: "No Waiting Period",
      values: plans.map((p) => p.id === "tk"),
    },
    {
      label: "Prescription Medications",
      values: plans.map(() => true),
    },
  ];

  const bestForByPlanId: Record<string, string> = {
    tk: "Employees",
    dak: "Employees & Families",
    "hallesche-premium": "High Earners & Self-Employed",
    "hallesche-expat": "Premium Coverage Seekers",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="w-full py-8">
      <motion.div
        className="overflow-x-auto md:overflow-visible cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -300, right: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-2xl shadow-xl overflow-hidden min-w-[700px] md:min-w-full"
        >
          <div
            className="grid gap-0 border-b border-gray-200"
            style={{
              gridTemplateColumns: `300px repeat(${plans.length}, 1fr)`,
            }}
          >
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Plan Comparison</h3>
            </div>

            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 flex flex-col items-center justify-center bg-white"
              >
                <div className="w-16 h-16 mb-3 relative">
                  <img
                    src={plan.logo}
                    alt={plan.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  {plan.name}
                </h3>
              </div>
            ))}
          </div>

          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={rowVariants}
              className="grid gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
              style={{
                gridTemplateColumns: `300px repeat(${plans.length}, 1fr)`,
              }}
            >
              <div className="p-6 bg-gray-50">
                <div className="relative group">
                  <p className="text-sm font-medium text-gray-900">{feature.label}</p>

                  {(feature.label === "Hospital Private Room" ||
                    feature.label === "Chief Physician Treatment" ||
                    feature.label === "Worldwide Coverage") && (
                    <div className="absolute left-0 top-6 w-64 p-3 text-xs text-white bg-black rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                      {feature.label === "Worldwide Coverage" &&
                        "Public insurance covers mainly EU and partner countries. Extra travel insurance is recommended outside Europe."}

                      {feature.label === "Hospital Private Room" &&
                        "Not included in public insurance. Available only with supplementary private insurance."}

                      {feature.label === "Chief Physician Treatment" &&
                        "Not included in public insurance. Requires additional private insurance."}
                    </div>
                  )}
                </div>
              </div>

              {feature.values.map((value, planIdx) => (
                <div
                  key={planIdx}
                  className="p-6 flex items-center justify-center"
                >
                  {typeof value === "boolean" ? (
                    value ? (
                      <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
                    ) : (
                      <X className="w-6 h-6 text-gray-300" strokeWidth={3} />
                    )
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{value}</p>
                  )}
                </div>
              ))}
            </motion.div>
          ))}

          <motion.div
            variants={rowVariants}
            className="grid gap-0 bg-gradient-to-r from-primary/5 to-primary/10"
            style={{
              gridTemplateColumns: `300px repeat(${plans.length}, 1fr)`,
            }}
          >
            <div className="p-6 bg-gray-50">
              <p className="text-sm font-bold text-gray-900">Best For</p>
            </div>

            {plans.map((plan) => (
              <div key={plan.id} className="p-6">
                <p className="text-sm text-gray-700 text-center font-medium">
                  {bestForByPlanId[plan.id] || "Best match based on profile"}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
