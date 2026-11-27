import type { Metadata } from "next";

import { getCountriesCollection } from "@/lib/countries";
import { HMR_REASONS, hmrQuotesEnabled } from "@/lib/hmr/quotes";
import HmrQuote from "./HmrQuote";
import IncomingHero from "./IncomingHero";
import IncomingInfo from "./IncomingInfo";
import IncomingProducts from "./IncomingProducts";

export const metadata: Metadata = {
  title: "Health Insurance for Visa Seekers & Visitors in Germany | InsurBe",
  description:
    "Visa travel insurance, Young Travel and insurance for foreign guests from HanseMerkur – compare and book online with InsurBe.",
};

/** Countries for "You live in" (Germany is left out: these products are for people coming to Germany). */
async function residenceCountries() {
  try {
    const countries = await getCountriesCollection();
    return countries
      .filter((country) => country.cca2 && country.cca2 !== "DE" && country.name?.common)
      .map((country) => ({ code: country.cca2, name: country.name.common }));
  } catch {
    return [];
  }
}

export default async function IncomingVisaSeekersPage() {
  // Live HanseMerkur prices only when HMR_API_ENABLED=true; otherwise the page is unchanged.
  const quotes = hmrQuotesEnabled();
  const countries = quotes ? await residenceCountries() : [];

  return (
    <main>
      <IncomingHero />
      {quotes ? <HmrQuote countries={countries} reasons={HMR_REASONS.map((reason) => ({ ...reason }))} /> : null}
      <IncomingProducts />
      <IncomingInfo />
    </main>
  );
}
