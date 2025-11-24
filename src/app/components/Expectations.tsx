"use client";

import { motion } from "framer-motion";

const cards = [
  {
    title: "Peace Of Mind",
    description:
      "Rest easy with comprehensive health insurance that protects you and your family against unexpected medical and other expenses.",
    image: "/contact/Mind.png",
    bg: "from-[#0F1535] to-[#1F255C]",
  },
  {
    title: "Tailored Cover",
    description:
      "Choose from a variety of customizable plans designed to fit your unique needs. With InsurBe, you get coverage that’s as individual as you are.",
    image: "/contact/Tailored.png",
    bg: "from-[#7847E1] to-[#9B4DDF]",
  },
  {
    title: "Set For Life",
    description:
      "Our health insurance plans provide long-term financial security, ensuring that you’re covered for any medical needs throughout your life.",
    image: "/contact/SetLife.png",
    bg: "from-[#6D98EB] to-[#D59EFF]",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function Expectations() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-16 px-4 md:px-10 lg:px-20 bg-gradient-to-br from-white to-[#fdf3ff]"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-start text-gray-900 mb-2 px-2">
            We Actively Strive To Exceed Our <br /> Customers’{" "}
            <span className="text-primary">Expectations</span>
          </h2>
          <p className="text-start text-black text-sm sm:text-base mt-2 px-2">
            Best Offers at competitive prices, never seen before
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              whileHover={{ scale: 1.03 }}
              className="relative flex flex-col justify-between w-full h-[396px] p-6 rounded-[16px] shadow-[0.5px_2px_20px_rgba(0,0,0,0.12)] overflow-hidden"
              style={{
                backgroundImage: `url(${card.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 z-0 opacity-0"></div>
              <div className="relative z-10 text-white flex flex-col justify-between h-full pr-6">
                <h3 className="text-2xl font-semibold">{card.title}</h3>
                <p className="text-md">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
