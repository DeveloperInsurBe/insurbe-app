"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  CalendarDays,
  HeartPulse,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  { icon: ShieldCheck, label: "Accepted for\nresidence permits" },
  { icon: Users, label: "Family members\nincluded" },
  { icon: CalendarDays, label: "Fixed monthly\ncontributions" },
  { icon: HeartPulse, label: "Access to public\nhealthcare providers" },
];

export default function PublicInsuranceHeroSection() {
  const scrollToNextSection = () => {
    document
      .getElementById("learnmore")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative overflow-hidden py-14 sm:py-16 px-4 sm:px-8 lg:px-16"
      style={{ background: "#f5f0ff" }}
    >
      <div
        className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(130,10,209,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* ── LEFT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col"
        >
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full   bg-purple-100 px-4 py-1.5 text-sm text-primary shadow-sm">
            <ShieldCheck className="w-4 h-4" style={{ color: "#820ad1" }} />
            Trusted. Reliable. For You.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold  text-gray-900">
            Public Health
            <br />
            <span style={{ color: "#820ad1" }}>Insurance</span>
            <br />
            in Germany
          </h1>

          <p className="mt-5 text-gray-500 text-sm sm:text-base max-w-md leading-relaxed">
            The most common and legally required healthcare option for students,
            employees, and families living in Germany.
          </p>

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white px-3 py-4 text-center shadow-sm"
                style={{ border: "1px solid #ede9fe" }}
              >
                <Icon className="w-6 h-6" style={{ color: "#820ad1" }} />
                <span className="text-xs text-gray-600 leading-snug whitespace-pre-line">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/products/insuranceJourney"
                className="inline-flex items-center gap-2 rounded-full px-5 py-4 text-sm font-bold text-white shadow-md transition hover:opacity-90"
                style={{ background: "#820ad1" }}
              >
                Get a quote
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </Link>
            </motion.div>

            <button
              onClick={scrollToNextSection}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-7 py-4 text-sm font-semibold text-gray-800 transition hover:border-purple-400 hover:text-purple-700"
            >
              Learn more
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative"
          style={{ paddingBottom: "100px", paddingLeft: "30px" }}
        >
          {/* Purple arc border — left side only, sits behind and to the left of the image */}
          <div
            className="absolute"
            style={{
              top: "10%",
              bottom: "18%",
              left: "10px",
              width: "28px",
              border: "2px solid rgba(130,10,209,0.45)",
              borderRight: "none",
              borderRadius: "40px 0 0 40px",
              zIndex: 0,
            }}
          />

          {/* Image — simple rounded rectangle */}
          <div
            className="relative overflow-hidden w-full"
            style={{
              borderRadius: "24px",
              aspectRatio: "4 / 4.2",
              zIndex: 1,
            }}
          >
            <Image
              src="/hero_assets/phero.jpg"
              alt="Happy family with public health insurance in Germany"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Floating purple card — hangs below bottom-left of image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="absolute rounded-2xl p-5 shadow-2xl"
            style={{
              background: "#820ad1",
              width: "200px",
              /* sits below the image, starting from left edge */
              bottom: "0px",
              left: "30px",
              zIndex: 20,
            }}
          >
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-bold text-base leading-snug">
              Your health.
              <br />
              Our priority.
            </p>
            <p
              className="mt-2 text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Quality care that protects what matters most.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
