import ChooseUs from "./components/ChooseUs";
import Expectations from "./components/Expectations";
import FAQ from "./components/FAQ";
import HeroSection1 from "./components/HeroSection1";
import Partners from "./components/Partners";
import ProductBanner from "./components/ProductBanner";

export default function Home() {
  return (
    <main>
      {/* new home page designed  */}
      <HeroSection1/>
      <Partners />
      <ChooseUs />
      <ProductBanner />
      <Expectations />
      <FAQ />
    </main>
  );
}
