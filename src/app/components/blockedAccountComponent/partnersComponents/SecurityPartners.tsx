"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function SecurityPartners() {
  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-white to-primary-light overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">

        {/* ================= LEFT — DIDIT (KYC) ================= */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* HEADER + LOGO */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={20} />
              <span className="text-primary text-sm font-medium uppercase tracking-wide">
                KYC Partner
              </span>
            </div>

            <Image
              src="/partners_assets/didit.svg"
              alt="Didit"
              width={100}
              height={40}
              className="h-8 w-auto object-contain  transition"
            />
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-primary">
            Verified with <span className="text-primary-dark">Didit</span>
          </h3>

          <p className="mt-4 text-gray-600 leading-relaxed max-w-md">
            To protect your security and ensure compliance, we use{" "}
            <a
              href="https://didit.me/"
              target="_blank"
              className="text-primary font-semibold underline"
            >
              Didit KYC
            </a>{" "}
            to verify account ownership safely and securely.
          </p>

          {/* BADGES */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Secure Verification
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Identity Protection
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Trusted KYC
            </span>
          </div>
        </motion.div>

        {/* ================= RIGHT — PROBO ================= */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* HEADER + LOGO */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" size={20} />
              <span className="text-primary text-sm font-medium uppercase tracking-wide">
                Compliance Partner
              </span>
            </div>

            <Image
              src="/partners_assets/probo.svg"
              alt="Probo"
              width={100}
              height={40}
              className="h-8 w-auto object-contain  transition"
            />
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-primary">
            Secured by <span className="text-primary-dark">Probo</span>
          </h3>

          <p className="mt-4 text-gray-600 leading-relaxed max-w-md">
            To stay ahead of evolving security standards, we’ve partnered with{" "}
            <a
              href="https://www.getprobo.com/"
              target="_blank"
              className="text-primary font-semibold underline"
            >
              Probo
            </a>{" "}
            to keep our compliance fully up to date.
          </p>

          <p className="mt-3 text-gray-600 leading-relaxed max-w-md">
            Our systems remain continuously monitored, secure, and audit-ready
            at all times.
          </p>

          {/* BADGES */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-700">
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

      </div>
    </section>
  );
}