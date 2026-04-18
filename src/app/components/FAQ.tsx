"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function FAQ() {
  const faqs = [
    {
      question: "Who is InsurBe and what do you do?",
      answer:
        "InsurBe is a Germany-focused insurance platform helping students, professionals, families, and expats find the right health insurance plans that meet legal and visa requirements. We simplify the entire process—from choosing a plan to getting insured.",
    },
    {
      question: "Is InsurBe a licensed insurance provider?",
      answer:
        "InsurBe works with licensed and regulated German insurance partners. All plans offered through our platform comply with German regulations and are accepted by authorities, universities, and employers.",
    },
    {
      question: "How long does it take to get insured through InsurBe?",
      answer:
        "In most cases, applications are processed within 24–48 hours after document submission. Some plans can be activated even faster, depending on eligibility and insurer approval.",
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
  const router = useRouter();

  return (
    <section className="md:pb-16 pb-10 px-6 lg:px-20 ">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* LEFT SIDE */}
        <div className="max-h-[600px] overflow-y-auto pr-4 custom-scroll">
          {/* Heading */}
          <div className="mb-10">
            <p className="text-sm text-purple-500 font-semibold mb-3 tracking-wider">
              — FAQS
            </p>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
              <span className="  px-2">
                Got questions?
              </span>
              <br />
              <span className=" text-primary  px-2">
                We've got answers.
              </span>
            </h2>

            <p className="text-gray-500 mt-4">
              Everything you need to know about InsurBe and our insurance
              products.
            </p>
          </div>

          {/* FAQ LIST */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-4 cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-800">
                    {faq.question}
                  </h3>

                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold">
                    {openIndex === index ? "−" : "+"}
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-gray-600 mt-3 pr-6"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE (STICKY CARD) */}
        <div className="sticky top-24 h-fit  md:px-10">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl overflow-hidden shadow-xl "
          >
            {/* Top Gradient */}
            <div className="bg-gradient-to-br from-purple-800 to-purple-400 py-8 px-16  text-white">
              <h3 className="text-2xl font-bold mb-3">
                Still have questions? Let's talk.
              </h3>

              <p className="text-sm opacity-90">
                Our insurance experts are ready to help you find the right plan
                — completely free of charge and with zero obligation.
              </p>
            </div>

            {/* Bottom */}
            <div className="p-6 flex flex-col items-center gap-4">
              <button
                onClick={() => router.push("/book-appointment")}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-800 to-purple-400 text-white font-semibold shadow-md hover:scale-105 transition"
              >
                📅 Book a Free Call
              </button>

              <p className="text-sm text-gray-500 text-center">
                Or chat with us at{" "}
                <span className="text-purple-600 font-medium">
                  support@insurbe.com
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scroll {
          -ms-overflow-style: none; /* IE & Edge */
          scrollbar-width: none; /* Firefox */
        }

        .custom-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
      `}</style>
    </section>
  );
}
