"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WhyPrivateInsurance() {
  const router = useRouter();

  return (
    <section id="insurance" className="py-10 md:py-16 px-4 sm:px-18 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 max-w-7xl mx-auto">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* ✅ Gradient Heading */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            <span className="text-black ">
              Why Private or Expat
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Health Insurance?
            </span>
          </h2>

          <p className="text-md text-gray-700 mb-8 leading-7">
            Lower monthly costs than GKV for healthy, high-earning individuals.
            English-speaking customer support. Faster access to doctor
            appointments and private clinics. Fully digital onboarding process.
            More personalized coverage with optional add-ons for dental, vision,
            and travel.
          </p>

          {/* ✅ Gradient Button (Your Theme) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            onClick={() => router.push("/products/insuranceJourney")}
            className="
              inline-flex items-center justify-center
              px-8 py-4
              rounded-full
              bg-gradient-to-r from-primary to-purple-600
              text-white
              text-sm font-semibold
              shadow-lg hover:shadow-xl
              hover:opacity-90
              transition
            "
          >
            Check My Eligibility
          </motion.button>
        </motion.div>

        {/* Right Image (unchanged) */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative bg-[#0f172a] rounded-xl shadow-lg w-full h-100 max-w-sm flex items-center justify-center">
            <Image
              src="/img/private_insurance.avif"
              alt="Private insurance"
              fill
              className="object-cover rounded-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
