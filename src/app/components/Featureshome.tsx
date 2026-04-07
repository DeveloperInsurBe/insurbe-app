"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const advantages = [
  {
    number: "01",
    title: "In Your Own Way",
    desc: "Choose coverage options that truly fit your needs and budget — no unnecessary extras, no compromises.",
  },
  {
    number: "02",
    title: "No Hidden Fees",
    desc: "What you see is what you pay. Full pricing transparency with absolutely no surprises later.",
  },
  {
    number: "03",
    title: "Simple & Fast",
    desc: "Simulate, customise, and activate your insurance in minutes — zero paperwork, fully online.",
  },
];

export default function Featureshome() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-20 px-4 sm:px-8 lg:px-16 overflow-hidden ">
      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Smart, transparent,
            <br />
            and flexible
          </h2>

          <p className="text-lg text-gray-500 max-w-xl">
            Insurance solutions designed for modern businesses and individuals living in Germany.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advantages.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="relative"
            >
              {/* Card */}
              <div
                className={`
                  relative
                  rounded-3xl
                  p-8
                  h-full
                  transition-all
                  duration-300
                  ${
                    hoveredIndex === index
                      ? "bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg"
                      : "bg-gradient-to-br from-gray-50 to-purple-50/30"
                  }
                `}
              >
                {/* Border on hover */}
                <div
                  className={`
                    absolute
                    inset-0
                    rounded-3xl
                    border-t-2
                    transition-all
                    duration-300
                    ${
                      hoveredIndex === index
                        ? "border-purple-400"
                        : "border-transparent"
                    }
                  `}
                />

                {/* Number */}
                <div className="relative mb-6">
                  <span className="text-6xl font-bold text-purple-200/60">
                    {item.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="relative text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="relative text-base text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}