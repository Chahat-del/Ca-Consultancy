import Hero from '../components/home/Hero'
import Intro from '../components/home/Intro'
import ServicesPreview from '../components/home/ServicesPreview'
import ComplianceCalendar from '../components/home/ComplianceCalendar'
import LatestUpdates from '../components/home/LatestUpdates'
import CTA from '../components/home/CTA'

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <ServicesPreview />
      <ComplianceCalendar />
      <LatestUpdates />
      <CTA />
    </>
  )
}
