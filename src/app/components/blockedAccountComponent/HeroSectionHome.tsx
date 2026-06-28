"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const images = [
  "/images_assets/student1.jpg",
  "/images_assets/student2.jpg",
  "/images_assets/student4.jpg",
  "/images_assets/students4.jpg",
  "/images_assets/students2.jpg",
  "/images_assets/students1.jpg",
];

// 🔥 animation variants
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function HeroSectionHome() {
  return (
    <section className="w-full bg-white py-20 md:py-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h1
            variants={item}
            className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight"
          >
            All You Need for <br /> Your German Visa
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-gray-600 text-lg max-w-lg"
          >
            Get your blocked account and health insurance from one trusted
            source. <span className="font-semibold text-primary">Pluro</span>{" "}
            simplifies your entire visa process — fast, secure, and officially
            approved for your study in Germany.
          </motion.p>

          <motion.button
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8 bg-primary hover:hover:bg-primary-dark  text-white px-6 py-4 rounded-xl shadow-md transition"
          >
            Health Insurance & Blocked Account
          </motion.button>
        </motion.div>

        {/* RIGHT SIDE IMAGES */}
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {/* FLOAT WRAPPER */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="grid grid-cols-2 gap-4"
              animate={{ y: ["0%", "-50%"] }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...images, ...images].map((src, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-[200px] md:h-[240px] rounded-2xl overflow-hidden shadow-lg"
                >
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-[200px] md:h-[240px] rounded-2xl overflow-hidden shadow-lg"
                  >
                    <Image
                      src={src}
                      alt="hero"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* OPTIONAL GLOW EFFECT */}
          <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-teal-200/30 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}
