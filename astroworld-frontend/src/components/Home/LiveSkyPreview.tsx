import React, { useEffect, useRef } from "react";

const LiveSkyPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Optional mini Stellarium engine instance
    // Use a lightweight subset of your Skymap initialization
  }, []);

  return (
    <section className="relative py-20 px-6 text-center">
      <h2 className="text-4xl font-bold mb-6">Real-Time Sky</h2>
      <p className="text-gray-400 mb-8">
        Observe your live night sky powered by Stellarium Web Engine.
      </p>
      <div className="mx-auto max-w-4xl bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg p-4 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] rounded-2xl bg-black"
        />
      </div>
    </section>
  );
};

export default LiveSkyPreview;
