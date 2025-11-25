import React from 'react'
import AboutHeroSection from '../components/AboutUsComponents/AboutHeroSection'
import AboutPlatformSection from '../components/AboutUsComponents/AboutPlatformSection'
import MeetTheTeamSection from '../components/AboutUsComponents/MeetTheTeamSection'
import ExpansionSection from '../components/AboutUsComponents/ExpansionSection'
import Growth from '../components/AboutUsComponents/AboutGrowth'
import AboutGrowth from '../components/AboutUsComponents/AboutGrouwth'
import AboutPartners from '../components/AboutUsComponents/AboutPartners'
import AboutJourney from '../components/AboutUsComponents/AboutJourney'

function About() {
  return (
    <div>
      <AboutHeroSection/>
      <AboutPlatformSection/>
      <MeetTheTeamSection/>
      <ExpansionSection/>
      <AboutGrowth/>
      <Growth/>
      <AboutPartners/>
      <AboutJourney/>
    </div>
  )
}

export default About
