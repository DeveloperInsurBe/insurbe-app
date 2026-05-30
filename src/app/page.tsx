import AboutSectionnew from "./components/AboutComponent/AboutSectionnew";
import ChooseUs from "./components/ChooseUs";
import FAQ from "./components/FAQ";
import Featureshome from "./components/Featureshome";
import HeroInsurancenew1 from "./components/HeroInsurancenew1";
import ProductBanner from "./components/ProductBanner";
import SubscribeSteps from "./components/SubscribeSteps";
import FreeConsultation from "./freeConsultation/page";

export default function Home() {
  return (
    <main className="">
      <HeroInsurancenew1 />
      <Featureshome />
      <ChooseUs />
      <ProductBanner />
      <AboutSectionnew />
      <SubscribeSteps/>
      <FreeConsultation/>
     
    </main>
  );
}
