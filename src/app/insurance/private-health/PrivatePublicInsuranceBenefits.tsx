"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
    image: "/hero_assets/parents.jpg",
    imageAlt: "Premium relief illustration",
  },
  {
    title: "Daily sickness benefits",
    desc: "Employees are usually covered by their employer for 42 days. To secure yourself against long-term illness, daily sickness benefits step in and compensate for income loss.",
    cta: "More information on daily sickness benefits",
    icon: CalendarDays,
    image: "/hero_assets/illness.jpg",
    imageAlt: "Daily sickness benefits illustration",
  },
  {
    title: "No-claim bonus",
    desc: "First Class Pro+ and Business Class Pro tariffs include a no-claim bonus if no benefits are claimed (except dental cleanings, check-ups, and vaccinations) for one year.",
    cta: "More information about no-claim bonus",
    icon: BadgeDollarSign,
    image: "/hero_assets/cliam.jpg",
    imageAlt: "No-claim bonus illustration",
  },
];

export default function PrivatePublicInsuranceBenefits() {
  return (
    <section className="bg-[#faf9fc] py-16">
      <div className="mx-auto max-w-7xl sm:px-20 px-4">
        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black sm:px-12">
            More control over your private{" "}
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              health insurance
            </span>
          </h2>

          <p className="mt-4 text-[15px] font-medium text-[#7d8396] sm:text-[16px]">
            Personalize your coverage with smart add-ons and future-proof
            benefits.
          </p>
        </motion.div>
        {/* CARDS */}
        <div className="grid gap-8 lg:grid-cols-3">
          {benefits.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-[32px] border border-white/50 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
              >
                {/* Glow Effect */}
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-purple-500/10 blur-3xl transition-all duration-500 group-hover:bg-purple-500/20" />

                {/* Image */}
                <div className="relative h-[250px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Floating Icon */}
                  <div className="absolute left-6 top-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
                    <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                 

                  {/* Title */}
                  <h3 className="text-[18px] font-black leading-tight text-[#0d1635]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-[14px] leading-6 text-[#667085]">
                    {item.desc}
                  </p>

                  
                </div>

                {/* Bottom Border Gradient */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
