"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, FileText, Loader2, ShieldCheck } from "lucide-react";

type Product = {
  insuranceCompany: string;
  productId: number;
  title: string;
  premium: number;
  currency: string;
  contractBegin: string;
  contractEnd: string;
  coverage: string[];
  documents: { type: string; label: string; url: string }[];
  addOn: boolean;
  slug: "young-travel" | "foreign-guests" | "visa-travel" | null;
};

const iso = (date: Date) => date.toISOString().slice(0, 10);
const plusDays = (days: number, from = new Date()) => {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
};
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "EUR" }).format(amount);
const days = (from: string, to: string) =>
  Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
const shortDate = (value: string) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" }) : "";

const inputClass =
  "h-11 w-full rounded-xl border border-[#efe3fb] bg-white px-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10";

/** "Get your price": live HanseMerkur prices for a stay in Germany. Nothing is booked here. */
export default function HmrQuote({
  countries,
  reasons,
}: {
  countries: { code: string; name: string }[];
  reasons: { value: string; label: string }[];
}) {
  const defaults = useMemo(() => {
    const arrival = plusDays(14);
    return { arrival: iso(arrival), start: iso(arrival), end: iso(plusDays(364, arrival)) };
  }, []);
  const [form, setForm] = useState({
    birthDate: "",
    arrivalDate: defaults.arrival,
    startDate: defaults.start,
    endDate: defaults.end,
    countryOfResidence: "",
    reason: "STUDENT_PRIVATE",
  });
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setProducts(null);
    setLoading(true);
    try {
      const response = await fetch("/api/hmr/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Prices are not available right now.");
      setProducts(data.products ?? []);
    } catch (quoteError) {
      setError((quoteError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const main = (products ?? []).filter((product) => !product.addOn);
  const addOns = (products ?? []).filter((product) => product.addOn);
  const today = iso(new Date());

  return (
    <section id="get-your-price" className="bg-[#f7f5fb] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">Live prices from HanseMerkur</p>
          <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">Get your price in seconds</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">Five quick questions – no name or email needed.</p>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-2xl border border-[#f0e6fb] bg-white p-4 shadow-[0_10px_35px_rgba(130,10,209,0.06)] sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Date of birth</span>
              <input type="date" required max={today} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Arrival in Germany</span>
              <input type="date" required value={form.arrivalDate} onChange={(e) => set("arrivalDate", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">You live in</span>
              <select required value={form.countryOfResidence} onChange={(e) => set("countryOfResidence", e.target.value)} className={inputClass}>
                <option value="">Please choose</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Cover from</span>
              <input type="date" required min={today} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Cover until</span>
              <input type="date" required min={form.startDate || today} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Reason for your stay</span>
              <select required value={form.reason} onChange={(e) => set("reason", e.target.value)} className={inputClass}>
                {reasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Getting your prices…" : "Show my prices"}
            {!loading ? <ArrowRight size={16} /> : null}
          </button>
          {error ? (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          ) : null}
        </form>

        {products ? (
          <div className="mt-6" aria-live="polite">
            {main.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
                No offers for these details. Please check the dates and the reason for your stay.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-600">
                  {main.length} {main.length === 1 ? "offer" : "offers"} for {days(form.startDate, form.endDate)} days of cover:
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {main.map((product) => (
                    <article key={`${product.insuranceCompany}-${product.productId}`} className="flex flex-col rounded-2xl border border-[#f0e6fb] bg-white p-5 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        {product.insuranceCompany === "ADVIGON" ? "ADVIGON (HanseMerkur group)" : "HanseMerkur"}
                      </p>
                      <h3 className="mt-1 text-base font-bold leading-snug text-gray-900">{product.title}</h3>
                      <p className="mt-3 text-3xl font-black text-[#820ad1]">{money(product.premium, product.currency)}</p>
                      <p className="text-xs text-gray-500">total for the whole period</p>
                      {product.contractBegin && product.contractEnd ? (
                        <p className="mt-2 text-xs text-gray-600">
                          Covers {shortDate(product.contractBegin)} – {shortDate(product.contractEnd)}
                        </p>
                      ) : null}
                      {product.contractEnd && days(product.contractBegin, product.contractEnd) + 2 < days(form.startDate, form.endDate) ? (
                        <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                          Covers only {days(product.contractBegin, product.contractEnd)} of your {days(form.startDate, form.endDate)} days
                        </p>
                      ) : null}
                      {product.coverage.length ? (
                        <ul className="mt-3 space-y-1 text-sm text-gray-700">
                          {product.coverage.map((item) => (
                            <li key={item} className="flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-600" /> {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {product.documents.length ? (
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                          {product.documents.map((document) => (
                            <a
                              key={document.type}
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#820ad1] hover:underline"
                            >
                              <FileText size={12} /> {document.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-auto pt-4">
                        {product.slug ? (
                          <Link
                            href={`/products/incomingvisaseakers/apply/${product.slug}`}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#820ad1] text-sm font-semibold text-white hover:bg-[#6d08b0]"
                          >
                            Choose <ArrowRight size={16} />
                          </Link>
                        ) : (
                          <Link
                            href="/contact"
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#e9d7ff] text-sm font-semibold text-[#820ad1]"
                          >
                            Ask us about this product
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                {addOns.length ? (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm">
                    <p className="font-semibold text-gray-900">Optional add-ons</p>
                    <p className="text-xs text-gray-500">Can be added when you book.</p>
                    <ul className="mt-2 space-y-1">
                      {addOns.map((product) => (
                        <li key={product.productId} className="flex justify-between gap-3 text-gray-700">
                          <span>{product.title}</span>
                          <span className="font-semibold">{money(product.premium, product.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-4 text-xs text-gray-500">
                  Prices come live from HanseMerkur and are final for the details above. You book and pay on HanseMerkur&apos;s secure booking page.
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
