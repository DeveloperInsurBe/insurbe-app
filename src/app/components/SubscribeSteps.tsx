"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Complete your information",
    description: "In just a few clicks",
  },
  {
    number: "2",
    title: "Choose your plan",
    description: "Personalize your cover at the best price",
  },
  {
    number: "3",
    title: "Your contract is subscribed",
    description: "Receive your certificate quickly",
  },
];

export default function SubscribeSteps() {
  return (
    <section className="relative md:pb-16 pb-10 px-6 lg:px-20 overflow-hiddenbg-[#F8F5FF] ">
      <div className="container mx-auto sm:px-4">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-primary">
            Quick & Easy Process
          </span>

          <h2 className="mt-4 text-3xl font-extrabold  text-slate-900 sm:text-4xl ">
            Subscribe online{" "}
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              In 2 Minutes
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            And our team take over, it's simple and quick!
          </p>
        </div>

        {/* Desktop */}
        <div className="relative mx-auto mt-12 hidden max-w-5xl lg:block">
          {/* Progress Line */}
          <div className="absolute left-36 right-36 top-6 h-[3px] rounded-full bg-purple-600" />

          <div className="grid grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Number */}
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-xl font-bold text-white shadow-md">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="mt-6 text-[22px] font-medium leading-snug text-slate-900 px-6">
                  {step.number}.{step.title}
                </h3>

                {/* Description */}
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="mt-10 space-y-4 lg:hidden">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-sm font-bold text-white">
                {step.number}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/products/insuranceJourney"
            className="group inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-3 text-base font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
