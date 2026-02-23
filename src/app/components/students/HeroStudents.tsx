"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { INSURANCE_PLANS } from "@/app/constants/insurance";

function HeroStudents() {
  const router = useRouter();

  const handleScroll = () => {
    const el = document.getElementById("student");
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center  mt-15">
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
              variants={{
                hidden: { y: 10, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary w-fit"
            >
              InsurBe • Student Insurance
            </motion.span>

            {/* Heading */}
            <motion.h1
              variants={{
                hidden: { y: 16, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
            >
              Health Insurance for
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
                Students in Germany
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={{
                hidden: { y: 12, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              className="text-base sm:text-lg text-gray-600 max-w-xl"
            >
              Starting your studies in Germany? We help international students
              choose health insurance that meets university and visa
              requirements — explained clearly and without confusion.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={{
                hidden: { y: 10, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-md"
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
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative w-full "
          >
            {/* 🎁 Offer Badge */}
            <div className="absolute top-0 -left-18 translate-x-1/4 -translate-y-1/4 z-20">
              {/* Glow layer */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
      absolute inset-0
      rounded-full
      bg-linear-to-br from-pink-300 to-pink-400
      blur-xl
    "
              />

              {/* Badge */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                  y: [0, -6, 0],
                }}
                transition={{
                  scale: { duration: 0.4, ease: "easeOut" },
                  opacity: { duration: 0.3 },
                  rotate: { duration: 0.4 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                whileHover={{ scale: 1.08 }}
                className="
    relative
    w-24 h-24
    rounded-full
    bg-linear-to-br from-primary to-purple-400 
    text-white
    flex items-center justify-center
    shadow-2xl
    border border-white
    cursor-default
  "
              >
                {/* TEXT WRAPPER WITH TILT */}
                <motion.div
                  initial={{ rotate: -6 }}
                  animate={{ rotate: [-6, -4, -6] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-center font-extrabold"
                >
                  <span className="block text-xl leading-none tracking-tight">
                    €{INSURANCE_PLANS.INSURBE_STUDENT_BONUS}
                  </span>

                  <span className="block text-[12px] font-semibold px-2 leading-tight opacity-95 mt-0.5">
                    Amazon Welcome Bonus*
                  </span>
                </motion.div>
              </motion.div>
            </div>
            <div className="relative aspect-4/3 sm:aspect-5/4  rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/hero_assets/heroin.jpg"
                alt="Student insurance in Germany"
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

export default HeroStudents;
