"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PrivatePublicInsuranceHeroSection() {
  const scrollToNextSection = () => {
    const learnmore = document.getElementById("teriffs");
    if (learnmore) {
      learnmore.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-16 sm:py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {/* Tag */}
          <div
            className="
    inline-flex
    items-center
    gap-2
    mb-5
    rounded-full
  
    px-4
    py-2
    shadow-sm
  "
          >
            {/* ICON */}
            <div className="flex h-5 w-5 items-center justify-center rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </div>

            {/* TEXT */}
            <span className="text-xs sm:text-sm text-primary">
              Private health insurance
            </span>
          </div>
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Smart health coverage <br className="hidden sm:block" />
            for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">
              employees
            </span>
          </h1>
          {/* Description */}
          <p className="mt-4 text-gray-600 text-base sm:text-md max-w-xl">
            Private health insurance offers excellent benefits, stable premiums,
            and top-rated healthcare — perfectly suited for employees in
            Germany.
          </p>
          {/* Bullet Points */}
          <ul className="mt-6 space-y-4 text-gray-700 text-sm sm:text-base">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>
                <strong>Better benefits and lower costs</strong>
                <br />
                Excellent rates with up to 50% employer contribution
              </span>
            </li>

            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>
                <strong>Affordable even in old age</strong>
                <br />
                Stable premiums thanks to future-proof calculation
              </span>
            </li>

            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>
                <strong>Top-rated private health insurance</strong>
                <br />
                95% customer recommendation rate
              </span>
            </li>
          </ul>
          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/products/insuranceJourney"
                className="inline-flex items-center gap-2 justify-center rounded-full px-8 py-4 font-semibold text-white
            bg-gradient-to-r from-primary to-primary
            hover:opacity-90 transition shadow-md"
              >
                Discover tariffs now
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="relative w-full"
          style={{ height: "clamp(320px, 45vw, 520px)" }}
        >
          {/* ── Offset decorative border frame (top-right) ── */}
          <div
            className="absolute"
            style={{
              top: "-14px",
              right: "-14px",
              width: "75%",
              height: "75%",
              borderRadius: "32px",
              border: "2px solid #820ad1",
              opacity: 0.25,
              zIndex: 0,
            }}
          />

          {/* ── Soft purple glow blob behind image ── */}
          <div
            className="absolute"
            style={{
              top: "10%",
              left: "-8%",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(130,10,209,0.18) 0%, transparent 70%)",
              filter: "blur(28px)",
              zIndex: 0,
            }}
          />

          {/* ── Main image ── */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: "28px", zIndex: 1 }}
          >
            <Image
              src="/hero_assets/privatehero.jpg"
              alt="Private Health Insurance for Employees"
              fill
              className="object-cover object-center"
              priority
              style={{ borderRadius: "28px" }}
            />
            {/* Subtle dark gradient at bottom for contrast */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: "28px",
                background:
                  "linear-gradient(to bottom, transparent 50%, rgba(10,0,20,0.38) 100%)",
              }}
            />
          </div>

          {/* ── Floating stat pill — top-left ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.45 }}
            className="absolute flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl"
            style={{
              top: "20px",
              left: "20px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(130,10,209,0.15)",
              zIndex: 10,
            }}
          >
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full"
              style={{ background: "#820ad1" }}
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-none">
                Private Plan
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-none">
                Activated instantly
              </p>
            </div>
          </motion.div>

          {/* ── Floating rating card — bottom-right ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.85,
              duration: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            className="absolute flex flex-col gap-1 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              bottom: "24px",
              right: "20px",
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(130,10,209,0.12)",
              zIndex: 10,
              minWidth: "130px",
            }}
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-xs font-bold text-gray-900">4.9 / 5 rating</p>
            {/* <p className="text-[10px] text-gray-400 leading-tight">
              12,000+ customers
            </p> */}
          </motion.div>

          {/* ── Accent dot cluster — bottom-left decorative ── */}
          <div
            className="absolute"
            style={{
              bottom: "-18px",
              left: "-18px",
              width: "80px",
              height: "80px",
              zIndex: 0,
              backgroundImage: `radial-gradient(circle, rgba(130,10,209,0.35) 1.5px, transparent 1.5px)`,
              backgroundSize: "14px 14px",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
