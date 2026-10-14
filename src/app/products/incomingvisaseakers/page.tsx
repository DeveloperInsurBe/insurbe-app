import type { Metadata } from "next";

import IncomingHero from "./IncomingHero";
import IncomingInfo from "./IncomingInfo";
import IncomingProducts from "./IncomingProducts";

export const metadata: Metadata = {
  title: "Health Insurance for Visa Seekers & Visitors in Germany | InsurBe",
  description:
    "Visa travel insurance, Young Travel and insurance for foreign guests from HanseMerkur – compare and book online with InsurBe.",
};

export default function IncomingVisaSeekersPage() {
  return (
    <main>
      <IncomingHero />
      <IncomingProducts />
      <IncomingInfo />
    </main>
  );
}
