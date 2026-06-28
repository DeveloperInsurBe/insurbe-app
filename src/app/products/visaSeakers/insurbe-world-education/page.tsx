"use client";

import { motion } from "framer-motion";
import { Globe, Lock, ShieldCheck } from "lucide-react";

const worldEducationFormUrl =
  "https://www2.elviab2b.de/mawista-booking/index.faces?SPRACHE=EN&PT=VIS&UVM=IB25";

export default function InsurbeWorldEducationBookingPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#faf7ff] to-[#f5f3ff] px-4 py-12 sm:px-8 lg:px-16">
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#820ad1]/10 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-[#c084fc]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest">
            Official Partner
          </p>
          <h1 className="mt-8 text-4xl font-black tracking-tight text-[#111827] md:text-6xl">
            Apply for{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              InsurBe World Education
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#667085] md:text-lg">
            Continue securely to the official application form to complete your
            InsurBe World Education booking.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9d5ff] bg-white px-4 py-2 text-sm font-medium text-[#475467] shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#820ad1]" />
              Secure Application
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9d5ff] bg-white px-4 py-2 text-sm font-medium text-[#475467] shadow-sm">
              <Lock className="h-4 w-4 text-[#820ad1]" />
              Opens in New Tab
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_25px_80px_rgba(130,10,209,0.10)]"
        >
          <div className="border-b border-[#f3e8ff] bg-gradient-to-r from-[#faf5ff] to-white px-6 py-5">
            <h2 className="text-xl font-bold text-[#111827]">Application Form</h2>
            <p className="mt-1 text-sm text-[#667085]">
              Open the official InsurBe World Education form in a new tab.
            </p>
          </div>

          <div className="space-y-5 px-6 pb-8 pt-6 md:px-8 md:pb-10">
            <div className="rounded-2xl border border-[#e9d5ff] bg-[#faf5ff] p-4 text-sm text-[#4b5563]">
              <p className="font-semibold text-[#111827]">
                Start your secure application
              </p>
              <p className="mt-1">
                Click below to continue on the official provider page. This
                avoids session timeout issues inside embedded iframes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={worldEducationFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#820ad1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6f08b2]"
              >
                <Globe className="h-4 w-4" />
                Continue Application
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
