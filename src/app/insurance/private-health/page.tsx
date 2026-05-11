"use client";

import { useEffect } from "react";

import PrivatePublicInsuranceHeroSection from "./PrivatePublicInsuranceHeroSection";
import PrivatePublicInsuranceBenefits from "./PrivatePublicInsuranceBenefits";
import PrivatePublicInsuranceFAQ from "./PrivatePublicFaq";
import PrivateInsuranceSteps from "./PrivateInsuranceSteps";
import PrivateInsuranceTariffs from "./PrivateInsuranceTariffs";

import { trackEvent } from "@/lib/gtag";

function PrivateHealthPage() {

  useEffect(() => {
    trackEvent("private_health_page_view");
  }, []);

  return (
    <section className="">
      <PrivatePublicInsuranceHeroSection />
      <PrivatePublicInsuranceBenefits />
      <PrivateInsuranceTariffs />
      <PrivateInsuranceSteps />
      <PrivatePublicInsuranceFAQ />
    </section>
  );
}

export default PrivateHealthPage;