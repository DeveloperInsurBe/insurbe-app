"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Minus, CircleHelp } from "lucide-react";

type FaqItem = {
  question: string;
  answer: ReactNode;
};

const FAQS: FaqItem[] = [
  {
    question: "How the commission payment works?",
    answer:
      "The commission will be approved once your student arrives in Germany and activate the InsurBe product. You will receive the approved commission in a quarter period.",
  },
  {
    question: "Is there a minimum of approved commission that I should reach?",
    answer: "NO",
  },
  {
    question: "Where can I see my pending commission?",
    answer:
      "The information about pending commissions can be found on your partner dashboard.",
  },
  {
    question: "Is possible to change the payment method?",
    answer:
      "The banking details information can be updated on the section Partner Data of your partner portal.",
  },
  {
    question: "Where can I use my marketing assets?",
    answer:
      "The assets are available for your website, social media, and email marketing for your customers.",
  },
  {
    question: "How can I get help with promoting InsurBe?",
    answer: (
      <>
        In case of any questions about our products and processes, please
        contact your Regional Manager or our Partner Manager by clicking
        &apos;Contact&apos; on the left menubar or sending us an email at{" "}
        <a
          href="mailto:info@insurbe.com"
          className="font-semibold text-[#820ad1] underline underline-offset-2"
        >
          info@insurbe.com
        </a>
        .
      </>
    ),
  },
];

export default function Page() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="text-xs md:text-sm text-gray-500">
        Partner Help / <span className="font-semibold text-black">FAQ</span>
      </div>

      <div className="relative overflow-hidden rounded-[18px] md:rounded-[22px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 md:p-5 shadow-[0_10px_28px_rgba(130,10,209,0.08)]">
        <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-[#820ad1]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-[1.6px] text-[#820ad1]">
            <CircleHelp size={12} />
            Frequently Asked Questions
          </div>

          <h1 className="mt-3 text-xl sm:text-2xl md:text-[40px] font-black tracking-tight text-[#111827]">
            Partner FAQ
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
            Find quick answers to the most common partner questions about
            commissions, payments, and marketing support at InsurBe.
          </p>
        </div>
      </div>

      <div className="rounded-[18px] md:rounded-[22px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-2.5 sm:p-3 md:p-4 space-y-2">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="rounded-lg md:rounded-xl border border-gray-100 bg-[#fcfcfd] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-3.5 md:px-4 py-3 md:py-3.5 flex items-center justify-between gap-2.5 md:gap-3 text-left hover:bg-[#f8f1ff] transition-colors"
                >
                  <span className="text-[13px] sm:text-sm md:text-lg font-semibold text-[#1f2937] leading-snug">
                    {item.question}
                  </span>

                  <span className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-lg border border-[#e8d7fa] bg-white flex items-center justify-center text-[#820ad1]">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3.5 md:px-4 pb-3 md:pb-4">
                    <div className="rounded-lg md:rounded-xl bg-white border border-[#f3e8ff] px-3.5 py-3 text-xs sm:text-sm md:text-[15px] text-[#475467] leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
