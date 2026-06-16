"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ShieldCheck, Lock, Globe } from "lucide-react";

export default function MawistaExpatcarePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#faf7ff] to-[#f5f3ff] px-4 py-12 sm:px-8 lg:px-16">
      {/* BACKGROUND GLOWS */}
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#820ad1]/10 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-[#c084fc]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          {/* LOGO */}
          {/* <div className="flex justify-center">
            <div className="rounded-2xl border border-white/60 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-xl">
              <Image
                src="/partners_asset/mawista.svg"
                alt="MAWISTA"
                width={200}
                height={50}
                className="h-10 w-auto object-contain"
                unoptimized
              />
            </div>
          </div> */}

          {/* TITLE */}
          <h1 className="mt-8 text-4xl font-black tracking-tight text-[#111827] md:text-6xl">
            MAWISTA Expatcare
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#667085] md:text-lg">
            Complete your application securely using the MAWISTA Expatcare
            application form.
          </p>

          {/* TRUST BADGES */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9d5ff] bg-white px-4 py-2 text-sm font-medium text-[#475467] shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#820ad1]" />
              Secure Application
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9d5ff] bg-white px-4 py-2 text-sm font-medium text-[#475467] shadow-sm">
              <Lock className="h-4 w-4 text-[#820ad1]" />
              SSL Protected
            </div>
          </div>
        </motion.div>

        {/* APPLICATION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            relative overflow-hidden
            rounded-[36px]
            border border-white/60
            bg-white/80
            backdrop-blur-xl
            shadow-[0_25px_80px_rgba(130,10,209,0.10)]
          "
        >
          {/* TOP BAR */}
          <div className="border-b border-[#f3e8ff] bg-gradient-to-r from-[#faf5ff] to-white px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">
                  Application Form
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Complete the form below to apply for MAWISTA Expatcare.
                </p>
              </div>
               <div className="flex justify-center">
            <div className="rounded-2xl border border-white/60 px-6 py-4 backdrop-blur-xl">
              <Image
                src="/partners_asset/mawista.svg"
                alt="MAWISTA"
                width={200}
                height={50}
                className="h-10 w-auto object-contain"
                unoptimized
              />
            </div>
          </div>
            </div>
          </div>

          {/* IFRAME WRAPPER */}
          <div className="relative h-[3400px] md:h-[3600px]">
            {!isLoaded && (
              <div className="absolute inset-0 z-20 bg-white">
                <div className="animate-pulse p-6 md:p-8">
                  {/* HEADER */}
                  <div className="mb-8 h-10 w-60 rounded-xl bg-[#ede9fe]" />

                  {/* FORM FIELDS */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-12 rounded-xl bg-[#f3f4f6]" />
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="h-12 rounded-xl bg-[#f3f4f6]" />
                    <div className="h-12 rounded-xl bg-[#f3f4f6]" />
                    <div className="h-12 rounded-xl bg-[#f3f4f6]" />
                  </div>

                  <div className="mt-8 h-12 w-44 rounded-xl bg-[#c4b5fd]" />
                </div>
              </div>
            )}

            <iframe
              src="https://www2.elviab2b.de/mawista-booking/index.faces?SPRACHE=EN&PT=MAE&UVM=IB25"
              title="Mawista Expatcare Application Form"
              loading="lazy"
              scrolling="no"
              onLoad={() => setIsLoaded(true)}
              className={`h-full w-full transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
