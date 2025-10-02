import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Landing/Hero'
import Features from '../../components/Landing/Features'
import ImmersiveBreak from '../../components/Landing/ImmersiveBreak'
import Footer from '../../components/Footer'

function LandingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Redirect logged-in users to home
  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true })
    }
  }, [user, loading, navigate])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
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