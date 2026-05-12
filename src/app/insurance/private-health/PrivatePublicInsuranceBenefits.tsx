"use client";

import { motion } from "framer-motion";
import {
  Shield,
  CalendarDays,
  BadgeDollarSign,
  ArrowRight,
} from "lucide-react";

const benefits = [
  {
    title: "Premium relief in old age",
    desc: "We offer guaranteed premium relief in old age. Think of it as a savings pot when capital is set aside to reduce premiums later. Best of all, your employer contributes up to 50% of those additional savings.",
    cta: "More information about premium relief",
    icon: Shield,
  },
  {
    title: "Daily sickness benefits",
    desc: "Employees are usually covered by their employer for 42 days. To secure yourself against long-term illness, daily sickness benefits step in and compensate for income loss.",
    cta: "More information on daily sickness benefits",
    icon: CalendarDays,
  },
  {
    title: "No-claim bonus",
    desc: "First Class Pro+ and Business Class Pro tariffs include a no-claim bonus if no benefits are claimed (except dental cleanings, check-ups, and vaccinations) for one year.",
    cta: "More information about no-claim bonus",
    icon: BadgeDollarSign,
  },
];

export default function PrivatePublicInsuranceBenefits() {
  return (
    <section className="bg-[#faf9fc] py-16">
      <div className="mx-auto max-w-[1320px] px-5">
        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-[-1px] text-[#0c1533] sm:text-[42px] lg:text-[58px]">
            More control over your private{" "}
            <span className="bg-gradient-to-r from-[#8d2bff] to-[#5b61ff] bg-clip-text text-transparent">
              health insurance
            </span>
          </h2>

          <p className="mt-4 text-[15px] font-medium text-[#7d8396] sm:text-[16px]">
            Personalize your coverage with smart add-ons and future-proof
            benefits.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="grid gap-7 lg:grid-cols-3">
          {benefits.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex min-h-[390px] flex-col rounded-[26px] border border-[#ebe7f3] bg-white px-7 py-7"
              >
                <div className="flex items-center gap-4">
                  {/* ICON */}
                  <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-[#f3ebff]">
                    <Icon className="h-7 w-7 text-[#7d3cff]" strokeWidth={2} />
                  </div>

                  {/* TITLE */}
                  <h3 className="max-w-[240px] text-[18px] font-black leading-[1.15] tracking-[-0.5px] text-[#0d1635]">
                    {item.title}
                  </h3>
                </div>

                {/* DESC */}
                <p className="mt-7 text-[16px] leading-[2] text-[#6f7688]">
                  {item.desc}
                </p>

                {/* CTA */}
                <button className="mt-auto flex items-center justify-between pt-5 text-left">
                  <span className="max-w-full text-[16px] font-bold leading-[1.5] text-[#7c3aed]">
                    {item.cta}
                  </span>

                  <ArrowRight className="h-5 w-5 shrink-0 text-[#7c3aed]" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
