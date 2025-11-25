"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ChooseUs() {
  const reasons = [
    {
      title: "Health Insurance",
      desc: "Generic text to outline the benefits of Insurbe and the particular feature.",
      icon: "/insurance/student.svg",
    },
    {
      title: "Private Pension Scheme",
      desc: "Generic text to outline the benefits of Insurbe and the particular feature.",
      icon: "/insurance/pension1.svg",
    },
    {
      title: "Liability Insurance",
      desc: "Generic text to outline the benefits of Insurbe and the particular feature.",
      icon: "/insurance/liability1.svg",
    },
    {
      title: "Household Insurance",
      desc: "Generic text to outline the benefits of Insurbe and the particular feature.",
      icon: "/insurance/house1.svg",
    },
    {
      title: "Legal Insurance",
      desc: "Generic text to outline the benefits of Insurbe and the particular feature.",
      icon: "/insurance/legal1.svg",
    },
    {
      title: "Travel Insurance",
      desc: "Generic text to outline the benefits of Insurbe and the particular feature.",
      icon: "/insurance/travel1.svg",
    },
  ];

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 px-4 md:px-10 lg:px-20 bg-gradient-to-br from-white to-[#fdf3ff] overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-10">
          Explore our range of Insurance Products
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-full"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {reasons.map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{
                backgroundColor: "#ffffff",
                borderColor: "#A970D7",
                transition: {
                  backgroundColor: { duration: 1.7, ease: "easeInOut" },
                  borderColor: { duration: 1.7, ease: "easeInOut" },
                },
              }}
              className="bg-gray-100/60 px-10 lg:px-16 py-8 backdrop-blur-md cursor-pointer rounded-xl text-center border-2 border-transparent transition-all ease-in-out"
            >
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-white rounded-md shadow-sm">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl text-black">{item.title}</h3>
              <p className="text-lg text-black mt-4 leading-6">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
