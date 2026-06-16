"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Globe, GraduationCap, Briefcase } from "lucide-react";

const plans = [
  {
    title: "InsurBe World Education",
    subtitle: "For students & educational stays abroad",
    icon: GraduationCap,
    points: [
      "For travelers under 30 years of age",
      "Must be taken out before departure",
      "Ideal for studies, au pair & internships",
    ],
    image: "/hero_assets/groupStudent.jpg",
  },
  {
    title: "InsurBe German Traveler",
    subtitle: "For residents of Germany",
    icon: Briefcase,
    points: [
      "Worldwide trips up to 5 years",
      "Must be taken out before departure",
      "Ideal for Work & Travel and long-term stays",
    ],
    image: "/hero_assets/travel4.jpg",
  },
  {
    title: "InsurBe World Traveler",
    subtitle: "For travelers worldwide",
    icon: Globe,
    points: [
      "Can be taken out even after the trip has started",
      "12-month term, renewable",
      "Ideal for backpackers & digital nomads",
    ],
    image: "/hero_assets/travel2.jpg",
  },
];

export default function VisaSeekersInsurance() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-10 lg:px-18">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Whatever trip you are planning,
            <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Insurbe has you covered
            </span>
          </h2>

          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Whether you are planning your journey or already abroad, Insurbe
            provides the right travel health insurance for every kind of stay.
          </p>
        </motion.div>

        {/* Chancenkarte Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div
            className="
      relative overflow-hidden
      rounded-[36px]
      border border-white/60
      bg-gradient-to-br
      from-white
      via-[#faf7ff]
      to-[#f3e8ff]
      shadow-[0_20px_60px_rgba(130,10,209,0.08)]
      backdrop-blur-xl
    "
          >
            {/* BACKGROUND GLOW */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#820ad1]/10 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#c084fc]/10 blur-3xl" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] p-6 md:p-10">
              {/* LEFT */}
              <div>
                {/* ALLIANZ */}
                <div className="inline-flex items-center rounded-2xl border border-[#ede9fe] bg-white px-5 py-3 shadow-sm">
                  <Image
                    src="/partners/allianz.png"
                    alt="Allianz"
                    width={120}
                    height={36}
                    className="h-8 w-auto object-contain"
                    unoptimized
                  />
                </div>

                {/* TITLE */}
                <h3 className="mt-8 text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
                  MAWISTA Expatcare
                </h3>

                <p className="mt-5 max-w-2xl text-[15px] md:text-lg leading-relaxed text-[#667085]">
                  Reliable health insurance coverage for people moving to
                  Germany with the Chancenkarte and similar long-term stays.
                </p>

                {/* TAGS */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    "Expats",
                    "Digital Nomads",
                    "Business Travellers",
                    "Freelancers",
                    "Long-Term Travellers",
                    "World Travellers",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                inline-flex items-center
                rounded-full
                border border-[#e9d5ff]
                bg-white
                px-4 py-2
                text-sm font-medium
                text-[#4b5563]
                shadow-sm
              "
                    >
                      <span className="mr-2 h-2 w-2 rounded-full bg-[#820ad1]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center justify-center">
                <div
                  className="
            relative w-full max-w-[340px]
            rounded-[32px]
            bg-white/80
            backdrop-blur-xl
            border border-white/60
            p-8
            shadow-[0_20px_50px_rgba(130,10,209,0.10)]
          "
                >
                  {/* FLOATING PRICE */}
                  <div
                    className="
              absolute -top-5 right-6
              rounded-full
              bg-gradient-to-r
              from-[#820ad1]
              to-[#a855f7]
              px-5 py-2
              text-white
              shadow-lg
            "
                  >
                    <span className="text-xs uppercase tracking-wider">
                      Starting From
                    </span>
                  </div>

                  {/* MAWISTA */}
                  <div className="flex justify-center">
                    <Image
                      src="/partners_asset/mawista.svg"
                      alt="MAWISTA"
                      width={180}
                      height={48}
                      className="h-12 w-auto object-contain"
                      unoptimized
                    />
                  </div>

                  {/* PRICE */}
                  <div className="mt-8 text-center">
                    <div className="text-sm font-medium text-[#667085]">
                      Monthly Premium
                    </div>

                    <div className="mt-2">
                      <span className="text-5xl font-black text-[#111827]">
                        €75
                      </span>
                    </div>
                  </div>

                  {/* APPLY BUTTON */}
                  <Link
                    href="/mawistaExpatcare"
                    className="
              mt-8 flex h-14 w-full items-center justify-center
              rounded-2xl
              bg-gradient-to-r
              from-[#820ad1]
              to-[#a855f7]
              text-sm font-bold text-white
              shadow-lg
              transition-all duration-300
              hover:translate-y-[-2px]
              hover:shadow-[0_15px_35px_rgba(130,10,209,0.30)]
            "
                  >
                    Apply Now
                  </Link>

                  {/* TRUST TEXT */}
                  <p className="mt-4 text-center text-xs text-[#98A2B3]">
                    Trusted coverage for international residents in Germany
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Insurance Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={plan.image}
                    alt={plan.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-500">{plan.subtitle}</p>
                    </div>
                  </div>

                  <ul className="mb-6 space-y-2 text-sm text-gray-700">
                    {plan.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="font-bold text-primary">&#10003;</span>
                        {p}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-3">
                    <div className="w-full cursor-not-allowed rounded-full bg-gray-100 py-3 text-center font-semibold text-gray-500">
                      Coming soon
                    </div>

                    <div className="w-full rounded-full border border-primary py-3 text-center font-semibold text-primary">
                      Learn more
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mx-auto mt-16 max-w-2xl text-center text-gray-500">
          Not sure which travel health insurance fits your journey? Our upcoming
          overview will help you choose the right coverage wherever life takes
          you.
        </p>
      </div>
    </section>
  );
}
