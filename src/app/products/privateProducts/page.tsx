"use client";

import { useEffect } from "react";

import WhyPrivateInsurance from "../../components/ProductComponents/WhyPrivateInsurance";
import OurServices from "../../components/ProductComponents/OurServices";
import WeOffers from "@/app/components/ProductComponents/WeOffers ";
import ProductHeroSectionnew from "@/app/components/ProductComponents/ProductHeroSectionnew";
import PrivateFAQ from "@/app/components/ProductComponents/PrivateFaq";
import { trackEvent } from "@/lib/gtag";


function ProductPage() {

  useEffect(() => {
  // console.log("GA Event Fired");

  trackEvent("working_professionals_page_view");
}, []);

  return (
    <div>
      <ProductHeroSectionnew />
      <WeOffers />
      <WhyPrivateInsurance />
      <OurServices />
      <PrivateFAQ />
    </div>
  );
}

export default ProductPage;