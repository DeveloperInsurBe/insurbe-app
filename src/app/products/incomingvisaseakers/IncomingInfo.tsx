"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, CreditCard, FileCheck2, MousePointerClick } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Choose your insurance",
    text: "Compare the three options and pick the one that matches your stay.",
  },
  {
    icon: CreditCard,
    title: "Book securely online",
    text: "Enter your travel dates and details on HanseMerkur's secure booking page and pay online.",
  },
  {
    icon: FileCheck2,
    title: "Get your documents",
    text: "HanseMerkur sends your insurance confirmation by email – ready for your visa or registration.",
  },
];

const FAQS = [
  {
    q: "Which insurance do I need for my visa?",
    a: "If you need a visa for a stay of up to one year, Visa Travel Insurance is made for this. It is valid in Germany and the Schengen area and must be taken out before you enter.",
  },
  {
    q: "I'm a student or au pair – which one fits?",
    a: "Young Travel Incoming is designed for young people staying in Germany for longer, for up to 5 years. Please check with your university or authority whether private travel health insurance is accepted for your status.",
  },
  {
    q: "How long can I be insured?",
    a: "Young Travel and Foreign Guests cover stays of up to 5 years in total, including any earlier foreign travel insurance. Visa Travel Insurance covers up to 1 year.",
  },
  {
    q: "Is there a waiting period?",
    a: "For Young Travel and Foreign Guests a 31-day waiting period applies if you apply later than 31 days after arriving in Germany. It does not apply to accidents or acute emergencies.",
  },
  {
    q: "Who handles the booking and payment?",
    a: "The booking, payment and your contract are handled directly by HanseMerkur Reiseversicherung AG on their secure booking pages. InsurBe helps you choose the right product.",
  },
];

export default function IncomingInfo() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-4 py-16 sm:px-8 sm:py-20 lg:px-18">
      <div className="mx-auto max-w-7xl">
        {/* HOW IT WORKS */}
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">How it works</h2>
        <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <motion.li
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <span className="absolute right-6 top-6 text-5xl font-bold text-gray-100" aria-hidden>
                {index + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
            </motion.li>
          ))}
        </ol>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-gray-900 hover:bg-gray-50/60"
                  >
                    {faq.q}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-6 text-sm leading-6 text-gray-600"
                      >
                        <span className="block pb-5">{faq.a}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
