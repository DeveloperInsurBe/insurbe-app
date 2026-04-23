"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const benefits = [
  {
    title: "Special expat rates",
    desc: "High savings potential",
  },
  {
    title: "English-speaking support",
    desc: "To make your life easier",
  },
  {
    title: "Excellent coverage",
    desc: "With outstanding tariffs",
  },
];

export default function ExpatFirstExpatHero() {
  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            German Expat Health Insurance{" "}
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
              Made Better
            </span>
          </h1>

          {/* Description */}
          <p className="mt-2 text-gray-600 max-w-xl text-base sm:text-lg leading-relaxed">
            Save money compared to public insurance while enjoying superior
            coverage.
          </p>

          {/* Benefits */}
          <ul className="mt-4 space-y-4">
            {benefits.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4"
              >
                <CheckCircle className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center
              px-10 py-4 rounded-full font-semibold text-white
              bg-gradient-to-r from-purple-600 to-primary
              hover:opacity-90 transition shadow-lg"
            >
              Get a free consultation
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center"
        >
          {/* Soft Background Glow */}
          <div className="absolute -inset-8 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-3xl blur-3xl opacity-70" />

          <Image
            src="/hero_assets/phero7.jpg"
            alt="Expat Health Insurance"
            width={620}
            height={620}
            className="relative rounded-3xl shadow-xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
