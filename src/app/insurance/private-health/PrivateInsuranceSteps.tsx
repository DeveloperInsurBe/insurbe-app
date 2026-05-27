"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    step: "1",
    title: "Check tariff details",
    desc: "Based on your information, you will find all relevant tariff information on this page.",
  },
  {
    step: "2",
    title: "Complete the application online",
    desc: "You can check and finalize the additional health protection in just 3 minutes.",
  },
  {
    step: "3",
    title: "Peace of mind guaranteed",
    desc: "Enjoy your upgrade to first-class preventative care and health services.",
  },
];

type PrivateInsuranceStepsProps = {
  desktopCtaHref?: string;
  mobileCtaHref?: string;
};

export default function PrivateInsuranceSteps({
  desktopCtaHref = "/products/insuranceJourney",
  mobileCtaHref = "/insuranceSignupFlow?provider=dak",
}: PrivateInsuranceStepsProps) {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-8 sm:py-20 lg:px-16">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex rounded-full px-6 py-2 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ background: "rgba(130, 10, 209, 0.14)", color: "#820ad1" }}
          >
            HERE&apos;S HOW IT WORKS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold leading-tight text-black sm:text-5xl"
          >
            In only{" "}
            <span className="relative inline-block text-primary">
              3 steps
              <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-primary/30" />
            </span>{" "}
            secured
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.45 }}
              className="relative rounded-[26px] bg-white px-6 pb-12 pt-16 text-center sm:px-9"
              style={{
                border: "1px solid rgba(130, 10, 209, 0.14)",
                boxShadow: "0 8px 30px rgba(130, 10, 209, 0.10)",
              }}
            >
              <span
                className="absolute -top-9 left-1/2 -translate-x-1/2 text-7xl font-black leading-none"
                style={{
                  color: "#ebd8ff",
                  WebkitTextStroke: "2px #820ad1",
                }}
              >
                {item.step}
              </span>

              <h3 className="text-[20px] font-bold leading-tight text-[#534172] sm:text-[26px]">
                {item.title}
              </h3>
              <p className="mx-auto mt-5 max-w-[360px] text-[15px] font-medium leading-relaxed text-[#534172] sm:text-md">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mt-12 hidden text-center sm:block"
        >
          <Link
            href={desktopCtaHref}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#9f3cff] px-8 py-4 text-sm font-bold text-white"
            style={{
              boxShadow: "0 10px 24px rgba(130, 10, 209, 0.34)",
            }}
          >
            Get started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center sm:hidden"
        >
          <Link
            href={mobileCtaHref}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#9f3cff] px-8 py-4 text-sm font-bold text-white"
            style={{
              boxShadow: "0 10px 24px rgba(130, 10, 209, 0.34)",
            }}
          >
            Get started now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
