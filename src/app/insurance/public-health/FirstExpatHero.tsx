"use client";

import { motion } from "framer-motion";
import { Sliders, Package, Globe, Headphones } from "lucide-react";

const features = [
  {
    title: "Fully Flexible Plans",
    desc: "Choose your country, select an appropriate plan, and add optional benefits as available",
    icon: Sliders,
  },
  {
    title: "Complete Health Coverage",
    desc: "From hospitalization and repatriation to everyday medical care — everything you need, in one plan.",
    icon: Package,
  },
  {
    title: "100% Digital Experience",
    desc: "Sign up online, access documents instantly, and manage claims easily from anywhere in the world.",
    icon: Globe,
  },
  {
    title: "Support Anytime, Anywhere",
    desc: "Our international support team is available 24/7 to assist you in your preferred language.",
    icon: Headphones,
  },
];

export default function FirstExpatHero() {
  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
       <motion.div
  initial={{ opacity: 0, y: -20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className="text-center mb-14"
>
  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
     Health Insurance in{" "}
    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
      Germany
    </span>
  </h2>

  <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
    Flexible, legally compliant health insurance for students and employees.
  </p>
</motion.div>

        {/* Feature Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="relative bg-white border border-gray-200 rounded-2xl p-6 pt-10 hover:shadow-lg transition"
              >
                {/* Floating Icon */}
                <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}