"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Timer, ShieldCheck, UserCheck, Building2, Shield } from "lucide-react";

export default function AboutSectionnew() {
  const features = [
    {
      icon: Shield,
      title: "Tailor-made insurance plans",
      description: "Customizable insurance policies",
    },
    {
      icon: Building2,
      title: "Range of reputable insurers",
      description: "Leaders and innovators in the insurance industry",
    },
    {
      icon: Timer,
      title: "Fast claim processing",
      description: "Professional support for claim and renewal assistance",
    },
    {
      icon: UserCheck,
      title: "Specialised guidance",
      description: "Experts to offer pre- and post-purchase assistance",
    },
    {
      icon: ShieldCheck,
      title: "Dependable insurance provider",
      description: "Choose from insurance brands you can trust on",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative md:pb-16 pb-10 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* LEFT SIDE - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            {/* Purple accent line */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 60 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full mb-6"
            />

            {/* Header */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Putting Customers
              <br />
              At The Heart Of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700">
                Everything We Do
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              Best Offers at competitive prices, never seen before
            </p>

            {/* Features List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    className="group flex items-center gap-3 rounded-[22px] border border-[#ece7f6] bg-white/60 px-3 py-2 shadow-[0_8px_24px_rgba(130,10,209,0.05)] hover:shadow-[0_14px_30px_rgba(130,10,209,0.10)] transition-all duration-300"
                  >
                    {/* Icon Circle */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* DIVIDER */}
                    <div className="hidden sm:block h-10 w-[1px] bg-[#ece7f6]" />

                    {/* Text */}
                    <div className="flex-1 pt-1">
                      <h3 className="text-md sm:text-md font-medium text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-[12px] text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end order-1 lg:order-2"
          >
            {/* BACK LAYER */}
            <div className="absolute top-8 right-0 w-full max-w-[480px] aspect-[4/4.5] rounded-[38px] bg-gradient-to-br from-[#820ad1]/20 to-[#c084fc]/10 border border-[#e9d5ff]/40 rotate-[5deg]" />

            {/* MIDDLE LAYER */}
            <div className="absolute -bottom-5 left-3 w-full max-w-[480px] aspect-[4/4.5] rounded-[38px] bg-gradient-to-tr from-[#f3e8ff] to-[#ffffff] border border-[#f3e8ff] rotate-[-4deg] shadow-xl" />

            {/* MAIN IMAGE CARD */}
            <div className="relative z-10 w-full max-w-[500px]">
              <div className="relative rounded-[40px] p-[3px] bg-gradient-to-br from-[#820ad1] via-[#c084fc] to-[#f3e8ff] shadow-[0_30px_70px_rgba(130,10,209,0.16)]">
                <div className="relative overflow-hidden rounded-[36px] bg-white aspect-[4/4.6]">
                  <Image
                    src="/hero_assets/insurance.jpeg"
                    alt="Customers"
                    fill
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
