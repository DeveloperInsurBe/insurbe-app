"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Timer,
  ShieldCheck,
  UserCheck,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { ICON_BG } from "@/app/constants/styles";

export default function AboutSectionnew() {
  const features = [
    {
      icon: SlidersHorizontal,
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
    <section className="relative md:pb-16 pb-10 px-4 sm:px-8 lg:px-18 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-6 sm:mb-0"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            We Actively Strive To Exceed Our <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
              {" "}
              Customers' Expectations
            </span>
          </h2>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
            Best Offers at competitive prices, never seen before
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12  items-start lg:items-center">
          {/* Left Side - Features List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-2 lg:order-1 "
          >
            <div className="space-y-4 sm:space-y-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 10, transition: { duration: 0.2 } }}
                    className="flex items-start gap-3 sm:gap-4 group"
                  >
                    {/* Icon */}

                    <div
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full ${ICON_BG} shadow-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-100 " />{" "}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="text-base sm:text-[20px] font-medium text-gray-800 mb-0.5 sm:mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-[16px] text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Side - Square Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full order-1 lg:order-2"
          >
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-4/4 rounded-3xl overflow-hidden shadow-2xl mx-auto">
              <Image
                src="/hero_assets/insurance.jpeg"
                alt="Team Member"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 40vw"
              />
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 bg-primary/20 rounded-full blur-2xl sm:blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
