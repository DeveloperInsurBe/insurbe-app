"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Car,
  ShieldCheck,
  PersonStanding,
  TrendingUp,
  Plane,
} from "lucide-react";
import Link from "next/link";

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
    title: "Retirement Provision",
    subtitle: "Our solutions for you",
    badge: "Private customers",
    badgeColor: "#22c55e",
    icon: Users,
    features: [
      "Products related to your retirement savings",
      "Individual insurance",
      "Survivor's benefits",
    ],
    cta: "Learn more now →",
    href: "/products/pensionProducts",
    image:
      "hero_assets/Retirement.avif",
  },
  {
    title: "Car Insurance for Private Customers",
    subtitle: "Switch to HDI car insurance now",
    badge: "Private customers",
    badgeColor: "#22c55e",
    icon: Car,
    features: [
      "Fair prices",
      "24-hour telephone service in case of damage",
      "Over 100 years of experience",
    ],
    cta: "Calculate now →",
    href: "/insurance/car",
    image:
      "hero_assets/car.avif",
  },
  {
    title: "Liability Insurance",
    subtitle: "Our insurance solutions for liability insurance",
    badge: "Private & Business customers",
    badgeColor: "#22c55e",
    icon: ShieldCheck,
    features: [
      "Private liability insurance",
      "Pet owner's liability insurance",
      "Special liability insurance",
    ],
    cta: "Calculate now →",
    href: "/products/privateProducts",
    image:
      "hero_assets/home.avif",
  },
  {
    title: "Accident Insurance",
    subtitle: "It secures everyday life. And other adventures.",
    badge: "Private customers",
    badgeColor: "#22c55e",
    icon: PersonStanding,
    features: [
      "Flexible package solutions",
      "Worldwide insurance coverage",
      "One-time capital payment",
    ],
    cta: "Learn more now →",
    href: "/products/privateProducts",
    image:
      "hero_assets/privateProducts.avif",
  },
  {
    title: "Unit-linked Pension",
    subtitle: "CleverInvest – The solution for your retirement savings",
    badge: "Private customers",
    badgeColor: "#22c55e",
    icon: TrendingUp,
    features: [
      "Products related to your retirement savings",
      "Individual insurance",
      "Flexible building blocks",
    ],
    cta: "Request product →",
    href: "/products/pensionProducts",
    image:
      "hero_assets/pensionProducts.avif",
  },
  {
    title: "Travel Insurance",
    subtitle: "Protection that moves with you, wherever your journey takes you.",
    badge: "Private customers",
    badgeColor: "#22c55e",
    icon: Plane,
    features: [
      "Worldwide coverage",
      "Trip protection",
      "24/7 assistance",
    ],
    cta: "Learn more now →",
    href: "/products/visaSeakers",
    image:
      "hero_assets/visaSeakers.avif",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ChooseUs() {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">

        {/* Trust badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-indigo-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            Trusted. Compliant. Reliable.
          </div>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Insurance solutions{" "}
            <span className="text-indigo-600">for every stage of life</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg">
            Comprehensive coverage. Legally compliant. Trusted by millions in Germany.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.map((item: CardItem, idx: number) => {
            const Icon = item.icon;
            return (
              <motion.div key={idx} variants={cardVariant}>
                <Link href={item.href} className="block h-full">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">

                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span
                          className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                          style={{ backgroundColor: item.badgeColor }}
                        >
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Icon + Title */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-1.5 mb-4 flex-1">
                        {item.features.map((feature: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <svg
                              className="flex-shrink-0 w-4 h-4 text-indigo-500 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        {item.cta}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}