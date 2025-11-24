"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import ServiceModal from "./ServiceModal";
import { useState } from "react";
import PrivateHealthModal from "./PrivateHealthModal";
import PublicHealthTabbedModal from "./PublicHealthModal";

const plans = [
  {
    key: "public",
    title: "Public (GKV)",
    price: "€800+",
    features: [
      "Covers dependents",
      "No Digital signup",
      "Accepted for visa",
      "Limited Customization",
    ],
    accent: "text-purple-700",
  },
  {
    key: "private",
    title: "Full Private (PKV)",
    price: "€400",
    features: [
      "Optional Dependents Coverage",
      "Digital signup",
      "Accepted for visa",
      "Basic Analytics",
    ],
    accent: "text-purple-700",
  },
  {
    key: "expat",
    title: "Expat Private",
    price: "€200",
    features: [
      "No Dependents Coverage",
      "Digital signup",
      "Accepted for visa",
      "Theme customization",
    ],
    accent: "text-purple-700",
  },
];

// Variants for card container
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

// Variants for child elements inside card (text, button, image)
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function OurServices() {
  const [showModal, setShowModal] = useState(false);
  const [openModal, setOpenModal] = useState<null | "public" | "private">(null);

  return (
    <section className="bg-gradient-to-br from-[#f5f0ff] to-[#fefcfc] py-6 px-4 md:px-16 ">
      <div className="max-w-6xl mx-auto text-center">
        <span className="inline-block bg-white border border-gray-200 px-4 py-1 rounded-full text-xs font-medium text-gray-500 mb-4">
          Unbreakable Quality
        </span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-black mb-3"
        >
          Affordable Excellence
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-base md:text-lg mb-12"
        >
          Comparing with the best Insurance, start experiencing our services
          today
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 ">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="relative group rounded-xl p-6 hover:bg-white hover:shadow-lg flex flex-col justify-between cursor-pointer"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.15 }}
            >
              {/* Image */}
              <motion.div
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition duration-300"
                variants={itemVariants}
              >
                <Image src="/img/people.png" alt="img" height={54} width={54} />
              </motion.div>

              <motion.div className="text-left" variants={itemVariants}>
                <motion.h4
                  className={`text-sm font-medium ${plan.accent} mb-2`}
                  variants={itemVariants}
                >
                  {plan.title}
                </motion.h4>
                <motion.p
                  className="text-3xl font-bold mb-1"
                  variants={itemVariants}
                >
                  {plan.price}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </motion.p>

                <motion.p
                  className="font-semibold text-sm mt-6 mb-4"
                  variants={itemVariants}
                >
                  What’s included:
                </motion.p>

                <motion.ul
                  className="space-y-2 text-sm text-gray-700"
                  variants={itemVariants}
                >
                  {plan.features.map((item) => (
                    <motion.li key={item} variants={itemVariants}>
                      ✨ {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div
                className="mt-6 flex justify-center"
                variants={itemVariants}
              >
                <button
                  onClick={() => {
                    if (plan.key === "public") setOpenModal("public");
                    if (plan.key === "private") setOpenModal("private");
                  }}
                  className="w-full py-2 px-4 border border-gray-300 text-black rounded-md transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:border-[#c59eec]"
                >
                  Get Started
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <ServiceModal open={showModal} onClose={() => setShowModal(false)} />
        {/* Modals */}
        <PublicHealthTabbedModal
          open={openModal === "public"}
          onClose={() => setOpenModal(null)}
        />
        <PrivateHealthModal
          open={openModal === "private"}
          onClose={() => setOpenModal(null)}
        />
      </div>
    </section>
  );
}
