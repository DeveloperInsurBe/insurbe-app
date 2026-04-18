"use client";

import { motion } from "framer-motion";
import { Settings, Eye, Handshake } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Settings,
      title: "Technology driven",
      description: "We use technology to make insurance simple and accessible.",
      iconColor: "text-indigo-600",
      bg: "from-indigo-100 to-indigo-50",
      glow: "hover:shadow-indigo-300/50",
    },
    {
      icon: Eye,
      title: "Transparent pricing",
      description: "No hidden costs, just clear and honest pricing.",
      iconColor: "text-amber-600",
      bg: "from-amber-100 to-amber-50",
      glow: "hover:shadow-amber-300/50",
    },
    {
      icon: Handshake,
      title: "Customer first",
      description: "We put our customers at the heart of everything we do.",
      iconColor: "text-emerald-600",
      bg: "from-emerald-100 to-emerald-50",
      glow: "hover:shadow-emerald-300/50",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative md:py-16 py-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center text-center transition-all"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`mb-6 p-5 rounded-2xl bg-gradient-to-br ${feature.bg} shadow-md ${feature.glow} hover:shadow-xl`}
              >
                <Icon
                  className={`w-12 h-12 ${feature.iconColor}`}
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xs">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
