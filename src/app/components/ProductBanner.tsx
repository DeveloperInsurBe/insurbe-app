"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { INSURANCE_LIMITS } from "../constants/insurance";

const products = [
  {
    title: "Working\nProfessionals",
    desc: `PKV or Expat Insurance if you earn above €${INSURANCE_LIMITS.PKV_INCOME_THRESHOLD.toLocaleString()} annually.`,
    link: "/products/privateProducts",
    badge: "EXPAT CHOICE",
    img: "/hero_assets/workin.jpeg",
  },
  {
    title: "Family\nCoverage",
    desc: "Private or public plans that cover you and your loved ones together.",
    link: "/products/pensionProducts",
    badge: "POPULAR",
    img: "/hero_assets/hero4.png",
  },
  {
    title: "Visa\nSeekers",
    desc: "Get valid insurance for your visa and residence permit approval.",
    link: "/products/visaSeakers",
    badge: "ESSENTIAL",
    img: "/hero_assets/travel4.jpg",
  },
  {
    title: "Students\n& Interns",
    desc: "Affordable, government-approved student plans in Germany.",
    link: "/products/students",
    badge: "AFFORDABLE",
    img: "/contact_assets/contact5.png",
  },
];

export default function ProductBanner() {
  return (
    <section className="pb-16 pt-6 px-6 lg:px-20 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12"
        >
          <div>
            <p className="text-sm tracking-widest text-purple-500 mb-3">
              CURATED PLANS
            </p>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Perfect plans for people <br />
              traveling to Germany
            </h2>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={item.link}>
                <div className="rounded-3xl overflow-hidden bg-white shadow-lg group cursor-pointer">
                  {/* Image Section */}
                  <div className="relative h-56">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs text-white font-semibold">
                      {item.badge}
                    </div>

                    {/* Title */}
                    <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold whitespace-pre-line">
                      {item.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
                      Explore Plans
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
