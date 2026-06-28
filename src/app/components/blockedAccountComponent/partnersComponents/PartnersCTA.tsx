"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Mail } from "lucide-react";

export default function PartnersCTA() {
  return (
    <section className="w-full bg-primary py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">

        {/* 🔵 LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center lg:justify-start"
        >
          <Image
            src="/partners_assets/handIcon.webp" 
            alt="partners"
            width={420}
            height={260}
            className="w-full max-w-md h-auto object-contain"
            priority
          />
        </motion.div>

        {/* 🔵 RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            New Partners <br />
            <span className="text-white font-extrabold">Welcome!</span>
          </h2>

          <p className="mt-4 text-white/90 text-lg max-w-md leading-relaxed">
            Are you offering products or services that help students? Let’s join
            hands and grow together with{" "}
            <span className="font-semibold">Pluro</span>.
          </p>

          {/* 🔥 EMAIL CTA */}
          <div className="mt-8 flex items-center gap-3 text-white">
            <Mail className="text-white" size={20} />
            <p className="text-lg">
              Just write us at{" "}
              <a
                href="mailto:partner@pluro.com"
                className="underline font-semibold hover:text-white/80"
              >
                partner@pluro.com
              </a>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}