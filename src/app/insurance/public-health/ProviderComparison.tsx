"use client";

import Image from "next/image";
import { Check, Gift, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TK_CONFIG } from "@/app/constants/insurance";

/* -------------------------------------------------------------------------- */
/* DATA */
/* -------------------------------------------------------------------------- */

const providers = [
  {
    id: "dak",
    name: "DAK",
    logo: "/partners_asset/DAK_logo.avif",
    english: 3,
    digital: 2,
    speed: 3,
    highlight: "Excellent coverage for families",
    bonus: "Up to €500",
  },
  {
    id: "tk",
    name: "TK",
    logo: "/icons/tk.png",
    english: 3,
    digital: 3,
    speed: 3,
    highlight: "Best service for expats, students, and families",
    bonus: `Bonus up to €${TK_CONFIG.bonus}*`,
    featured: true,
  },
  {
    id: "aok",
    name: "AOK",
    logo: "/partners_asset/AOK_logo.avif",
    english: 2,
    digital: 1,
    speed: 2,
    highlight: "Personal support across Germany",
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

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3].map((i) => (
      <span key={i} className={i <= count ? "text-black/70" : "text-gray-300"}>
        ★
      </span>
    ))}
  </div>
);

const Speed = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3].map((i) => (
      <span
        key={i}
        className={i <= count ? "text-purple-600" : "text-gray-300"}
      >
        ⚡
      </span>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN */
/* -------------------------------------------------------------------------- */

export default function ProviderComparison({
  premium,
}: {
  premium: PremiumBreakdown | null;
}) {
  const router = useRouter();

  return (
    <section className="pb-16 pt-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Compare{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-600">
              public health insurance providers
            </span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            Core benefits are the same — service quality makes the difference.
          </p>
        </motion.div>

        {/* PROVIDER CARDS (SAME DESIGN AS TARIFFS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {providers.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-3xl p-8 shadow-xl flex flex-col
                ${
                  p.featured
                    ? "bg-gradient-to-br from-purple-200 via-purple-300 to-pink-200 text-black hover:from-purple-200 hover:via-purple-300 hover:to-pink-300"
                    : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
            >
              {/* BADGE */}
              {p.featured && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2
                  bg-linear-to-r from-purple-400 to-blue-400
                  text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow"
                >
                  <span className="flex gap-1 justify-center items-center">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </span>
                </div>
              )}

              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Image src={p.logo} alt={p.name} width={36} height={36} />
                  <h3 className="text-2xl font-bold">{p.name}</h3>
                </div>

                {p.id === "tk" && premium && (
                  <span className="text-2xl font-bold text-black drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]">
                    <span className="text-sm text-gray-600 font-normal">
                      approx.
                    </span>{" "}
                    € {premium.total.toFixed(2)}
                  </span>
                )}
              </div>

              {/* FEATURES */}
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-lg items-center">
                  <span>English support</span>
                  <Stars count={p.english} />
                </div>

                <div className="flex justify-between  text-lg items-center">
                  <span>Digital services</span>
                  <Stars count={p.digital} />
                </div>

                <div className="flex justify-between  text-lg items-center">
                  <span>Processing speed</span>
                  <Speed count={p.speed} />
                </div>

                <div className="flex justify-between  text-lg items-center">
                  <span>Dependents</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>

              {/* HIGHLIGHT */}
              <p className="text-md mb-6 opacity-90">{p.highlight}</p>

              {/* BONUS */}
              <div className="flex items-center gap-2 mb-8">
                <Gift className="w-5 h-5 " />

                <span className="font-medium">{p.bonus.replace("*", "")}</span>

                {/* Star with tooltip */}
                {p.id === "tk" && (
                  <span className="relative cursor-pointer text-purple-600 font-bold inline-block group">
                    *
                    <span
                      className="absolute left-1/2 -translate-x-1/2 top-8 w-72 px-4 py-3 text-xs text-white
                        bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
                        opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 
                        shadow-xl z-10 group-hover:top-8"
                    >
                      <div className="flex text-gray-700 items-start gap-2">
                        <span className="text-gray-700 mt-0.5">✓</span>
                        <p>Bonus depends on participation in TK programs and specific conditions.</p>
                      </div>
                    </span>
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() =>
                  router.push(`/insuranceSignupFlow?provider=${p.id}`)
                }
                className={`mt-auto w-full py-4 rounded-xl font-bold cursor-pointer transition-all
                  ${
                    p.featured
                      ? "bg-white text-purple-600 hover:bg-purple-50"
                      : "bg-gradient-to-r from-purple-600 to-primary text-white"
                  }`}
              >
                Sign up →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
