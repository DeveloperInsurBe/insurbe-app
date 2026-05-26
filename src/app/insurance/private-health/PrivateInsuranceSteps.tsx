"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    step: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="4" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="21" cy="21" r="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19 21h4M21 19v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    tag: "Start here",
    title: "Fill out your details",
    desc: "Tell us where you're going and select your package. Takes less than 2 minutes.",
  },
  {
    step: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L16.5 10H24L18 14.5L20.5 21.5L14 17L7.5 21.5L10 14.5L4 10H11.5L14 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    tag: "Instant result",
    title: "Get your quote",
    desc: "Receive a personalised quote in seconds. Compare plans and pick what fits best.",
  },
  {
    step: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C14 3 7 7 7 14v6l7 3 7-3v-6c0-7-7-11-7-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10.5 14l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: "You're covered",
    title: "Sign up & get covered",
    desc: "Approve your plan and get your policy document instantly. Zero paperwork.",
  },
];

export default function PrivateInsuranceSteps() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-8 lg:px-16 overflow-hidden bg-white">

      {/* ── Mesh background blobs ── */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(130,10,209,0.06) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <span
                className="h-px w-8 rounded-full inline-block"
                style={{ background: "#820ad1" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "#820ad1" }}
              >
                How it works
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1]"
            >
              Get insured in{" "}
              <span
                className="relative inline-block"
                style={{
                  backgroundImage: "linear-gradient(135deg, #820ad1 0%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                3 easy steps
                {/* underline squiggle */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 4 Q25 0 50 4 Q75 8 100 4 Q125 0 150 4 Q175 8 200 4"
                    stroke="url(#sq)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="sq" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#820ad1" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h2>
          </div>

          {/* CTA right-aligned on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="hidden sm:block shrink-0"
          >
            <Link
              href="/products/insuranceJourney"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #820ad1 0%, #a855f7 100%)",
                boxShadow: "0 8px 24px rgba(130,10,209,0.30)",
              }}
            >
              Get started
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.13, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl p-7 flex flex-col gap-5 cursor-default overflow-hidden"
              style={{
                background: idx === 1
                  ? "linear-gradient(145deg, #820ad1 0%, #a855f7 100%)"
                  : "white",
                border: idx === 1
                  ? "none"
                  : "1.5px solid rgba(130,10,209,0.12)",
                boxShadow: idx === 1
                  ? "0 20px 60px rgba(130,10,209,0.30)"
                  : "0 4px 24px rgba(130,10,209,0.06)",
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* Background texture for non-featured */}
              {idx !== 1 && (
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at top right, rgba(130,10,209,0.05) 0%, transparent 70%)",
                  }}
                />
              )}

              {/* Top row: step number + tag */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-black tracking-widest"
                  style={{ color: idx === 1 ? "rgba(255,255,255,0.5)" : "rgba(130,10,209,0.35)" }}
                >
                  {item.step}
                </span>
                <span
                  className="text-[11px] font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: idx === 1 ? "rgba(255,255,255,0.18)" : "rgba(130,10,209,0.08)",
                    color: idx === 1 ? "white" : "#820ad1",
                  }}
                >
                  {item.tag}
                </span>
              </div>

              {/* Icon circle */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: idx === 1 ? "rgba(255,255,255,0.18)" : "rgba(130,10,209,0.08)",
                  color: idx === 1 ? "white" : "#820ad1",
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2 flex-1">
                <h3
                  className="text-lg font-bold leading-snug"
                  style={{ color: idx === 1 ? "white" : "#111827" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: idx === 1 ? "rgba(255,255,255,0.75)" : "#6b7280" }}
                >
                  {item.desc}
                </p>
              </div>

              {/* Arrow */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center self-end transition-transform duration-300 group-hover:translate-x-1"
                style={{
                  background: idx === 1 ? "rgba(255,255,255,0.2)" : "rgba(130,10,209,0.08)",
                  color: idx === 1 ? "white" : "#820ad1",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connector dots between cards (desktop only) */}
        <div className="hidden md:flex items-center justify-center gap-0 -mt-[calc(50%-24px)] pointer-events-none select-none mb-0 relative z-20" style={{ marginTop: "-180px", marginBottom: "160px" }}>
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center">
              <div style={{ width: "calc(33.333% - 20px)" }} />
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(130,10,209,0.25)" }} />
                <span className="w-8 h-px" style={{ background: "rgba(130,10,209,0.15)" }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(130,10,209,0.25)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sm:hidden mt-8 text-center"
        >
          <Link
            href="/insuranceSignupFlow?provider=dak"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #820ad1 0%, #a855f7 100%)",
              boxShadow: "0 8px 24px rgba(130,10,209,0.28)",
            }}
          >
            Get started now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}