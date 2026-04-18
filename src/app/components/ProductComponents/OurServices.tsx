"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Globe,
  Check,
  Award,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CARD_BG, NEW_CARD_BG } from "@/app/constants/styles";

const plans = [
  {
    key: "public",
    title: "Public (GKV)",
    subtitle: "Family Coverage",
    badge: "Essential",
    price: "€800",
    period: "/month",
    icon: Shield,
    popular: false,
    features: [
      "Covers dependents",
      "No digital signup",
      "Accepted for visa",
      "Limited customization",
    ],
  },
  {
    key: "private",
    title: "Full Private (PKV)",
    subtitle: "Premium Care",
    badge: "Most Popular",
    price: "€400",
    period: "/month",
    icon: Award,
    popular: true,
    features: [
      "Optional dependents coverage",
      "Digital signup",
      "Accepted for visa",
      "Fast Reimbursement",
    ],
  },
  {
    key: "expat",
    title: "Expat Private",
    subtitle: "International",
    badge: "Ultimate",
    price: "€200",
    period: "/month",
    icon: Globe,
    popular: false,
    features: [
      "No dependents coverage",
      "Digital signup",
      "Accepted for visa",
      "Ideal for freelancers and  self-employed",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function OurServices() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const router = useRouter();

  /** ROUTING LOGIC */
  const handleGetStarted = (planKey: string) => {
    if (planKey === "public") {
      router.push("/insurance/public-health");
    }
    if (planKey === "private") {
      router.push("/insurance/private-health");
    }
    if (planKey === "expat") {
      router.push("/insurance/expat-health");
    }
  };

  return (
    <section className="py-10 md:py-16 px-4 sm:px-8 lg:px-18 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Affordable <span className="text-[#531D6F]">Excellence</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Compare insurance options and get started with the plan that fits your needs.
          </motion.p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.key}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`relative ${isPopular ? "lg:scale-105 lg:-mt-4" : ""}`}
              >
                {/* POPULAR BADGE */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-linear-to-r from-purple-400 to-blue-400 text-gray-900 text-xs font-bold px-5 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* CARD */}
                <motion.div
                  whileHover={{ y: -8 }}
                  className={`h-full rounded-3xl p-8 flex flex-col justify-between ${
                    isPopular
                      ? `${NEW_CARD_BG}`
                      : "bg-white shadow-xl"
                  }`}
                >
                  {/* TITLE */}
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{plan.title}</h3>
                    <p className={`text-sm ${isPopular ? "text-purple-900" : "text-gray-500"}`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div className="my-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="ml-1">{plan.period}</span>
                  </div>

                  {/* FEATURES */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center `}>
                          <Check className={`w-4 h-4 ${
                            isPopular ? "text-[#531D6F]" : "text-[#531D6F]"
                          }`} />
                        </span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGetStarted(plan.key)}
                    className={`w-full py-4 rounded-full font-bold ${
                      isPopular
                        ? "bg-white text-[#531D6F]"
                        : "bg-[#531D6F] text-white"
                    }`}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
