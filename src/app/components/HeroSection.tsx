"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2 + 0.6,
      type: "spring",
      stiffness: 100,
    },
  }),
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1.2, type: "spring", stiffness: 120 },
  },
};

export default function HeroSectionTop() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-white to-[#eed5f3] px-4 md:px-10 lg:px-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between w-full gap-12 mt-32">
        {/* Left Content */}
        <div className="text-left max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="text-3xl sm:text-3xl lg:text-4xl font-bold text-black font-jost"
          >
            Unlock the Best Insurance Solutions in Germany with Ease
          </motion.h1>

          <motion.ul
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-3 text-black text-base font-lexend"
          >
            {[
              "For Students, Professionals and Families moving to Germany",
              "From health and liability to legal and pension coverage",
              "Best options tailored to your unique needs",
            ].map((text, i) => (
              <motion.li
                key={i}
                custom={i}
                variants={listItemVariants}
                className="flex items-center"
              >
                <Image
                  src="/icons/arrow.svg"
                  alt="arrow"
                  width={16}
                  height={16}
                />
                <span className="ml-2">{text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={buttonVariants}
            className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/95 transition"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-purple-50 transition"
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>

        {/* Right Visual Section */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="relative w-full max-w-lg min-h-[530px] mx-auto flex items-center justify-center"
        >

          {/* Dotted Line Background (static, no animation) */}
          <Image
            src="/img/vector.png"
            alt="Dotted Line Background"
            width={520}
            height={220}
            className="absolute inset-0 z-0 pointer-events-none w-[520px] h-[220px] left-[20px] top-[80px]"
            draggable={false}
          />

          {/* Center - Main Insurbe Logo (static) */}
          <Image
            src="/img/whiteLogo.svg"
            alt="InsurBe"
            width={200}
            height={86}
            className="absolute left-3/5 top-[120px] -translate-x-1/2 z-20 pointer-events-none"
            draggable={false}
          />

          {/* Shivani Chauhan Card - floats */}
          <motion.div
            animate={{ y: [0, -16, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[50px] right-30 z-30 object-contain"
          >
            <Image
              src="/img/label2.png"
              alt="Shivani Chauhan Profile"
              width={350}
              height={64}
              draggable={false}
            />
          </motion.div>

          {/* "June 2024" Card - floats */}
          <motion.div
            animate={{ y: [0, -14, 0], rotate: [0, 1, -1, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-22 top-[24px] z-30 object-contain"
          >
            <Image
              src="/img/label1.png"
              alt="June 2024 Statistic"
              width={240}
              height={74}
              draggable={false}
            />
          </motion.div>

          {/* Donut Chart - floats */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[60px] -left-11 z-20 object-contain"
          >
            <Image
              src="/img/UsersOverview.png"
              alt="Insurance Issued Donut"
              width={280}
              height={162}
              draggable={false}
            />
          </motion.div>

          {/* Daily Issuances - floats */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -1, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-52 right-31 z-30 object-contain"
          >
            <Image
              src="/img/rectangle.png"
              alt="Daily Issuances"
              width={30}
              height={100}
              draggable={false}
            />
          </motion.div>

          {/* Decorative Circle Badge - floats */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 right-3 z-40 object-contain"
          >
            <Image
              src="/img/label3.png"
              alt="Decorative Badge"
              width={300}
              height={154}
              draggable={false}
            />
          </motion.div>

        </motion.div>
      </div>
    </motion.section>
  );
}
