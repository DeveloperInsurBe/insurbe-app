"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, ChevronDown, GraduationCap, Plane, Users } from "lucide-react";

import { ACCENT_STYLES, HMR_PRODUCTS, type HmrProduct, type HmrProductSlug } from "./products";

const SITUATIONS: { id: HmrProductSlug; icon: typeof Plane; title: string; text: string }[] = [
  { id: "visa-travel", icon: Plane, title: "I need it for my visa", text: "Visa application, stay up to 1 year" },
  { id: "young-travel", icon: GraduationCap, title: "I'm young & staying longer", text: "Student, au pair, intern – up to 5 years" },
  { id: "foreign-guests", icon: Users, title: "I'm visiting Germany", text: "Guest stay or family visit – up to 5 years" },
];

const applyHref = (product: HmrProduct) => `/products/incomingvisaseakers/apply/${product.slug}`;

function ProductCard({ product, recommended, dimmed }: { product: HmrProduct; recommended: boolean; dimmed: boolean }) {
  const [open, setOpen] = useState(false);
  const accent = ACCENT_STYLES[product.accent];

  return (
    <motion.article
      layout
      className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 sm:p-7 ${
        recommended ? `ring-2 ${accent.ring} border-transparent shadow-xl` : "border-gray-200 hover:shadow-lg"
      } ${dimmed ? "opacity-60" : ""}`}
    >
      {recommended && (
        <span
          className={`absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${accent.gradient} px-3 py-1 text-xs font-semibold text-white shadow`}
        >
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Recommended for you
        </span>
      )}

      <div className={`mb-5 h-1.5 w-14 rounded-full bg-gradient-to-r ${accent.gradient}`} aria-hidden />

      <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}>{product.bestFor}</span>
      <h3 className="mt-4 text-xl font-bold text-gray-900">{product.name}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{product.tagline}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-2xl ${accent.soft} p-3`}>
          <dt className="text-xs text-gray-500">Max. duration</dt>
          <dd className="mt-0.5 font-semibold text-gray-900">{product.maxDuration}</dd>
        </div>
        <div className={`rounded-2xl ${accent.soft} p-3`}>
          <dt className="text-xs text-gray-500">Valid in</dt>
          <dd className="mt-0.5 font-semibold text-gray-900">
            {product.slug === "visa-travel" ? "Germany & Schengen" : product.coverageArea}
          </dd>
        </div>
      </dl>

      <ul className="mt-5 space-y-2.5">
        {product.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${accent.dot} text-white`}>
              <Check className="h-3 w-3" aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        Good to know
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {product.goodToKnow.map((item) => (
              <li key={item} className="mt-2 border-l-2 border-gray-200 pl-3 text-sm leading-6 text-gray-600">
                {item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-7">
        <Link
          href={applyHref(product)}
          className={`group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${
            accent.gradient
          } px-6 py-3.5 font-semibold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            recommended ? "shadow-lg" : "shadow-sm hover:shadow-md"
          }`}
        >
          Apply now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}

export default function IncomingProducts() {
  const [situation, setSituation] = useState<HmrProductSlug | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <section id="incoming-products" className="scroll-mt-24 bg-[#faf8ff] px-4 py-16 sm:px-8 sm:py-20 lg:px-18">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Which insurance fits you?</h2>
          <p className="mt-3 text-gray-600">Pick your situation and we&apos;ll highlight the best match – or compare all three below.</p>
        </motion.div>

        {/* SITUATION PICKER */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Your situation">
          {SITUATIONS.map(({ id, icon: Icon, title, text }) => {
            const active = situation === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSituation(active ? null : id)}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active ? "border-primary bg-white shadow-md" : "border-transparent bg-white/70 hover:border-primary/30 hover:bg-white"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-gray-900">{title}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{text}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* PRODUCT CARDS */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HMR_PRODUCTS.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              recommended={situation === product.slug}
              dimmed={situation !== null && situation !== product.slug}
            />
          ))}
        </div>

        {/* COMPARISON */}
        <div className="mt-16">
          <h3 className="text-center text-xl font-bold text-gray-900">Compare at a glance</h3>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th scope="col" className="px-5 py-4 font-medium text-gray-500" />
                  {HMR_PRODUCTS.map((product) => (
                    <th key={product.slug} scope="col" className="px-5 py-4 font-semibold text-gray-900">
                      {product.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: "Best for", value: (p: HmrProduct) => p.bestFor },
                  { label: "Max. duration", value: (p: HmrProduct) => p.maxDuration },
                  { label: "Valid in", value: (p: HmrProduct) => p.coverageArea },
                  { label: "Who", value: (p: HmrProduct) => p.ageInfo },
                  {
                    label: "When to apply",
                    value: (p: HmrProduct) =>
                      p.slug === "visa-travel" ? "Before entering the Schengen area" : "Any time – ideally within 31 days of arrival",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-5 py-4 font-medium text-gray-500">
                      {row.label}
                    </th>
                    {HMR_PRODUCTS.map((product) => (
                      <td key={product.slug} className="px-5 py-4 text-gray-800">
                        {row.value(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-5 py-4" />
                  {HMR_PRODUCTS.map((product) => (
                    <td key={product.slug} className="px-5 py-4">
                      <Link
                        href={applyHref(product)}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Apply <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
