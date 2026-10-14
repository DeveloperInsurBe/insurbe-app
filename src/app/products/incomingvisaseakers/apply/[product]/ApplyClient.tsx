"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleCheck,
  Clock,
  CreditCard,
  Globe2,
  IdCard,
  Lock,
  MapPin,
  UserRound,
} from "lucide-react";

import { ACCENT_STYLES, HMR_PRODUCTS, hmrBookingUrl, type HmrLocale, type HmrProductSlug } from "../../products";

const LANGUAGES: { id: HmrLocale; label: string }[] = [
  { id: "en_GB", label: "English" },
  { id: "de_DE", label: "Deutsch" },
];

export default function ApplyClient({ slug }: { slug: HmrProductSlug }) {
  const product = HMR_PRODUCTS.find((item) => item.slug === slug)!;
  const others = HMR_PRODUCTS.filter((item) => item.slug !== slug);
  const accent = ACCENT_STYLES[product.accent];
  const reduceMotion = useReducedMotion();

  const [locale, setLocale] = useState<HmrLocale>("en_GB");
  const [opened, setOpened] = useState(false);

  const bookingUrl = hmrBookingUrl(product, locale);

  const checklist = [
    {
      icon: CalendarDays,
      title: "Your travel dates",
      text:
        product.slug === "visa-travel"
          ? "Date of entry and departure – cover starts on your entry date."
          : "Date you entered (or will enter) Germany, insurance start and departure date.",
    },
    { icon: UserRound, title: "Personal details", text: "Name and date of birth of every person to be insured." },
    { icon: MapPin, title: "Your address", text: "Your current residential address." },
    { icon: IdCard, title: "Previous insurance", text: "If you were already insured during your stay, its end date (for a renewal)." },
    { icon: CreditCard, title: "Payment", text: "You pay securely online on HanseMerkur's booking page." },
  ];

  const fade = (delay = 0) =>
    reduceMotion
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf8ff] px-4 py-10 sm:px-8 sm:py-14 lg:px-18">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Link
          href="/products/incomingvisaseakers#incoming-products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All visa &amp; visitor insurances
        </Link>

        {/* HEADER */}
        <motion.header {...fade()} className="mt-6 overflow-hidden rounded-3xl border border-white/70 bg-white shadow-sm">
          <div className={`h-2 bg-gradient-to-r ${accent.gradient}`} aria-hidden />
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}>
                {product.bestFor}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
              <p className="mt-2 max-w-xl text-gray-600">{product.tagline}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
              <div className="relative h-8 w-24">
                <Image src="/partners_asset/hansemerkur.webp" alt="HanseMerkur" fill className="object-contain" sizes="96px" />
              </div>
              <span className="text-xs text-gray-500">Insurer</span>
            </div>
          </div>

          <dl className="grid grid-cols-1 border-t border-gray-100 sm:grid-cols-3">
            {[
              { icon: Clock, label: "Max. duration", value: product.maxDuration },
              { icon: Globe2, label: "Valid in", value: product.coverageArea },
              { icon: UserRound, label: "Who", value: product.ageInfo },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 border-gray-100 p-5 sm:border-r sm:last:border-r-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-semibold text-gray-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </motion.header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* LEFT: what you need + highlights */}
          <motion.section {...fade(0.1)} className="space-y-8 lg:col-span-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-gray-900">Have this ready</h2>
              <p className="mt-1 text-sm text-gray-500">Booking takes about 5 minutes.</p>
              <ul className="mt-6 space-y-5">
                {checklist.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.soft}`}>
                      <Icon className="h-5 w-5 text-gray-700" aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-sm leading-6 text-gray-600">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-gray-900">What you get</h2>
              <ul className="mt-5 space-y-3">
                {product.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <h3 className="mt-7 text-sm font-semibold text-gray-900">Good to know</h3>
              <ul className="mt-3 space-y-2">
                {product.goodToKnow.map((item) => (
                  <li key={item} className="border-l-2 border-gray-200 pl-3 text-sm leading-6 text-gray-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* RIGHT: booking card */}
          <motion.aside {...fade(0.2)} className="lg:col-span-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg shadow-primary/5 sm:p-8 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900">Ready to book?</h2>
              <p className="mt-1 text-sm text-gray-600">
                You&apos;ll continue on HanseMerkur&apos;s secure booking page. It opens in a new tab, so you can come back here
                any time.
              </p>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium text-gray-700">Booking language</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
                  {LANGUAGES.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLocale(id)}
                      aria-pressed={locale === id}
                      className={`rounded-xl py-2 text-sm font-semibold transition ${
                        locale === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener"
                onClick={() => setOpened(true)}
                className={`group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${accent.gradient} px-6 py-4 font-semibold text-white shadow-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2`}
              >
                Continue to secure booking
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>

              {opened && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800"
                  role="status"
                >
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    The booking page opened in a new tab. Nothing happened?{" "}
                    <a href={bookingUrl} target="_blank" rel="noopener" className="font-semibold underline">
                      Open it again
                    </a>
                    .
                  </span>
                </motion.div>
              )}

              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-500">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Booking, payment and your insurance contract are handled by HanseMerkur Reiseversicherung AG on
                secure.hmrv.de.
              </p>

              <div className="mt-6 border-t border-gray-100 pt-5 text-sm text-gray-600">
                Questions before you book?{" "}
                <Link href="/contact" className="font-semibold text-primary hover:underline">
                  Contact us
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* OTHER OPTIONS */}
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Not quite right? Other options</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/products/incomingvisaseakers/apply/${other.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-gray-900">{other.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {other.maxDuration} · {other.bestFor}
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-primary" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
