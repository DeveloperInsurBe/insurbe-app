"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Best Process",
    desc: "Quick, easy, and hassle-free. Apply in minutes and get confirmation within 5–10 hours.",
    icon: "⚙️",
  },
  {
    title: "Fair Price",
    desc: "Transparent, student-friendly pricing. Pay only for what truly matters.",
    icon: "💰",
  },
  {
    title: "Customer Support",
    desc: "Fast, friendly, and always available when you need help.",
    icon: "🤝",
  },
  {
    title: "Free Choice",
    desc: "Choose from multiple health insurance providers — flexibility that others don’t offer.",
    icon: "💙",
  },
];

export default function WhyStudentsLove() {
  return (
    <section className="relative w-full  py-20 md:py-28 overflow-hidden">
      
      

      <div className="relative max-w-6xl mx-auto px-6">

        {/* 🔥 HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-primary">
            Why Students <span className="text-primary-dark">Love Us</span>
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Everything you need for your Germany journey — simplified, fast, and built for students.
          </p>
        </motion.div>

        {/* 🔥 GRID */}
        <div className="grid md:grid-cols-2 gap-8">

          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-primary/30 to-transparent"
            >
              
              {/* GLASS CARD */}
              <div className="h-full w-full rounded-3xl bg-white/70 backdrop-blur-xl p-6 md:p-7 shadow-md group-hover:shadow-xl transition">

                {/* ICON */}
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl mb-4 group-hover:scale-110 transition">
                  {item.icon}
                </div>

                {/* TITLE */}
                <h3 className="text-lg md:text-xl font-semibold text-primary">
                  {item.title}
                </h3>

                {/* DESC */}
                <p className="mt-2 text-gray-600 text-sm md:text-base leading-relaxed">
                  {item.desc}
                </p>

                {/* HOVER GLOW */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}