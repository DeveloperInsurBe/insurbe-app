"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

// 🔥 ANIMATION VARIANTS
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function StudentBlockedInfo() {
  return (
    <section className="w-full bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* 🔥 LEFT CONTENT */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* TITLE */}
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold text-[#531D6F] leading-tight"
          >
            Are you an international student who needs a{" "}
            <span className="text-primary">blocked account</span> before
            starting your studies?
          </motion.h2>

          {/* DESCRIPTION */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-gray-600 leading-relaxed max-w-xl text-sm md:text-base"
          >
            The required monthly amount is regulated by German authorities. The
            total depends on your duration of stay, and you can easily extend it
            later.
          </motion.p>

          {/* SUBTITLE */}
          <motion.h3
            variants={fadeUp}
            className="mt-8 text-lg md:text-xl font-semibold text-[#531D6F]"
          >
            Estimated cost for a 12-month blocked account
          </motion.h3>

          {/* LIST */}
          <motion.ul
            variants={container}
            className="mt-4 space-y-3 text-gray-700 text-sm md:text-base"
          >
            {[
              "€992 × 12 months = €11,904",
              "Opening fee: Simple & transparent pricing",
              "€80 buffer (returned with first payout)",
            ].map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                whileHover={{ x: 6 }}
                className="flex items-start gap-3"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary font-bold"
                >
                  ✓
                </motion.span>
                {item}
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8 bg-primary hover:hover:bg-primary-dark  text-white px-7 py-3 rounded-xl font-semibold shadow-md transition"
          >
            Open Now
          </motion.button>
        </motion.div>

        {/* 🔥 RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-[350px] md:h-[500px] lg:h-[550px] flex items-end justify-center"
        >
          {/* GLOW BACKGROUND */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute bottom-0 w-[80%] h-24 bg-teal-200/60 rounded-full blur-2xl"
          />

          {/* FLOATING IMAGE */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-[350px] md:h-[500px] flex items-end justify-center"
          >
            <Image
              src="/images_assets/students1.jpg"
              alt="Student"
              width={600}
              height={500}
              priority
              className="h-full w-auto object-contain rounded-2xl shadow-lg"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

