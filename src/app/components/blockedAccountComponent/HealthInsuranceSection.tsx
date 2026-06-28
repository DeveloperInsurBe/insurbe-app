"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

// 🔥 ANIMATION VARIANTS
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
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function HealthInsuranceSection() {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* 🔥 LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden"
        >
          <Image
            src="/images_assets/student11.jpg"
            alt="health insurance"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        {/* 🔥 RIGHT CONTENT */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* HEADING */}
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight"
          >
            Health Insurance: A Must for Your Visa Journey
          </motion.h2>

          {/* TEXT */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-gray-600 text-lg max-w-xl"
          >
            Pluro offers reliable health insurance solutions tailored for your
            German visa requirements. Get the right coverage easily and stay
            protected throughout your journey.
          </motion.p>

          {/* BULLETS */}
          <motion.div variants={container} className="mt-8 space-y-4">
            {[
              "Complete coverage designed for peace of mind",
              "Fast and simple application process",
              "Get your documents quickly without delays",
            ].map((text, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ x: 6 }}
                className="flex items-start gap-3"
              >
                <motion.svg
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary mt-1"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="14" height="14" rx="2" />
                </motion.svg>

                <p className="text-gray-700">{text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* BUTTONS */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-primary hover:hover:bg-primary-dark  text-white px-6 py-3 rounded-xl shadow-md transition"
            >
              Get Pluro Plus Package
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              className="text-primary font-medium flex items-center gap-1"
            >
              Learn More About Pluro →
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
