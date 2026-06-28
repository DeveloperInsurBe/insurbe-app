import BlockedAccountSection from "../components/blockedAccountComponent/BlockedAccountSection";
import DashboardFeaturesSection from "../components/blockedAccountComponent/DashboardFeaturesSection";
import FAQSection from "../components/blockedAccountComponent/FAQSection";
import HealthInsuranceSection from "../components/blockedAccountComponent/HealthInsuranceSection";
import HeroSectionHome from "../components/blockedAccountComponent/HeroSectionHome";
import PartnersSection from "../components/blockedAccountComponent/PartnersSection";
import StepsSection from "../components/blockedAccountComponent/StepsSection";
import SupportSection from "../components/blockedAccountComponent/SupportSection";

export default function BlockedAccountPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden ">
      <HeroSectionHome/>
      <PartnersSection/>
      <StepsSection/>
      <DashboardFeaturesSection/>
      <BlockedAccountSection/>
      <HealthInsuranceSection/>
      <SupportSection/>
      <FAQSection/>
    </div>
  );
}