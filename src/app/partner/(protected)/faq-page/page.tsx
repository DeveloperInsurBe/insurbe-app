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
    <div className="space-y-6 md:space-y-8">
      <div className="modal-item-in text-sm text-gray-500">
        Partner Help / <span className="font-semibold text-black">FAQ</span>
      </div>

      <section className="modal-panel-in relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-5 py-5 sm:px-7 sm:py-6 md:px-9 md:py-7 text-[#111827] shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        {/* animated background shapes */}
        <div className="modal-float pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#820ad1]/10 blur-2xl" />
        <div
          className="modal-float pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#a855f7]/15 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #820ad1 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div
            className="modal-item-in inline-flex items-center gap-2.5 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[2px] text-[#820ad1]"
            style={{ animationDelay: "120ms" }}
          >
            <CircleHelp size={12} />
            Frequently Asked Questions
          </div>

          <h1
            className="modal-item-in mt-2 md:mt-2.5 text-xl sm:text-2xl md:text-[26px] font-extrabold leading-tight tracking-tight text-[#111827]"
            style={{ animationDelay: "200ms" }}
          >
            Partner FAQ
          </h1>

          <p
            className="modal-item-in mt-1 md:mt-1.5 max-w-xl text-[13px] md:text-sm text-[#667085] leading-relaxed"
            style={{ animationDelay: "280ms" }}
          >
            Find quick answers to the most common partner questions about
            commissions, payments, and marketing support at InsurBe.
          </p>
        </div>
      </section>

      <div
        className="modal-item-in rounded-[24px] md:rounded-[32px] bg-white border border-[#f0e6fb] shadow-[0_10px_35px_rgba(130,10,209,0.06)] overflow-hidden"
        style={{ animationDelay: "200ms" }}
      >
        <div className="p-3 sm:p-4 md:p-5 space-y-2.5">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                style={{ animationDelay: `${260 + Math.min(index, 12) * 50}ms` }}
                className={[
                  "modal-item-in rounded-2xl border overflow-hidden transition-all duration-300",
                  isOpen
                    ? "border-[#e9d7ff] bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] shadow-[0_12px_30px_rgba(130,10,209,0.10)]"
                    : "border-[#efe3fb] bg-white hover:border-[#e9d7ff] hover:bg-[#faf7ff]",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="group w-full cursor-pointer px-4 md:px-5 py-3.5 md:py-4 flex items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#820ad1]/40"
                >
                  <span className="text-sm md:text-base font-semibold text-[#111827] leading-snug">
                    {item.question}
                  </span>

                  <span
                    className={[
                      "shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-colors duration-300",
                      isOpen
                        ? "border-transparent bg-[#820ad1] text-white"
                        : "border-[#e9d7ff] bg-white text-[#820ad1] group-hover:border-transparent group-hover:bg-[#820ad1] group-hover:text-white",
                    ].join(" ")}
                  >
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="modal-item-in px-4 md:px-5 pb-4 md:pb-5">
                    <div className="rounded-xl bg-white border border-[#efe3fb] px-4 py-3 text-[13px] md:text-sm text-[#475467] leading-relaxed">
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
