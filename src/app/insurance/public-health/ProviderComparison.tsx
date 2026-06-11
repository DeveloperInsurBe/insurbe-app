"use client";

import Image from "next/image";
import { Check, Gift, Star, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TK_CONFIG } from "@/app/constants/insurance";

/* -------------------------------------------------------------------------- */
/* DATA */
/* -------------------------------------------------------------------------- */

const providers = [
  {
    id: "tk",
    name: "TK",
    subtitle: "Die Techniker",
    logo: "/icons/tk.png",
    english: 3,
    digital: 2,
    speed: 3,
    bestFor: "Expats, students, and families",
    bonus: `Bonus up to €${TK_CONFIG.bonus}*`,
    hasStar: true,
  },
  {
    id: "dak",
    name: "DAK Gesundheit",
    subtitle: "DAK Gesundheit",
    logo: "/partners_asset/DAK_logo.avif",
    english: 5,
    digital: 5,
    speed:3,
    bestFor: "Families and comprehensive coverage",
    bonus: "Up to €500",
    featured: true,
  },
  {
    id: "aok",
    name: "AOK",
    subtitle: "AOK – Die Gesundheitskasse",
    logo: "/partners_asset/AOK_logo.avif",
    english: 2,
    digital: 1,
    speed: 3,
    bestFor: "Personal support and local service",
    bonus: "Depends on branch",
  },
];

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */
type PremiumBreakdown = {
  healthContribution: number;
  zusatzContribution: number;
  careContribution: number;
  total: number;
};

const StarRating = ({ count, featured }: { count: number; featured?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path
          d="M7.5 1.5l1.4 2.8 3.1.45-2.25 2.19.53 3.1L7.5 8.5l-2.78 1.54.53-3.1L3 4.75l3.1-.45z"
          fill={i <= count ? (featured ? "#820ad1" : "#1f2937") : "none"}
          stroke={i <= count ? (featured ? "#820ad1" : "#374151") : "#d1d5db"}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

const SpeedRating = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3].map((i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1l1 3h3l-2.5 1.8.95 2.9L7 7l-2.45 1.7.95-2.9L3 4h3z"
          fill={i <= count ? "#f59e0b" : "none"}
          stroke={i <= count ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

function RowIcon({ type }: { type: string }) {
  if (type === "english")
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <circle cx="8.5" cy="8.5" r="6.5" stroke="#9ca3af" strokeWidth="1.3" />
        <path d="M8.5 2c-1.8 1.8-2.7 4-2.7 6.5S6.7 13.2 8.5 15M8.5 2c1.8 1.8 2.7 4 2.7 6.5S10.3 13.2 8.5 15M2 8.5h13" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (type === "digital")
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <rect x="2" y="4" width="13" height="9" rx="1.5" stroke="#9ca3af" strokeWidth="1.3" />
        <path d="M5.5 13l1 2h4l1-2" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (type === "speed")
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M8.5 3v2.5M13.5 8.5H11M8.5 14v-2.5M3.5 8.5H6" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8.5" cy="8.5" r="2.5" stroke="#9ca3af" strokeWidth="1.3" />
      </svg>
    );
  if (type === "dependents")
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <circle cx="5.5" cy="5.5" r="2" stroke="#9ca3af" strokeWidth="1.3" />
        <circle cx="11.5" cy="5.5" r="2" stroke="#9ca3af" strokeWidth="1.3" />
        <path d="M1.5 14.5c0-2.8 1.8-4.5 4-4.5h6c2.2 0 4 1.7 4 4.5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  return null;
}

/* -------------------------------------------------------------------------- */
/* MAIN */
/* -------------------------------------------------------------------------- */

export default function ProviderComparison({
  premium,
}: {
  premium: PremiumBreakdown | null;
}) {
  const router = useRouter();

  const getSignupUrl = (providerId: string) => {
    const params = new URLSearchParams();
    params.set("provider", providerId);

    const refFromUrl =
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("ref")?.trim()) ||
      "";
    const refFromStorage =
      (typeof window !== "undefined" &&
        (localStorage.getItem("partner_ref") ||
          localStorage.getItem("partnerRef") ||
          "")) ||
      "";
    const ref = refFromUrl || refFromStorage;

    if (ref) {
      params.set("ref", ref);
      params.set("source", "partner");
    }

    return `/insuranceSignupFlow?${params.toString()}`;
  };

  return (
    <section
      id="provider-comparison"
      className="pb-16 pt-10 px-4"
      style={{ background: "#f8f7ff" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
            Compare top{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500">
              public health insurers
            </span>
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            All providers are legally compliant and accepted in Germany.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto items-start">
          {providers.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative flex flex-col"
              style={{ transition: "transform 0.3s ease" }}
            >
              {/* Most Popular badge floats above card */}
              {p.featured && (
                <div className="flex justify-center" style={{ marginBottom: "-1px" }}>
                  <div
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold z-10"
                    style={{
                      background: "linear-gradient(135deg, #820ad1 0%, #a855f7 100%)",
                      boxShadow: "0 4px 14px rgba(130,10,209,0.35)",
                    }}
                  >
                    <Star className="w-3 h-3 fill-white" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card body */}
              <div
                className="flex flex-col rounded-2xl p-5 flex-1"
                style={{
                  background: "white",
                  border: p.featured ? "2px solid #820ad1" : "1.5px solid #e9e9f0",
                  boxShadow: p.featured
                    ? "0 12px 40px rgba(130,10,209,0.14)"
                    : "0 2px 16px rgba(0,0,0,0.05)",
                }}
              >
                {/* Provider header */}
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid #f1f1f5" }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                    style={{ background: "#f3f4f6" }}
                  >
                    <Image
                      src={p.logo}
                      alt={p.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.subtitle}</p>
                  </div>
                  {p.id === "tk" && premium && (
                    <div className="ml-auto text-right shrink-0">
                      <p className="text-[10px] text-gray-400">approx.</p>
                      <p className="text-base font-bold text-gray-900">€{premium.total.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {/* Feature rows */}
                <div className="space-y-3 mb-5">
                  {[
                    {
                      key: "english",
                      label: "English support",
                      render: () => <StarRating count={p.english} featured={p.featured} />,
                    },
                    {
                      key: "digital",
                      label: "Digital services",
                      render: () => <StarRating count={p.digital} featured={p.featured} />,
                    },
                    {
                      key: "speed",
                      label: "Processing speed",
                      render: () => <SpeedRating count={p.speed} />,
                    },
                    {
                      key: "dependents",
                      label: "Dependents included",
                      render: () => (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "#dcfce7" }}
                        >
                          <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                        </div>
                      ),
                    },
                  ].map((row) => (
                    <div key={row.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RowIcon type={row.key} />
                        <span className="text-sm text-gray-600">{row.label}</span>
                      </div>
                      {row.render()}
                    </div>
                  ))}
                </div>

                {/* Best for */}
                <div
                  className="rounded-xl p-3 mb-4 flex items-center gap-3"
                  style={{
                    background: p.featured ? "#f5f0ff" : "#f9fafb",
                    border: `1px solid ${p.featured ? "rgba(130,10,209,0.12)" : "#f0f0f5"}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: p.featured ? "rgba(130,10,209,0.10)" : "#f0f0f5" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1L8.3 4.6H12L9.1 6.8l1.1 3.4L7 8l-3.2 2.2 1.1-3.4L2 4.6h3.7z"
                        fill={p.featured ? "#820ad1" : "#9ca3af"}
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: p.featured ? "#820ad1" : "#9ca3af" }}
                    >
                      Best for
                    </p>
                    <p className="text-xs font-medium text-gray-700 mt-0.5 leading-snug">
                      {p.bestFor}
                    </p>
                  </div>
                </div>

                {/* Bonus */}
                <div
                  className="flex items-center justify-between mb-5 pb-4"
                  style={{ borderBottom: "1px solid #f1f1f5" }}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-gray-400" />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: p.featured ? "#820ad1" : "#374151" }}
                    >
                      {p.bonus.replace("*", "")}
                    </span>
                    {p.hasStar && (
                      <span className="relative group cursor-pointer">
                        <span className="font-bold text-xs" style={{ color: "#820ad1" }}>*</span>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-6 w-64 p-3 text-xs text-gray-700 bg-white border border-gray-200 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-20">
                          Public insurers offer bonus programs for preventive check-ups and fitness. Cash rewards depend on participation type and frequency.
                        </span>
                      </span>
                    )}
                  </div>
                  <button className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center hover:border-purple-300 transition-colors cursor-pointer">
                    <Info className="w-3 h-3 text-gray-400" />
                  </button>
                </div>

                {/* CTA */}
                <button
                  onClick={() => router.push(getSignupUrl(p.id))}
                  className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-200"
                  style={
                    p.featured
                      ? {
                          background: "linear-gradient(135deg, #820ad1 0%, #a855f7 100%)",
                          color: "white",
                          boxShadow: "0 4px 16px rgba(130,10,209,0.28)",
                        }
                      : {
                          background: "white",
                          color: "#820ad1",
                          border: "1.5px solid #820ad1",
                        }
                  }
                >
                  View details &amp; sign up
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust strip */}
        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {[
            {
              text: "Accepted for residence permits",
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L2.5 4v5c0 3 2.5 5.5 5.5 5.5S13.5 12 13.5 9V4z" stroke="#820ad1" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M5.5 8.5l2 2 3-3" stroke="#820ad1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              text: "Family members included",
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="5.5" cy="5" r="2" stroke="#820ad1" strokeWidth="1.3" />
                  <circle cx="10.5" cy="5" r="2" stroke="#820ad1" strokeWidth="1.3" />
                  <path d="M1.5 13.5c0-2.5 1.8-4 4-4h5c2.2 0 4 1.5 4 4" stroke="#820ad1" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              text: "Fixed monthly contributions",
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="#820ad1" strokeWidth="1.3" />
                  <path d="M2 7h12M5 2v2M11 2v2" stroke="#820ad1" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-gray-500">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(130,10,209,0.08)" }}
              >
                {item.icon}
              </div>
              {item.text}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
