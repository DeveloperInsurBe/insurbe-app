"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const features = [
  {
    id: 0,
    title: "Take control",
    description:
      "Track your blocked account transfer, payouts, balance, and insurance status.",
    image: "/images_assets/dashboard.png",
  },
  {
    id: 1,
    title: "Document management",
    description:
      "Download and request any updated documents you may need, anytime.",
    image: "/images_assets/dashboard1.png",
  },
  {
    id: 2,
    title: "Stay organized",
    description: "Get notified about tasks and manage everything in one place.",
    image: "/images_assets/dashboard2.png",
  },
];

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

export default function DashboardFeaturesSection() {
  const [active, setActive] = useState(0);

  // 🔥 AUTO SWITCH
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-primary-light py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* 🔥 HEADING */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl md:text-5xl font-bold mb-16 leading-tight"
        >
          <span className="text-[#531D6F] font-extrabold">1 Dashboard</span>{" "}
          <span className="text-[#531D6F]/70">, many functions</span>
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((item, index) => {
              const isActive = active === index;

              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  onClick={() => setActive(index)}
                  whileHover={{ scale: 1.02 }}
                  className={`cursor-pointer p-6 rounded-2xl transition-all duration-300
                  ${
                    isActive
                      ? "backdrop-blur-md bg-white/60 border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
                      : "bg-transparent hover:bg-white/30"
                  }`}
                >
                  <h3
                    className={`text-xl md:text-2xl transition-all ${
                      isActive
                        ? "font-bold text-[#531D6F]"
                        : "text-[#531D6F]"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[#531D6F]/70 text-sm md:text-base max-w-md">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full"
          >
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center"
            >
              {/* FRAME */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" />

              {/* IMAGE */}
              <div className="relative w-[92%] h-[90%] rounded-2xl overflow-hidden">
                <Image
                  src={features[active].image}
                  alt="dashboard"
                  width={900}
                  height={600}
                  className="max-h-full w-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

