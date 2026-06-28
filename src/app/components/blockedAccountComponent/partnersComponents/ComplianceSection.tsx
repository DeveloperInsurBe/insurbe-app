"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function ComplianceSection() {
  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-white to-primary-light overflow-hidden">

      {/* 🔥 SOFT BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* 🔵 LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-primary" size={22} />
            <span className="text-primary font-medium text-sm tracking-wide uppercase">
              Compliance Partner
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-primary leading-tight">
            Built for Security. <br />
            Backed by <span className="text-primary-dark">Probo</span>.
          </h2>

          <p className="mt-6 text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
            To stay ahead of evolving security standards, we’ve partnered with{" "}
            <a
              href="https://www.getprobo.com/"
              target="_blank"
              className="text-primary font-semibold underline"
            >
              Probo
            </a>{" "}
            to ensure our compliance is always up to date.
          </p>

          <p className="mt-4 text-gray-600 text-base leading-relaxed max-w-xl">
            This partnership reflects our commitment to maintaining the highest
            levels of security, reliability, and regulatory standards.
          </p>

          <p className="mt-4 text-gray-600 text-base leading-relaxed max-w-xl">
            With Probo, our systems remain continuously monitored, secure, and
            audit-ready at all times.
          </p>

          {/* 🔥 INLINE BADGES */}
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Audit Ready
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Enterprise Security
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Continuous Compliance
            </span>
          </div>
        </motion.div>

        {/* 🔵 RIGHT VISUAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative flex justify-center"
        >
          {/* GLOW */}
          <div className="absolute w-[260px] h-[260px] bg-primary/20 blur-3xl rounded-full" />

          {/* LOGO BLOCK */}
          <div className="relative flex flex-col items-center justify-center gap-4">

            <Image
              src="/partners_assets/probo.svg"
              alt="Probo"
              width={160}
              height={80}
              className="w-[140px] h-auto object-contain"
            />

            <p className="text-sm text-gray-500 text-center">
              Trusted Compliance Infrastructure
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}