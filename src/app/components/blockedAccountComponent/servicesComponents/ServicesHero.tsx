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

export default function ServicesHero() {
  return (
    <section className="w-full bg-primary-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
        {/* 🔥 LEFT CONTENT */}
        <motion.div variants={container} initial="hidden" animate="show">
          {/* TOP TEXT */}
          <motion.p
            variants={fadeUp}
            className="text-primary text-lg md:text-xl font-semibold mb-4"
          >
            Fast • Fully Digital • Best Value
          </motion.p>

          {/* HEADING */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl font-extrabold text-[#531D6F] leading-tight"
          >
            Blocked Account <br /> Germany
          </motion.h1>

          {/* SUBTEXT */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-gray-700 text-base md:text-lg max-w-md"
          >
            Open your blocked account quickly and manage everything online —
            secure, simple, and built for international students.
          </motion.p>

          {/* CTA */}
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-primary hover:hover:bg-primary-dark  text-white px-8 py-4 rounded-2xl font-semibold shadow-md transition"
          >
            Open Now
          </motion.button>
        </motion.div>

        {/* 🔥 RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full h-[350px] md:h-[500px]"
        >
          {/* GLOW */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-48 h-48 bg-white/40 rounded-full blur-3xl"
          />

          {/* FLOATING IMAGE */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-[350px] md:h-[500px] flex items-center justify-end"
          >
            <Image
              src="/images_assets/servicehero.png"
              alt="Student"
              width={600}
              height={500}
              priority
              className="h-full w-auto object-contain"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

