import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Hero'
import Features from '../../components/Features'
import ImmersiveBreak from '../../components/ImmersiveBreak'
import Footer from '../../components/Footer'

function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <Navbar scrollY={scrollY} />
      <Hero scrollY={scrollY} />
      <ImmersiveBreak 
        quote="Somewhere, something incredible is waiting to be known."
        author="Carl Sagan"
        backgroundType="mars"
      />
      <Features />
      <ImmersiveBreak 
        quote="The universe is not only stranger than we imagine, it is stranger than we can imagine."
        author="J.B.S. Haldane"
        backgroundType="iss"
      />
      <Footer />
    </div>
  )
}

export default LandingPage