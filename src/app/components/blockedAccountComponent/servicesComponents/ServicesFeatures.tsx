"use client";

import { motion, Variants } from "framer-motion";

const features = [
  {
    title: "Fair Pricing",
    desc: "Transparent and student-friendly pricing. Pay only for what you truly need.",
    icon: "💰",
  },
  {
    title: "Fast Account Opening",
    desc: "Get your blocked account ready quickly with a smooth digital process.",
    icon: "🚀",
  },
  {
    title: "High Acceptance Rate",
    desc: "Trusted and accepted by German embassies and consulates worldwide.",
    icon: "🤝",
  },
  {
    title: "Local Currency Transfer",
    desc: "Transfer funds in your local currency and save on international fees.",
    icon: "💱",
  },
];

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

export default function ServicesFeatures() {
  return (
    <section className="w-full bg-primary-light py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* 🔥 HEADING */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center text-3xl md:text-5xl font-bold text-[#531D6F] leading-tight"
        >
          Open your <span className="text-primary">German Blocked</span>{" "}
          Account online
        </motion.h2>

        {/* 🔥 GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mt-12"
        >
          {features.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl p-6 md:p-8 flex items-start gap-5 shadow-sm hover:shadow-md transition"
            >
              {/* ICON */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="min-w-[60px] h-[60px] flex items-center justify-center rounded-2xl border-2 border-primary text-2xl"
              >
                {item.icon}
              </motion.div>

              {/* TEXT */}
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-[#531D6F]">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 🔥 CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex justify-center mt-14"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="bg-[#531D6F] hover:bg-[#4a1768] text-white px-8 py-4 rounded-2xl font-semibold shadow-md transition"
          >
            Create Blocked Account Now
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
