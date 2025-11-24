"use client";

import React from "react";
import { motion } from "framer-motion";

const PensionProductHeroSection = () => {
   const scrollToForm = () => {
    const section = document.getElementById("questionnaire-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="relative bg-primary bg-gradient-to-br from-primary to-primary text-white py-24 px-4 md:px-10 lg:px-20 overflow-hidden">
      {/* Grid overlay */}

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-[url('/img/productbg.png')] bg-cover bg-no-repeat bg-center opacity-80 z-0" />

        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium mb-4"
        >
          Insurbe
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold leading-tight mb-6"
        >
          Pension Plans for Expats & Professionals in Germany{" "}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg md:text-xl mb-10 px-18 text-white/90"
        >
          Secure your future. Start building your retirement plan today — with
          expert guidance in English.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="bg-transparent border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-primary transition font-semibold">
            Talk to an Advisor
          </button>
          <button
            onClick={scrollToForm}
            className="bg-white text-primary px-6 py-3 rounded-md hover:opacity-90 transition font-semibold"
          >
            Check My Eligibility
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PensionProductHeroSection;
