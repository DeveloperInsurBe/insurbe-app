import React from 'react'
import FAQ from '../../components/FAQ'
import OurServices from '../../components/ProductComponents/OurServices'
import PensionProductHeroSection from '@/app/components/ProductComponents/pensionProductHeroSection'
import PrivatePensionSection from '@/app/components/ProductComponents/PrivatePensionSection'
import PensionPlansSection from '@/app/components/ProductComponents/PensionPlansSection'
import PensionFormSection from '@/app/components/ProductComponents/PensionFormSection'

function PensionPlans() {
  return (
    <div>
      <PensionProductHeroSection/>
      <PrivatePensionSection/>
      <PensionPlansSection/>
      <PensionFormSection/>
      <OurServices/>
      <FAQ/>
    </div>
  )
}

export default PensionPlans
