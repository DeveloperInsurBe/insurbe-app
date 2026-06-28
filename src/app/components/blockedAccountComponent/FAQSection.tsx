"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ContactModal from "./ContactModal";

const faqs = [
  {
    q: "What is a blocked account and why is it required?",
    a: "A blocked account is a special bank account required for international students in Germany.",
  },
  {
    q: "Who needs to open a blocked account?",
    a: "Most non-EU students and visa applicants are required to open a blocked account.",
  },
  {
    q: "How can I open a blocked account with Pluro?",
    a: "You can apply online in just a few steps.",
  },
  {
    q: "How long does it take to receive confirmation?",
    a: "Usually within a few business days.",
  },
  {
    q: "Can I open an account without being a student?",
    a: "Yes, depending on your visa type.",
  },
  {
    q: "Is health insurance required?",
    a: "Yes, it is mandatory for visa approval.",
  },
  {
    q: "What happens after I arrive in Germany?",
    a: "You can start withdrawing your monthly allowance.",
  },
  {
    q: "Can I get a refund if my visa is rejected?",
    a: "Yes, refunds are possible with proof.",
  },
  {
    q: "How can I contact support?",
    a: "Via email or phone anytime.",
  },
];

// 🔥 ANIMATION VARIANTS
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function FAQSection() {
  const [active, setActive] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <section className="w-full bg-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">

          {/* 🔥 HEADING */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-gray-800"
            >
              Frequently Asked Questions
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-gray-600 max-w-2xl"
            >
              Find answers to common questions about blocked accounts and visa requirements.
            </motion.p>
          </motion.div>

          {/* 🔥 FAQ LIST */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-10 space-y-4"
          >
            {faqs.map((item, index) => {
              const isOpen = active === index;

              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setActive(isOpen ? null : index)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left"
                  >
                    <span className="font-medium text-gray-800">
                      {item.q}
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      className="text-primary text-xl"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-4 text-gray-600 text-sm overflow-hidden"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* 🔥 CONTACT BLOCK */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-14 text-left"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              Still have questions?
            </h3>

            <p className="text-gray-600 mt-2">
              Our team is here to help you anytime.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setOpenModal(true)}
              className="mt-4 bg-primary hover:hover:bg-primary-dark  text-white px-6 py-3 rounded-lg shadow"
            >
              Contact Us
            </motion.button>
          </motion.div>

        </div>
      </section>

      {/* 🔥 MODAL */}
      <ContactModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}