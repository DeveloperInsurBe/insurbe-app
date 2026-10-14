"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Globe, Lock, ShieldCheck } from "lucide-react";

// MAWISTA asked us to open their booking as an external link instead of an
// iframe: cross-domain security settings (and their payment providers)
// break the application process inside embedded iframes.
const mawistaStudentFormUrl =
  "https://www2.elviab2b.de/mawista-booking/index.faces?SPRACHE=EN&PT=STU&UVM=IB25";

export default function MawistaBookingPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#faf7ff] to-[#f5f3ff] px-4 py-12 sm:px-8 lg:px-16">
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#820ad1]/10 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-[#c084fc]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
            Official Partner
          </p>

          <h1 className="mt-8 text-4xl font-black tracking-tight text-[#111827] md:text-6xl">
            Apply for{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Mawista Student Insurance
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#667085] md:text-lg">
            Complete your insurance application securely through our official
            partner booking system.
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

        {/* Application card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[36px] border border-white/60 bg-white/80 shadow-[0_25px_80px_rgba(130,10,209,0.10)] backdrop-blur-xl"
        >
          <div className="overflow-hidden rounded-[36px]">
            <div className="border-b border-[#f3e8ff] bg-gradient-to-r from-[#faf5ff] to-white px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">Application Form</h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    Open the official MAWISTA student insurance form in a new tab.
                  </p>
                </div>
                <Image
                  src="/partners_asset/mawista.svg"
                  alt="MAWISTA"
                  width={160}
                  height={40}
                  className="h-9 w-auto object-contain"
                  unoptimized
                />
              </div>
            </div>

            <div className="space-y-5 px-6 pb-8 pt-6 md:px-8 md:pb-10">
              <div className="rounded-2xl border border-[#e9d5ff] bg-[#faf5ff] p-4 text-sm text-[#4b5563]">
                <p className="font-semibold text-[#111827]">Start your secure application</p>
                <p className="mt-1">
                  Click below to continue on the official MAWISTA booking page.
                  It opens in a new tab so the application and payment work
                  reliably – you can come back here at any time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={mawistaStudentFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#820ad1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6f08b2]"
                >
                  <Globe className="h-4 w-4" />
                  Continue Application
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
