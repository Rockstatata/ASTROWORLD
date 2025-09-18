import type { HeroProps } from '../types'
import Earth from '../assets/images/Earth.jpg'

const Hero = ({ scrollY }: HeroProps) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${Earth})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      >
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Main Title */}
        <h1 className="text-7xl md:text-9xl lg:text-[100] font-space-mono font-bold mb-6">
          <span className="bg-gradient-to-b from-black via-space-blue-dark to-black bg-clip-text text-transparent">
            ASTROWORLD
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl lg:text-3xl text-black mb-4 font-bold">
          Explore the Universe at Your Fingertips
        </p>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-black font-bold mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover exoplanets, track celestial events, browse NASA's daily images, 
          and learn with our AI astronomy assistant. Your cosmic journey starts here.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="group bg-space-gradient hover:shadow-2xl hover:shadow-space-violet/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
            <span className="flex items-center">
              Get Started
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <button className="border-2 border-space-blue-light hover:border-space-blue text-space-blue-lightest hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-space-bright/10">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero