"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  logo: string;
  price: string;
}

interface PlansCompareProps {
  plans: Plan[];
}

export default function PlansCompare({ plans }: PlansCompareProps) {
  const features = [
  {
    label: "Monthly Premium",
    values: plans.map((p) =>
      p.id === "tk" ? `approx. €${p.price}` : `€${p.price}`
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
    values: plans.map((p) => (p.id === "tk" ? false : true)),
  },
  {
    label: "Chief Physician Treatment",
    values: plans.map((p) => (p.id === "tk" ? false : true)),
  },
  {
    label: "Worldwide Coverage",
    values: plans.map((p) => (p.id === "tk" ? false : true)),
  },

  {
    label: "No Waiting Period",
    values: plans.map((p) => (p.id === "tk" ? true : false)),
  },
  {
    label: "Prescription Medications",
    values: plans.map(() => true),
  },
];

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
      {/* 🔥 Mobile Horizontal Slide Wrapper */}
      <motion.div
        className="overflow-x-auto md:overflow-visible cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -300, right: 0 }} // adjust if needed
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-2xl shadow-xl overflow-hidden min-w-[700px] md:min-w-full"
        >
          {/* Header Row */}
          <div
            className="grid gap-0 border-b border-gray-200"
            style={{
              gridTemplateColumns: `300px repeat(${plans.length}, 1fr)`,
            }}
          >
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                Plan Comparison
              </h3>
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

          {/* Feature Rows */}
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
                  <p className="text-sm font-medium text-gray-900">
                    {feature.label}
                  </p>

                  {(feature.label === "Hospital Private Room" ||
                    feature.label === "Chief Physician Treatment" ||
                    feature.label === "Worldwide Coverage") && (
                    <div className="absolute left-0 top-6 w-64 p-3 text-xs text-white bg-black rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                      {feature.label === "Worldwide Coverage" &&
                        "Public insurance covers mainly EU & partner countries. Extra travel insurance is recommended outside Europe."}

                      {feature.label === "Hospital Private Room" &&
                        "Not included in public insurance. Available only with supplementary private insurance."}

                      {feature.label === "Chief Physician Treatment" &&
                        "Not included in public insurance. Requires additional private insurance."}
                    </div>
                  )}
                </div>{" "}
              </div>

              {feature.values.map((value, planIdx) => (
                <div
                  key={planIdx}
                  className="p-6 flex items-center justify-center"
                >
                  {typeof value === "boolean" ? (
                    value ? (
                      <Check
                        className="w-6 h-6 text-green-500"
                        strokeWidth={3}
                      />
                    ) : (
                      <X className="w-6 h-6 text-gray-300" strokeWidth={3} />
                    )
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {value}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          ))}

          {/* Best For Row */}
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

            <div className="p-6">
              <p className="text-sm text-gray-700 text-center font-medium">
                Employees
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 text-center font-medium">
                High Earners & Self-Employed
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 text-center font-medium">
                Premium Coverage Seekers
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
