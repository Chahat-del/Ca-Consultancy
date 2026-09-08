import Hero from '../components/home/Hero'
import Intro from '../components/home/Intro'
import ServicesPreview from '../components/home/ServicesPreview'
import LatestUpdates from '../components/home/LatestUpdates'
import Testimonials from '../components/home/Testimonials'
import CTA from '../components/home/CTA'

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <ServicesPreview />
      <LatestUpdates />
      <Testimonials />
      <CTA />
    </>
  )
}
