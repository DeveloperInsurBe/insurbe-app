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
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full flex justify-center items-center"
          style={{ height: "clamp(400px, 54vw, 650px)" }}
        >
          {/* BIG PURPLE GLOW */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-[88%] h-[88%] rounded-[70px] bg-gradient-to-br from-[#820ad1]/20 via-[#c084fc]/15 to-transparent blur-[90px]" />
          </div>

          {/* BACK SHADE LAYER */}
          <div
            className="absolute z-0 hidden lg:block"
            style={{
              width: "92%",
              height: "92%",
              maxWidth: "560px",
              borderRadius: "48px",
              background:
                "linear-gradient(135deg, rgba(130,10,209,0.16), rgba(192,132,252,0.08))",
              border: "1px solid rgba(192,132,252,0.18)",
              transform: "rotate(6deg)",
              top: "10px",
              right: "-5px",
              backdropFilter: "blur(10px)",
            }}
          />

          {/* FRONT SHADE LAYER */}
          <div
            className="absolute z-0 hidden lg:block"
            style={{
              width: "92%",
              height: "92%",
              maxWidth: "560px",
              borderRadius: "48px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(243,232,255,0.7))",
              border: "1px solid rgba(255,255,255,0.7)",
              transform: "rotate(-5deg)",
              bottom: "5px",
              left: "-5px",
              boxShadow: "0 30px 60px rgba(130,10,209,0.08)",
            }}
          />

          {/* MAIN IMAGE CONTAINER */}
          <div
            className="relative z-10 overflow-hidden"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "560px",
              borderRadius: "46px",
              background:
                "linear-gradient(135deg, #820ad1 0%, #c084fc 45%, #ffffff 100%)",
              padding: "3px",
              boxShadow: "0 35px 90px rgba(130,10,209,0.18)",
            }}
          >
            {/* INNER IMAGE */}
            <div
              className="relative w-full h-full overflow-hidden bg-white"
              style={{ borderRadius: "42px" }}
            >
              <Image
                src="/hero_assets/privatehero.jpg"
                alt="Private Health Insurance"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />

              {/* DARK OVERLAY */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(15,0,25,0.22), transparent 45%)",
                }}
              />

              {/* PURPLE LIGHT SHADE */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(130,10,209,0.10), transparent 40%, rgba(255,255,255,0.05))",
                }}
              />
            </div>
          </div>

          {/* TOP DOTS */}
          <div className="absolute top-2 left-20 hidden lg:grid grid-cols-5 gap-3 z-20">
            {[...Array(15)].map((_, i) => (
              <span
                key={i}
                className="w-[6px] h-[6px] rounded-full bg-[#d8b4fe]"
              />
            ))}
          </div>

          {/* SIDE PURPLE LIGHT */}
          <div
            className="absolute z-0"
            style={{
              top: "25%",
              left: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "999px",
              background: "rgba(192,132,252,0.22)",
              filter: "blur(70px)",
            }}
          />

          {/* BOTTOM PURPLE LIGHT */}
          <div
            className="absolute z-0"
            style={{
              bottom: "-20px",
              right: "15%",
              width: "240px",
              height: "120px",
              borderRadius: "999px",
              background: "rgba(130,10,209,0.20)",
              filter: "blur(70px)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
