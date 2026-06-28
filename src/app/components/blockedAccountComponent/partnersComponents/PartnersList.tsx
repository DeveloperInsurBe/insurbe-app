"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { ExternalLink, CheckCircle2, Users, Globe, Shield } from "lucide-react";

const partners = [
  {
    name: "AOK",
    logo: "/partners_assets/aok.webp",
    desc: "AOK is one of the biggest and most popular health insurance companies in Germany with over 27 million policyholders. For over 100 years, they have been providing their members with the best medical care in the event of illness.",
    members: "27M+",
    features: ["100+ years experience", "Comprehensive coverage", "Digital services"],
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "BARMER",
    logo: "/partners_assets/barmer.webp",
    desc: "BARMER is one of the largest and most respected public health insurance providers in Germany with around 8.5 million members. They offer digital services and international support.",
    button: "About BARMER",
    members: "8.5M+",
    features: ["International support", "Digital-first", "Premium services"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "DAK",
    logo: "/partners_assets/dakk.webp",
    desc: "DAK Gesundheit is one of the largest health insurances in Germany with more than 5 million policyholders. It provides additional benefits beyond legal minimums.",
    members: "5M+",
    features: ["Extra benefits", "Family coverage", "24/7 support"],
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Techniker Krankenkasse (TK)",
    logo: "/partners_assets/tk.webp",
    desc: "Techniker Krankenkasse (TK) is the largest health insurer in Germany with about 10.4 million members. It offers English support and digital tools.",
    button: "About TK",
    members: "10.4M+",
    features: ["Largest insurer", "English support", "Advanced digital tools"],
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "ERGO",
    logo: "/partners_assets/ergo.webp",
    desc: "ERGO is a leading provider for private health insurance and operates in over 30 countries worldwide.",
    members: "30+ countries",
    features: ["Private insurance", "Global coverage", "Premium plans"],
    color: "from-orange-500 to-red-600",
  },
  {
    name: "CARECONCEPT",
    logo: "/partners_assets/care.webp",
    desc: "CareConcept provides international health insurance for short to mid-term stays abroad along with travel assistance and liability coverage.",
    members: "International",
    features: ["Travel insurance", "Liability coverage", "Short-term stays"],
    color: "from-violet-500 to-purple-600",
  },
  
];

export default function PartnersList() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-sm font-semibold mb-4">
            Featured Partners
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Leading{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Insurance Providers
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've partnered with Germany's most trusted insurance companies to bring you the best coverage options
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="group relative"
            >
              <div className="relative h-full bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 hover:border-transparent hover:shadow-2xl">
                {/* Gradient Border on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px] rounded-2xl`}
                >
                  <div className="absolute inset-[2px] bg-white rounded-2xl" />
                </div>

                {/* Content */}
                <div className="relative p-6 flex flex-col h-full">
                  {/* Logo Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative w-32 h-16 flex items-center">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={120}
                        height={60}
                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    
                    {/* Member Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                      className={`px-3 py-1 rounded-full bg-gradient-to-r ${partner.color} text-white text-xs font-semibold flex items-center gap-1`}
                    >
                      <Users className="w-3 h-3" />
                      {partner.members}
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-purple-600 transition-all duration-300">
                    {partner.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                    {partner.desc}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {partner.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <CheckCircle2 className={`w-4 h-4 bg-gradient-to-r ${partner.color} bg-clip-text text-transparent`} />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Button */}
                  {partner.button && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 rounded-xl bg-gradient-to-r ${partner.color} text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      {partner.button}
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  )}

                  {partner.button === undefined && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:border-violet-400 hover:text-violet-600 transition-all duration-300"
                    >
                      Learn More
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Hover Glow Effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${partner.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Shield, value: "7+", label: "Trusted Partners" },
            { icon: Users, value: "50M+", label: "Combined Members" },
            { icon: Globe, value: "30+", label: "Countries Covered" },
            { icon: CheckCircle2, value: "100%", label: "Verified Coverage" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 hover:border-violet-300 transition-all duration-300"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </h4>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </section>
  );
}