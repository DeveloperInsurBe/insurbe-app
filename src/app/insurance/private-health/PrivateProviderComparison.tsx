"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*                                  DATA                                      */
/* -------------------------------------------------------------------------- */

const providers = [
  {
    id: "tk",
    name: "TK",
    logo: "/icons/tk.png",
    english: 3,
    digital: 3,
    speed: 3,
    highlight: "Best digital services for students",
    bonus: "Up to €400",
  },
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
    id: "aok",
    name: "AOK",
    logo: "/partners_asset/AOk_logo.avif",
    english: 2,
    digital: 1,
    speed: 2,
    highlight: "Personal support across Germany",
    bonus: "Depends on branch",
  },
];

/* -------------------------------------------------------------------------- */
/*                               UI HELPERS                                   */
/* -------------------------------------------------------------------------- */

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-1 justify-center">
    {[1, 2, 3].map((i) => (
      <span
        key={i}
        className={`text-base md:text-lg ${
          i <= count ? "text-gray-900" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ))}
  </div>
);

const Speed = ({ count }: { count: number }) => (
  <div className="flex gap-1 justify-center">
    {[1, 2, 3].map((i) => (
      <span
        key={i}
        className={`text-base md:text-lg ${
          i <= count ? "text-gray-900" : "text-gray-300"
        }`}
      >
        ⚡
      </span>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function PrivateProviderComparison() {
  const router = useRouter();

  const handleSignup = () => {
    router.push("/products/insuranceJourney");
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* ------------------------------------------------------------------ */}
        {/*                                HEADER                               */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          {" "}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Compare{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary">
              public health insurance providers
            </span>
          </h1>
          <p className="mt-6 text-gray-600 text-base  sm:text-lg max-w-6xl">
            Core benefits are the same — service quality makes the difference.
          </p>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/*                             DESKTOP VIEW                            */}
        {/* ------------------------------------------------------------------ */}

        <div className="hidden lg:grid grid-cols-[260px_repeat(3,1fr)] border-t border-gray-200">
          {/* Left labels */}
          <div className="py-8 space-y-10 font-medium text-gray-700">
            <div />
            <div>Your contribution</div>
            <div>English support</div>
            <div>Digital services</div>
            <div>Processing speed</div>
            <div>Dependents coverage</div>
            <div>Highlight</div>
            <div>Bonus program</div>
          </div>

          {providers.map((p) => (
            <div
              key={p.id}
              className="border-l border-gray-200 py-8 px-6 space-y-10"
            >
              {/* Logo + Button */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 sm:gap-3">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    width={24}
                    height={24}
                    className="
      object-contain flex-shrink-0
      w-5 h-5
      sm:w-6 sm:h-6
      md:w-7 md:h-7
    "
                  />
                  <h1
                    className="
    text-xs
    sm:text-sm
    md:text-base
    font-medium
    text-gray-900
    whitespace-nowrap
  "
                  >
                    {p.name}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={handleSignup}
                  className="mt-4 w-full rounded-lg py-2 font-semibold cursor-pointer text-white
                    bg-gradient-to-r from-purple-600 to-primary
                    hover:opacity-90 transition shadow-md"
                >
                  Sign up
                </button>
              </div>

              <div className="text-center font-semibold">
                € —
                <div>
                  <button className="text-sm underline text-gray-600 hover:text-gray-900 transition">
                    Calculate
                  </button>
                </div>
              </div>

              <Stars count={p.english} />
              <Stars count={p.digital} />
              <Speed count={p.speed} />

              <div className="flex justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>

              <p className="text-sm text-center text-gray-700">{p.highlight}</p>
              <p className="text-sm text-center text-gray-700">{p.bonus}</p>
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                             MOBILE VIEW                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="grid gap-6 lg:hidden">
          {providers.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={80}
                  height={32}
                  className="object-contain"
                />

                <button
                  type="button"
                  onClick={handleSignup}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white
                    bg-gradient-to-r from-purple-600 to-primary
                    hover:opacity-90 transition"
                >
                  Sign up
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">English support</span>
                  <Stars count={p.english} />
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Digital services</span>
                  <Stars count={p.digital} />
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Processing speed</span>
                  <Speed count={p.speed} />
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Dependents</span>
                  <Check className="w-5 h-5 text-green-600" />
                </div>

                <div>
                  <span className="font-medium block mb-1">Highlight</span>
                  <p className="text-gray-600">{p.highlight}</p>
                </div>

                <div>
                  <span className="font-medium block mb-1">Bonus program</span>
                  <p className="text-gray-600">{p.bonus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
