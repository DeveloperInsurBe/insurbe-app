"use client";

import { motion, Variants } from "framer-motion";

const benefits = [
  {
    title: "Personal Dashboard",
    desc: "Access your own dashboard to track funds, manage documents, and stay in control.",
  },
  {
    title: "Fast & Friendly Support",
    desc: "Get quick responses from our expert team whenever you need assistance.",
  },
  {
    title: "You're in Good Hands",
    desc: "Trusted by thousands of international students with excellent satisfaction ratings.",
  },
  {
    title: "Simple Product, Fair Price",
    desc: "We focus on essentials so you only pay for what truly matters.",
  },
];

// 🔥 ANIMATION VARIANTS
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function StudentBenefits() {
  return (
    <section className="w-full bg-primary-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* 🔥 BOX CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white/70 rounded-[28px] p-8 md:p-12"
        >
          
          {/* 🔥 TITLE */}
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-[#531D6F] mb-10"
          >
            <span className="text-primary">#</span> Student{" "}
            <span className="font-extrabold">Benefits</span>
          </motion.h2>

          {/* 🔥 GRID */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 md:gap-12"
          >
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className="flex items-start gap-4"
              >
                
                {/* ICON */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary text-xl mt-1"
                >
                  ✓
                </motion.div>

                {/* TEXT */}
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-[#531D6F]">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed max-w-md">
                    {item.desc}
                  </p>
                </div>

              </motion.div>
            ))}
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
