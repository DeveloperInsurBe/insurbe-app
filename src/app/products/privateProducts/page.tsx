import React from "react";
import ProductHeroSection from "../../components/ProductComponents/productHeroSection";
import CardsSection from "../../components/ProductComponents/CardsSection";
import WhyPrivateInsurance from "../../components/ProductComponents/WhyPrivateInsurance";
import FAQ from "../../components/FAQ";
import OurServices from "../../components/ProductComponents/OurServices";
import WeOffers from "@/app/components/ProductComponents/WeOffers ";

function ProductPage() {
  return (
    <div>
      <ProductHeroSection />
      <CardsSection />
      <WeOffers />
      <WhyPrivateInsurance />
      {/* <InsuranceSteps /> */}
      <OurServices />

      <FAQ />
    </div>
  );
}

export default ProductPage;
