"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PublicInsuranceBenefits from "./PublicInsuranceBenefits";
import FirstExpatHero from "./FirstExpatHero";
import PublicInsuranceHeroSection from "./PublicInsuranceHeroSection";
import ProviderComparison from "./ProviderComparison";
import InsuranceSteps from "../InsuranceSteps";
import PublicInsuranceFAQ from "./PublicFaq";
import InsuranceCalculatorPrivate from "../InsuranceCalculatorPrivate";

import { trackEvent } from "@/lib/gtag";

export default function PublicHealthPage() {

  useEffect(() => {
    trackEvent("public_health_page_view");
  }, []);

  type PremiumBreakdown = {
    healthContribution: number;
    zusatzContribution: number;
    careContribution: number;
    total: number;
  };

  const [premium, setPremium] = useState<PremiumBreakdown | null>(null);

  return (
    <section className="">
      <PublicInsuranceHeroSection />
      <PublicInsuranceBenefits />
      <InsuranceCalculatorPrivate
        setPremium={setPremium}
        premium={premium}
      />
      <ProviderComparison premium={premium} />
      <FirstExpatHero />
      <InsuranceSteps />
      <PublicInsuranceFAQ />
    </section>
  );
}