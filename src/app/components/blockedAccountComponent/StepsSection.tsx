"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Step 1: Confirm Identity",
    description:
      "Start by confirming your identification through our secure app. This ensures a safe and risk-free process.",
    image: "/images_assets/identity.avif",
  },
  {
    id: 2,
    title: "Step 2: Transfer Funds",
    description:
      "Next, transfer the required funds to your blocked account. This step is crucial for your visa application.",
    image: "/images_assets/student8.jpg",
  },
  {
    id: 3,
    title: "Step 3: Receive Your Blocking Confirmation",
    description:
      "Receive all necessary visa documents quickly and securely from Pluro.",
    image: "/images_assets/studenttab.jpg",
  },
];

// 🔥 ANIMATIONS
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function StepsSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* 🔥 HEADING (SCROLL ANIMATED) */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl md:text-4xl font-bold text-gray-800"
          >
            Easy Path to Your Blocked Account
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-gray-600 text-sm md:text-base"
          >
            Follow our simple three-step process to get started quickly.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-6 flex items-center justify-center gap-6"
          >
            <button className="bg-primary hover:hover:bg-primary-dark  text-white px-5 py-2 rounded-lg text-sm">
              Get Pluro Plus Package
            </button>

            <button className="text-primary text-sm font-medium">
              Learn More →
            </button>
          </motion.div>
        </motion.div>

        {/* CONTENT */}
        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT IMAGE (ANIMATED ON STEP CHANGE) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden"
          >
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full" // ✅ ADD THIS
            >
              <Image
                src={steps[activeStep].image}
                alt="step"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
          {/* RIGHT STEPS */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {steps.map((step, index) => {
              const isActive = activeStep === index;

              return (
                <motion.div
                  key={step.id}
                  variants={fadeUp}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ x: 6 }}
                  className="cursor-pointer"
                >
                  <div className="flex gap-6">
                    {/* LINE */}
                    <div
                      className={`w-[2px] transition-all ${
                        isActive ? "bg-primary" : "bg-gray-200"
                      }`}
                    />

                    {/* TEXT */}
                    <div>
                      <h3
                        className={`text-xl md:text-2xl font-semibold transition ${
                          isActive ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="mt-2 text-gray-600 text-sm md:text-base max-w-md">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
