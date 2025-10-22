import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MapPin, Clock } from "lucide-react";

const LiveSkyPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>("Detecting location...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSkyClick = () => {
    navigate('/skymap');
  };

  // Simple animated starfield for preview
  const createStarField = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: Array<{x: number, y: number, brightness: number, twinkle: number}> = [];
    const numStars = 150;

    // Generate random stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        brightness: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgb(25, 25, 112)'); // Midnight blue
      gradient.addColorStop(0.5, 'rgb(72, 61, 139)'); // Dark slate blue
      gradient.addColorStop(1, 'rgb(25, 25, 112)'); // Midnight blue
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star, index) => {
        const twinkle = Math.sin(time + star.twinkle) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
        ctx.fill();

        // Add some larger, brighter stars
        if (index % 10 === 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Add constellation lines (simplified)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const startStar = stars[i * 20];
        const endStar = stars[i * 20 + 10];
        if (startStar && endStar) {
          ctx.moveTo(startStar.x, startStar.y);
          ctx.lineTo(endStar.x, endStar.y);
        }
      }
      ctx.stroke();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Create animated starfield
    const cleanup = createStarField(canvas);
    setLoading(false);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        },
        () => {
          setLocation("Location unavailable");
        }
      );
    } else {
      setLocation("Location not supported");
    }

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      cleanup?.();
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Real-Time Sky View
          </h2>
          <p className="text-gray-400 text-lg">
            Observe your live night sky powered by Stellarium Web Engine
          </p>
        </div>

        <div className="relative group">
          <div 
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
            onClick={handleSkyClick}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Live Sky Preview</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSkyClick}
                className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-medium transition-all flex items-center gap-2 group-hover:scale-105 duration-300"
              >
                <Eye className="h-4 w-4" />
                Open Full Skymap
              </button>
            </div>

            {/* Sky Canvas */}
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-300 text-sm">Loading sky view...</p>
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="w-full h-[400px] rounded-xl bg-gradient-to-b from-indigo-900 via-purple-900 to-black"
                width={800}
                height={400}
              />
              
              {/* Overlay hint */}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm">Click to explore full sky</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSkyPreview;
