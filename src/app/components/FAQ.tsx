"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Minus, MessageCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Who is InsurBe and what do you do?",
      answer:
        "InsurBe is a Germany-focused insurance platform helping students, professionals, families, and expats find the right health insurance plans that meet legal and visa requirements. We simplify the entire process-from choosing a plan to getting insured.",
    },
    {
      question: "Is InsurBe a licensed insurance provider?",
      answer:
        "InsurBe works with licensed and regulated German insurance partners. All plans offered through our platform comply with German regulations and are accepted by authorities, universities, and employers.",
    },
    {
      question: "How long does it take to get insured through InsurBe?",
      answer:
        "In most cases, applications are processed within 24-48 hours after document submission. Some plans can be activated even faster, depending on eligibility and insurer approval.",
    },
    {
      question: "Can InsurBe help with visa and residence permit requirements?",
      answer:
        "Yes. We offer insurance plans that are fully compliant with German visa and residence permit requirements. Our team ensures you receive valid documentation accepted by embassies and immigration offices.",
    },
    {
      question: "Do I get support after purchasing a plan?",
      answer:
        "Absolutely. InsurBe provides ongoing support even after you are insured. From policy questions to changes in personal circumstances, our team is available to assist you whenever needed.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="text-center mb-7 sm:mb-9"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold mb-3">
            FAQ
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
            Got questions?
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700">
              We've got answers.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about InsurBe and our insurance products
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          viewport={{ once: true }}
          className="space-y-2.5"
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-4.5 text-left hover:bg-purple-50/50 transition-colors"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 pr-3 flex-1">
                  {faq.question}
                </h3>

                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    openIndex === index
                      ? " text-white"
                      : " text-purple-600"
                  }`}
                >
                  {openIndex === index ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-4">
                      <div className="pt-3 border-t border-purple-100">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        <div className="mt-6 sm:mt-7 rounded-xl border border-[#e9d7ff] bg-white/90 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Still have questions? Reach us at{" "}
            <a href="mailto:support@insurbe.com" className="font-semibold text-[#820ad1] hover:underline">
              support@insurbe.com
            </a>
          </p>

          <Link
            href="/insuranceSignupFlow?provider=dak"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 text-white text-sm font-semibold hover:opacity-95 transition"
          >
            <MessageCircle className="w-4 h-4" />
           Book a free consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
