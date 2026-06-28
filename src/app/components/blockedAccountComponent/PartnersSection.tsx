"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";

const logos = [
  "/partners_asset/allianz.avif",
  "/partners_asset/barmer.avif",
  "/partners_asset/mawista.avif",
  "/partners_asset/hallesche.png",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], // ✅ BEST
    },
  },
};

export default function PartnersSection() {
  return (
    <section className="w-full bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">

        {/* 🔥 SCROLL ANIMATION */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="text-lg md:text-2xl font-medium text-gray-800 max-w-3xl mx-auto"
        >
          We collaborate with trusted partners to make your journey to Germany
          simple, secure, and stress-free.
        </motion.h2>

        {/* MARQUEE */}
        <div className="mt-12 relative overflow-hidden">
          <motion.div
            className="flex gap-16 items-center"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 28,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1, y: -6 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex-shrink-0"
              >
                <Image
                  src={logo}
                  alt="partner"
                  width={140}
                  height={60}
                  className="object-contain h-[40px] md:h-[50px] w-auto opacity-90 hover:opacity-100 transition"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* GRADIENT EDGES */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>

      </div>
    </section>
  );
}