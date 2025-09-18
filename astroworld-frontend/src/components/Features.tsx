import { useState, useEffect, useRef } from 'react'
import Moon from '../assets/images/Moon.jpg'

const Features = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const featuresRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      icon: "🔭",
      title: "Explore Celestial Objects",
      description: "Browse through thousands of stars, planets, exoplanets, and asteroids with detailed information and real coordinates."
    },
    {
      icon: "🌌",
      title: "NASA Picture of the Day",
      description: "Discover breathtaking space imagery daily from NASA's APOD archive. Save your favorites and build your collection."
    },
    {
      icon: "📓",
      title: "Personal Journals",
      description: "Keep detailed observation logs, attach images, and link entries to specific celestial objects for organized research."
    },
    {
      icon: "🎉",
      title: "Astronomical Events",
      description: "Never miss an eclipse, meteor shower, or planetary alignment. Get personalized reminders for visible events."
    },
    {
      icon: "📰",
      title: "Curated Space News",
      description: "Stay updated with the latest space discoveries and missions from trusted sources, filtered and organized for you."
    },
    {
      icon: "🤖",
      title: "AI Astronomy Assistant",
      description: "Chat with our intelligent AI trained on astronomy knowledge. Ask questions and get personalized guidance anytime."
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleCards(prev => [...prev, cardIndex])
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = featuresRef.current?.querySelectorAll('.feature-card')
    cards?.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-24 px-4 overflow-hidden" ref={featuresRef}>
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${Moon})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/90" />
        
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-space-bright rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-inter font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-space-bright to-space-violet">
              Cosmic Features
            </h2>
            <div className="h-1 bg-space-gradient rounded-full mb-6" />
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-space-mono">
            Everything you need to explore, learn, and discover the wonders of our universe
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`feature-card group relative bg-gray-900/60 backdrop-blur-lg border border-space-violet/30 rounded-3xl p-8 transition-all duration-700 hover:border-space-bright/60 hover:shadow-2xl hover:shadow-space-violet/30 hover:transform hover:scale-105 hover:-translate-y-2 ${
                visibleCards.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
              }`}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-space-violet/20 via-space-bright/20 to-space-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              
              {/* Icon with glow effect */}
              <div className="relative mb-6">
                <div className="text-7xl mb-2 group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-[0_0_20px_rgba(255,145,225,0.5)]">
                  {feature.icon}
                </div>
                <div className="absolute inset-0 bg-space-bright/20 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-inter font-semibold mb-4 text-white group-hover:text-space-bright transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed font-space-mono text-base">
                {feature.description}
              </p>

              {/* Decorative corner elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-space-bright rounded-full opacity-60 animate-pulse" />
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-space-violet rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}} />
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-space-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features