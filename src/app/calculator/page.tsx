import React from 'react'
import CalculatorHero from '../components/CalculatorComponents/CalculatorHero'
import InsuranceCalculator from '../components/CalculatorComponents/InsuranceCalculator'

function Calculator() {
  return (
    <div className=' bg-gradient-to-r from-[#f5f2fa] to-[#fafbff] pb-4'>
      <CalculatorHero/>
      <InsuranceCalculator/>
    </div>
  )
}

export default Calculator
