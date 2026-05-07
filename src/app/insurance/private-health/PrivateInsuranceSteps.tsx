"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    step: 1,
    title: "Fill out your details",
    desc: "Tell us where you’re going and select your package.",
  },
  {
    step: 2,
    title: "Get your quote",
    desc: "Receive your quote in just a few minutes.",
  },
  {
    step: 3,
    title: "Tell us about your health",
    desc: "Complete the online health questionnaire.",
  },
  {
    step: 4,
    title: "Sign up for the plan",
    desc: "When your questionnaire is approved, you’re all set to enroll!",
  },
];

export default function PrivateInsuranceSteps() {
  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-14"
        >
          Get insurance{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary">
            in 4 easy steps
          </span>
        </motion.h2>

        {/* Steps (Desktop) */}
        <div className="hidden lg:flex items-start justify-between relative mb-16">
          {/* Connecting Line */}
          <div className="absolute top-6 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-purple-600 to-pink-500" />

          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative z-10 w-1/4 px-4"
            >
              {/* Step Circle */}
              <div className="w-14 h-14 mx-auto mb-6 rounded-2xl border border-purple-300 flex items-center justify-center text-xl font-semibold text-purple-600 bg-white">
                {item.step}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Steps (Mobile / Tablet) */}
        <div className="lg:hidden space-y-8 mb-14">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-xl border border-purple-300 flex items-center justify-center text-lg font-semibold text-purple-600 flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/insuranceSignupFlow?provider=dak"
            className="inline-flex items-center justify-center
  px-10 py-4 rounded-full font-semibold cursor-pointer text-white
  bg-gradient-to-r from-purple-600 to-primary
  hover:opacity-90 transition shadow-lg"
          >
            Sign up for Private Insurance
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
