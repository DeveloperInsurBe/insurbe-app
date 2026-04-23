"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PrivatePublicInsuranceHeroSection() {
  const scrollToNextSection = () => {
    const learnmore = document.getElementById("teriffs");
    if (learnmore) {
      learnmore.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {/* Tag */}
          <span
            className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium
            bg-purple-100 text-purple-700"
          >
            Private health insurance for employees
          </span>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            The ideal health protection <br className="hidden sm:block" />
            for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary">
              employees
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-xl">
            Private health insurance offers excellent benefits, stable premiums,
            and top-rated healthcare — perfectly suited for employees in
            Germany.
          </p>

          {/* Bullet Points */}
          <ul className="mt-6 space-y-4 text-gray-700 text-sm sm:text-base">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <span>
                <strong>Better benefits and lower costs</strong>
                <br />
                Excellent rates with up to 50% employer contribution
              </span>
            </li>

            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <span>
                <strong>Affordable even in old age</strong>
                <br />
                Stable premiums thanks to future-proof calculation
              </span>
            </li>

            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <span>
                <strong>Top-rated private health insurance</strong>
                <br />
                95% customer recommendation rate
              </span>
            </li>
          </ul>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/products/insuranceJourney"
                className="inline-flex items-center gap-2 justify-center rounded-full px-8 py-4 font-semibold text-white
            bg-gradient-to-r from-purple-600 to-primary
            hover:opacity-90 transition shadow-md"
              >
                Discover tariffs now
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>
          
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="relative w-full h-[300px] sm:h-[380px] lg:h-[480px]"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-200 to-purple-200" />
          <Image
            src="/hero_assets/privatehero.jpg"
            alt="Private Health Insurance for Employees"
            fill
            className="object-cover relative z-10 rounded-3xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
