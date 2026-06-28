"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function KYCSection() {
  return (
    <section className="w-full bg-gradient-to-b from-primary-light to-white py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-200 p-6 md:p-10 shadow-lg hover:shadow-xl transition"
        >

          {/* ICON + TITLE */}
          <div className="flex items-start gap-4">
            
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-primary">
                KYC Partner
              </h3>

              <p className="mt-2 text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
                To protect your security and ensure compliance, we use{" "}
                <a
                  href="https://didit.me/"
                  target="_blank"
                  className="text-primary font-medium underline hover:text-primary-dark"
                >
                  Didit KYC
                </a>{" "}
                to verify account ownership safely and securely.
              </p>
            </div>

          </div>

          {/* OPTIONAL TRUST BADGES */}
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Secure Verification
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              GDPR Compliant
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Trusted Partner
            </span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}