"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Fully Flexible Plans",
    desc: "Choose your country, select an appropriate plan, and add optional benefits as available.",
    cta: "Plans that fit your needs",
    image: "/hero_assets/docsb.png",
    imgAlt: "Flexible plan selection",
  },
  {
    title: "Complete Health Coverage",
    desc: "From hospitalization and repatriation to everyday medical care — everything you need, in one plan.",
    cta: "Comprehensive protection",
    image: "/hero_assets/girlb.png",
    imgAlt: "Complete health coverage",
  },
  {
    title: "100% Digital Experience",
    desc: "Sign up online, access documents instantly, and manage claims easily from anywhere in the world.",
    cta: "Quick. Simple. Paperless.",
    image: "/hero_assets/phoned.png",
    imgAlt: "100% digital experience on mobile",
  },
  {
    title: "Support Anytime, Anywhere",
    desc: "Our international support team is available 24/7 to assist you in your preferred language.",
    cta: "We're here for you",
    image: "/hero_assets/privatei.jpg",
    imgAlt: "24/7 support",
  },
];

export default function FirstExpatHero() {
  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-8 lg:px-16 overflow-hidden ">
      {/* Subtle background blobs */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(130,10,209,0.06) 0%, transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(130,10,209,0.05) 0%, transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color: "#111827" }}
          >
            Health Insurance in{" "}
            <span style={{ color: "#820ad1" }}>Germany</span>
          </h2>

          <p className="mt-5 text-gray-500 max-w-xl mx-auto text-base sm:text-lg font-normal">
            Flexible, legally compliant health insurance for students and
            employees.
          </p>

          {/* Accent underline */}
          <div
            className="mx-auto mt-4 rounded-full"
            style={{ width: "48px", height: "3px", background: "#820ad1" }}
          />
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group rounded-2xl overflow-hidden bg-white flex flex-col"
              style={{
                border: "1px solid #f0e6fc",
                boxShadow: "0 2px 12px rgba(130,10,209,0.06)",
                transition: "box-shadow 0.25s ease, transform 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 32px rgba(130,10,209,0.15)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 12px rgba(130,10,209,0.06)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              {/* Real image on top */}
              <div
                className="w-full overflow-hidden"
                style={{ height: "210px" }}
              >
                <img
                  src={item.image}
                  alt={item.imgAlt}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content below */}
              <div className="flex flex-col flex-1 p-6 pt-5">
                <h3
                  className="text-lg font-bold leading-snug mb-3"
                  style={{ color: "#111827" }}
                >
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {item.desc}
                </p>

                {/* Accent rule */}
                <div
                  className="mt-5 rounded-full"
                  style={{
                    width: "32px",
                    height: "2px",
                    background: "#820ad1",
                  }}
                />

                {/* CTA link */}
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm font-semibold mt-2 hover:gap-2 transition-all"
                  style={{ color: "#820ad1" }}
                >
                  {item.cta} <span>→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
