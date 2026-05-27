"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Plane,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Scale,
  Gavel,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

interface CardItem {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
  features: string[];
  cta: string;
  href: string;
  image: string;
}

const cards: CardItem[] = [
  {
    title: "Public Health Insurance",
    subtitle: "Essential coverage for Germany",
    badge: "Most Popular",
    badgeColor: "#820ad1",
    icon: ShieldCheck,
    features: [
      "Legally compliant coverage",
      "Meets residency requirements",
      "Trusted public healthcare access",
    ],
    cta: "Learn more now →",
    href: "/insurance/public-health",
    image: "/hero_assets/docto.jpg",
  },
  {
    title: "Private Health Insurance",
    subtitle: "Tailored premium protection",
    badge: "Private customers",
    badgeColor: "#820ad1",
    icon: HeartPulse,
    features: [
      "Enhanced medical benefits",
      "Personalized coverage options",
      "Faster healthcare access",
    ],
    cta: "Explore plans →",
    href: "/insurance/private-health",
    image: "/hero_assets/doctorsconusltation.png",
  },
  {
    title: "Travel Insurance",
    subtitle: "Protection wherever you go",
    badge: "Worldwide coverage",
    badgeColor: "#820ad1",
    icon: Plane,
    features: [
      "Worldwide travel protection",
      "Emergency assistance",
      "Stress-free journeys",
    ],
    cta: "Explore plans →",
    href: "/products/visaSeakers",
    image: "/hero_assets/visaSeakers.avif",
  },
  {
    title: "Private Pension Scheme",
    subtitle: "Plan your future smarter",
    badge: "Long-term security",
    badgeColor: "#820ad1",
    icon: TrendingUp,
    features: [
      "Build retirement savings",
      "Long-term financial security",
      "Flexible contribution plans",
    ],
    cta: "Start planning →",
    href: "/products/pensionProducts",
    image: "/hero_assets/Retirement.avif",
  },
  {
    title: "Liability Insurance",
    subtitle: "Protection for everyday life",
    badge: "Personal protection",
    badgeColor: "#820ad1",
    icon: Scale,
    features: [
      "Personal liability protection",
      "Coverage against claims",
      "Peace of mind every day",
    ],
    cta: "View coverage →",
    href: "/products/privateProducts",
    image: "/hero_assets/home.avif",
  },
  {
    title: "Legal Insurance",
    subtitle: "Expert legal support",
    badge: "Legal assistance",
    badgeColor: "#820ad1",
    icon: Gavel,
    features: [
      "Professional legal guidance",
      "Coverage for legal costs",
      "Support when it matters most",
    ],
    cta: "Learn more →",
    href: "/products/privateProducts",
    image: "/hero_assets/car.avif",
  },
];

export default function ChooseUs() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -380,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 380,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="explore"
      className="relative overflow-hidden bg-white pb-16 px-4 sm:px-8 lg:px-16 "
    >
     
      <div className="relative mx-auto max-w-7xl ">
        {/* badge */}
        <div className="mb-5 flex justify-center">
          <div className="rounded-full border border-primary/10 bg-white/80 px-4 py-2 backdrop-blur-xl">
            <span className="text-xs font-semibold text-primary">
              Trusted • Compliant • Reliable
            </span>
          </div>
        </div>

        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-[30px] font-black leading-tight tracking-[-1px] text-[#0f172a] sm:text-[42px] lg:text-[52px]">
            Insurance solutions{" "}
            <span className="bg-gradient-to-r from-primary to-[#9f3cff] bg-clip-text text-transparent">
              for every stage of life
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-[680px] text-[16px] leading-relaxed text-[#667085]">
            Comprehensive coverage. Legally compliant. Trusted by millions in
            Germany.
          </p>
        </motion.div>

        {/* arrows */}
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={scrollLeft}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/80 shadow-[0_8px_30px_rgba(130,10,209,0.12)] backdrop-blur-xl transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>

          <button
            onClick={scrollRight}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/80 shadow-[0_8px_30px_rgba(130,10,209,0.12)] backdrop-blur-xl transition-all duration-300 hover:scale-105"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* slider */}
        <div
          ref={sliderRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        >
          {cards.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="min-w-[85%] snap-start sm:min-w-[45%] lg:min-w-[30%]"
              >
                <Link href={item.href} className="block h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/40 bg-white/80 shadow-[0_10px_40px_rgba(130,10,209,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_18px_60px_rgba(130,10,209,0.18)]">
                    {/* image */}
                    <div className="relative h-[210px] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                      {/* <div className="absolute left-4 top-4">
                        <span
                          className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white shadow-lg"
                          style={{
                            backgroundColor: item.badgeColor,
                          }}
                        >
                          {item.badge}
                        </span>
                      </div> */}
                    </div>

                    {/* content */}
                    <div className="flex flex-1 flex-col p-5 bg-primary/10">
                      {/* title */}
                      <div className="mb-4 flex items-start gap-3">
                        {/* <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3e8ff] to-[#f8f1ff]">
                          <Icon className="h-5 w-5 text-primary" />
                        </div> */}

                        <div>
                          <h3 className="text-[20px] font-black leading-tight text-[#0f172a]">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-[13px] text-[#667085]">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* features */}
                      <ul className="mb-6 space-y-2">
                        {item.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[14px] leading-relaxed text-[#475467]"
                          >
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* button */}
                      <div className="mt-auto">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9f3cff] px-4 py-2.5 text-[14px] font-bold text-white shadow-lg transition-all duration-300 group-hover:gap-3">
                          {item.cta}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
