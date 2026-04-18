"use client";

import { motion } from "framer-motion";

export default function SustainableSection() {
  return (
    <section className="relative md:py-24 py-10 px-4 sm:px-6 lg:px-12 overflow-hidden bg-linear-to-br from-slate-50 via-purple-50/40 to-blue-50/40">
      
      
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
        className="absolute top-40 right-10 w-60 h-60 bg-blue-400 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        viewport={{ once: true }}
        className="absolute -bottom-24 right-24 w-80 h-80 bg-pink-400 rounded-full blur-3xl"
      />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Heading */}
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-10"
        >
          Building a{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
            responsible and future-ready
          </span>{" "}
          insurance platform
        </motion.h2>

        {/* Content */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
          className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-6 backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl p-8 shadow-xl shadow-purple-500/10"
        >
          <p>
            At InsurBe, responsibility goes beyond insurance coverage. We focus on
            building secure, transparent, and technology-driven solutions that
            protect people while respecting long-term social and environmental
            impact.
          </p>

          <p>
            By combining advanced technology, strong security standards, and
            smart operational practices, we aim to create sustainable value for
            our customers, partners, and the communities we serve—today and in
            the future.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
