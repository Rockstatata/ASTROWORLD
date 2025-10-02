import type { ImmersiveBreakProps } from '../../types'
import ISS from '../../assets/images/ISS.jpg'
import Space from '../../assets/images/space.jpg'



const ImmersiveBreak = ({ quote, author, backgroundType = 'iss' }: ImmersiveBreakProps) => {
  const backgroundImage = backgroundType === 'iss' ? ISS : Space
  
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
        
        {/* Subtle animated particles */}
        
      </div>

      {/* Quote Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Decorative border */}
        <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-space-bright/20 to-transparent h-0.5 top-0" />
        
        <blockquote className="text-2xl md:text-4xl lg:text-5xl font-light text-white leading-relaxed mb-8 font-space-mono">
          <span className="text-6xl md:text-8xl text-space-bright/60 font-serif leading-none">"</span>
          <span className="relative -top-4 md:-top-6">{quote}</span>
          <span className="text-6xl md:text-8xl text-space-bright/60 font-serif leading-none">"</span>
        </blockquote>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="w-12 h-0.5 bg-space-gradient" />
          <cite className="text-lg md:text-xl text-space-blue-lightest font-medium font-space-mono tracking-wide">
            {author}
          </cite>
          <div className="w-12 h-0.5 bg-space-gradient" />
        </div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-space-bright rounded-full animate-pulse opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-space-violet rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-space-pink rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}} />
      </div>
    </section>
  )
}

export default ImmersiveBreak