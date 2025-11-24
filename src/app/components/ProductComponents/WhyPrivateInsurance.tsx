"use client";

import { motion } from "framer-motion";

export default function WhyPrivateInsurance() {
  return (
    <section className="px-6 md:px-16 bg-gradient-to-br from-white to-[#fdf3ff] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 max-w-7xl mx-auto">
        {/* Left Side Content with fade + slide from left */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6 leading-14">
            Why Private or Expat <br />
            Health Insurance?
          </h2>
          <p className="text-md text-black mb-8 leading-7">
            Lower monthly costs than GKV for healthy, high-earning individuals.
            English-speaking customer support. Faster access to doctor
            appointments and private clinics. Fully digital onboarding process.
            More personalized coverage with optional add-ons for dental, vision,
            and travel.
          </p>
          <button className="px-6 py-3 bg-primary hover:bg-primary/95 text-white text-sm font-medium rounded-md shadow">
            Check My Eligibility
          </button>
        </motion.div>

        {/* Right Side Image Card with fade + slide from right */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative bg-[#0f172a] rounded-xl shadow-lg w-full h-100 max-w-sm flex items-center justify-center">
            <img
              src="/img/whyPrivate.png"
              alt="Card Full"
              className="object-cover w-full h-full rounded-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
