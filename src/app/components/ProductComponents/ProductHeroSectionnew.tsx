"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock, HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProductHeroSectionnew() {
  const router = useRouter();

  const handleScroll = () => {
    const el = document.getElementById("insurance");
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section className="relative py-10 md:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.span
              variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary w-fit"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              Trusted Insurance Partner
            </motion.span>

            {/* Heading (UNCHANGED TEXT) */}
            <motion.h1
              variants={{ hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
            >
              You work hard.
              <br />
         <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
  Your health insurance should too.
</span>
            </motion.h1>

            {/* Paragraph (UNCHANGED TEXT) */}
            <motion.p
              variants={{ hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="text-base sm:text-lg text-gray-600 max-w-xl"
            >
              We help professionals unlock better care, smarter coverage, and
              real savings — without paperwork or confusion.
            </motion.p>

            {/* Highlights */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Takes less time</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <HeartPulse className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Personalized coverage
                </span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="flex flex-col sm:flex-row gap-4 max-w-md pt-4"
            >
              <button
                onClick={() => router.push("/products/insuranceJourney")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg hover:opacity-90 transition"
              >
                Get a Quote
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleScroll}
                className="px-8 py-4 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-primary hover:text-primary transition"
              >
                Learn More
              </button>
            </motion.div>

            <p className="text-xs text-gray-500 pt-1">
              No paperwork • No obligations
            </p>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative w-full"
          >
            <div className="relative aspect-4/3 sm:aspect-5/4 lg:aspect-7/6 rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/hero_assets/working_professionals.avif"
                alt="Insurance coverage illustration"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
