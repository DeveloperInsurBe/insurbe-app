"use client";

import Image from "next/image";
import { CheckCircle, Shield, Zap } from "lucide-react";
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

export default function BlockedAccountSection() {
  return (
    <section className="w-full bg-[#fbf7ff] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
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
            Your Blocked Account: A Smart Step Towards Your Visa
          </motion.h2>

          {/* TEXT */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-gray-600 text-lg max-w-xl"
          >
            Pluro makes your visa journey easier with a secure and reliable
            blocked account solution. Open your account quickly and meet all
            requirements without stress.
          </motion.p>

          {/* BULLETS */}
          <motion.div variants={container} className="mt-8 space-y-4">
            {[
              {
                icon: <CheckCircle size={20} />,
                text: "Quick and hassle-free account setup for your visa process",
              },
              {
                icon: <Shield size={20} />,
                text: "Fully compliant with German visa regulations",
              },
              {
                icon: <Zap size={20} />,
                text: "Fast confirmation delivered securely to you",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ x: 6 }}
                className="flex items-start gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary mt-1"
                >
                  {item.icon}
                </motion.div>

                <p className="text-gray-700">{item.text}</p>
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

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden"
        >
          <Image
            src="/images_assets/students6.jpg"
            alt="students"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

