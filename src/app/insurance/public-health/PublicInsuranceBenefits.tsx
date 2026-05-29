"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// SVG Icons
const DocumentIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#820ad1"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#820ad1"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const VideoIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#820ad1"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const benefits = [
  {
    title: "Works for all\nresidence permits",
    desc: "Fulfills all legal requirements for health insurance & long-term care insurance in Germany.",
    icon: DocumentIcon,
    image: "/hero_assets/permits.png",
    imageAlt: "Laptop with notebook and plant on a desk",
  },
  {
    title: "Comprehensive cover",
    desc: "Regardless of the provider you choose, 95% of the coverage offered by Public Health Insurance is defined by law.",
    icon: ShieldIcon,
    image: "/hero_assets/cover.png",
    imageAlt: "95% coverage card with mug and plant",
  },
  {
    title: "Video doctor",
    desc: "Medical advice by phone or video call from English-speaking doctors based in Germany.",
    icon: VideoIcon,
    image: "/hero_assets/videoDoctor.png",
    imageAlt: "Hand holding phone with video doctor call",
  },
];

export default function PublicInsuranceBenefits() {
  return (
    <section
      id="learnmore"
      className="relative py-20 px-4 sm:px-8 lg:px-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #f8f5ff 0%, #faf8ff 50%, #f0ebff 100%)",
      }}
    >
      {/* Background glow blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(130,10,209,0.06) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(130,10,209,0.04) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Why choose{" "}
            <span style={{ color: "#820ad1" }}>public health insurance?</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Reliable, legally compliant, and trusted by millions across Germany.
          </p>
          {/* Purple divider */}
          <div
            className="mx-auto mt-4 w-10 h-0.5 rounded-full"
            style={{ background: "#820ad1" }}
          />
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
                className="relative flex flex-col justify-between rounded-2xl overflow-hidden bg-white"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(130,10,209,0.08)",
                }}
              >
                {/* ── Top: text content ── */}
                <div className="p-6 pb-4">
                  {/* Icon circle */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "rgba(130,10,209,0.08)" }}
                  >
                    <Icon />
                  </div>

                  {/* Purple accent bar */}
                  <div
                    className="w-7 h-0.5 rounded-full mb-4"
                    style={{ background: "#820ad1" }}
                  />

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug whitespace-pre-line">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* ── Bottom Image Section ── */}
                <div
                  className="relative w-full mt-auto overflow-hidden rounded-b-2xl bg-white"
                  style={{ height: "280px" }}
                >
                  {/* Image */}
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover object-bottom"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Very soft fade only at top */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 16%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0) 45%)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
