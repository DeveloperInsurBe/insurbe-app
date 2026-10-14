"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, CalendarClock, Globe2, ShieldCheck } from "lucide-react";

const STATS = [
  { icon: CalendarClock, label: "Stays up to 5 years" },
  { icon: Globe2, label: "Germany & Schengen" },
  { icon: ShieldCheck, label: "Booked directly with HanseMerkur" },
];

export default function IncomingHero() {
  const reduceMotion = useReducedMotion();

  const scrollToProducts = () =>
    document.getElementById("incoming-products")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-8 sm:pt-16 lg:px-18">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-6"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            InsurBe • Visa Seekers
          </motion.span>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Health insurance for your
            <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              stay in Germany
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="max-w-xl text-base text-gray-600 sm:text-lg"
          >
            Visa, studies, au pair or a long visit – choose the right travel health insurance from our partner{" "}
            <span className="font-semibold text-gray-900">HanseMerkur</span> and book it online in a few minutes.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={scrollToProducts}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-primary/25 transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Find my insurance
              <ArrowDown className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>

          <motion.ul
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-wrap gap-x-6 gap-y-3 pt-2"
          >
            {STATS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-gray-600">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl sm:aspect-[5/4] lg:aspect-[7/6]">
            <Image
              src="/hero_assets/visa4.jpg"
              alt="Traveller arriving in Germany"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* partner badge */}
          <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:left-8">
            <div className="relative h-8 w-24">
              <Image src="/partners_asset/hansemerkur.webp" alt="HanseMerkur" fill className="object-contain" sizes="96px" />
            </div>
            <span className="text-xs font-medium text-gray-500">Official partner</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
