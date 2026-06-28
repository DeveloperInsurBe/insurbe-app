"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import ContactModal from "./ContactModal";

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

export default function SupportSection() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <section className="w-full bg-primary/60 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* 🔥 LEFT CONTENT */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="text-white"
          >
            {/* HEADING */}
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight"
            >
              Fast Support for Your Questions & Needs
            </motion.h2>

            {/* TEXT */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-white/90 text-lg max-w-xl"
            >
              At Pluro, we know that visa processes can feel overwhelming. Our
              expert support team is here to guide you every step of the way.
            </motion.p>

            {/* FEATURES */}
            <motion.div variants={container} className="mt-8 space-y-4">
              {[
                "Available in multiple languages including English, German, Arabic, and more",
                "Reach us via phone or email anytime",
                "Dedicated team of visa experts ready to assist you",
                "Quick responses so you never feel stuck",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ x: 6 }}
                  className="flex items-start gap-3"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl"
                  >
                    {["🌐", "📞", "👥", "⏱️"][i]}
                  </motion.span>

                  <p className="text-white/90">{text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* BUTTON */}
            <motion.div variants={fadeUp} className="mt-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setOpenModal(true)}
                className="bg-white text-[#820ad1] px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition"
              >
                Contact Us
              </motion.button>
            </motion.div>
          </motion.div>

          {/* 🔥 RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full h-[350px] md:h-[520px]"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images_assets/student6.jpg"
                alt="support"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🔥 MODAL */}
      <ContactModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}

