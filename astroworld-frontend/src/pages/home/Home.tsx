import React, { useEffect, useRef, useState } from 'react';
import type { StellariumEngine } from '../../types/stellarium';
import StelButton from '../../components/StelButton';
import Navbar from '../../components/Navbar';
import { getTitle, getInfos } from '../../utils/stellarium';

const Home: React.FC = () => {
  const [stel, setStel] = useState<StellariumEngine | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInitialized = useRef(false);

  useEffect(() => {
    if (engineInitialized.current || !canvasRef.current) return;
    engineInitialized.current = true;

    // Track scroll position for navbar
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Load required scripts
    const loadScripts = async () => {
      // Load Stellarium Web Engine
      const script3 = document.createElement('script');
      script3.src = '/astroworld-engine/stellarium-web-engine.js';
      document.head.appendChild(script3);

      await new Promise(resolve => script3.onload = resolve);

      // Initialize Stellarium Web Engine
      (window as any).StelWebEngine({
        wasmFile: '/astroworld-engine/stellarium-web-engine.wasm',
        canvas: canvasRef.current!,
        // Simple fallback translation function that returns the string as-is
        translateFn: (_domain: string, str: string) => {
          return str; // Return the original string for now
        },
        onReady: (stellariumEngine: StellariumEngine) => {
          setStel(stellariumEngine);
          
          // Add all data sources with corrected paths
          // Use local data from the public directory
          const baseUrl = '/data/test-skydata/';
          const core = stellariumEngine.core;

          core.stars.addDataSource({ url: baseUrl + 'stars' });
          core.skycultures.addDataSource({ url: baseUrl + 'skycultures/western', key: 'western' });
          core.dsos.addDataSource({ url: baseUrl + 'dso' });
          core.landscapes.addDataSource({ url: baseUrl + 'landscapes/guereins', key: 'guereins' });
          core.milkyway.addDataSource({ url: baseUrl + 'surveys/milkyway' });
          core.minor_planets.addDataSource({ url: baseUrl + 'mpcorb.dat', key: 'mpc_asteroids' });
          core.planets.addDataSource({ url: baseUrl + 'surveys/sso/moon', key: 'moon' });
          core.planets.addDataSource({ url: baseUrl + 'surveys/sso/sun', key: 'sun' });
          core.planets.addDataSource({ url: baseUrl + 'surveys/sso/moon', key: 'default' });
          core.comets.addDataSource({ url: baseUrl + 'CometEls.txt', key: 'mpc_comets' });
          core.satellites.addDataSource({ url: baseUrl + 'tle_satellite.jsonl.gz', key: 'jsonl/sat' });

          // Enable star name labels on the canvas
          if (core.stars) {
            console.log('Stars object properties:', Object.keys(core.stars));
            console.log('Stars object:', core.stars);

            // Try different approaches to enable star names
            if (typeof core.stars.names_visible !== 'undefined') {
              core.stars.names_visible = true;
            }
            if (typeof core.stars.designations_visible !== 'undefined') {
              core.stars.designations_visible = true;
            }
            if (typeof core.stars.proper_names_visible !== 'undefined') {
              core.stars.proper_names_visible = true;
            }
            if (typeof core.stars.labels_visible !== 'undefined') {
              core.stars.labels_visible = true;
            }
            if (typeof core.stars.show_names !== 'undefined') {
              core.stars.show_names = true;
            }

            // Set magnitude limits
            if (typeof core.stars.max_mag_names !== 'undefined') {
              core.stars.max_mag_names = 6.0;
            }
            if (typeof core.stars.mag_limit !== 'undefined') {
              core.stars.mag_limit = 6.0;
            }
          }  

          // Force UI update when there is any change
          stellariumEngine.change((_obj: any, attr: string) => {
            if (attr !== "hovered") {
              // Force a complete re-render by updating the state
              setStel({ ...stellariumEngine });
            }
          });

          
        }
      });
    };

    loadScripts().catch(console.error);

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      {!isFullscreen && <Navbar scrollY={scrollY} showLoginButton={false} isFullscreen={isFullscreen} />}

      {/* Main Content */}
      <main className="pt-16 h-screen relative">
        <canvas
          ref={canvasRef}
          id="stel-canvas"
          className="absolute inset-0 w-full h-full"
        />

        {/* Selection Info Card */}
        {(() => {
          const hasSelection = stel && stel.core.selection;

          if (hasSelection) {
            return (
              <div
                className="absolute top-20 left-4 w-96 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-white"
                style={{ zIndex: 1000 }}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3 text-white">
                    {getTitle(stel.core.selection)}
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      try {
                        return getInfos(stel, stel.core.selection).map((info, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2">
                            <div className="text-gray-300 text-sm">{info.key}</div>
                            <div
                              className="col-span-2 text-sm font-medium text-white"
                              dangerouslySetInnerHTML={{ __html: info.value }}
                            />
                          </div>
                        ));
                      } catch (error) {
                        console.error('Error getting infos:', error);
                        return <div className="text-red-400">Error loading object info</div>;
                      }
                    })()}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })()}
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-transparent">
        <div className="flex items-center justify-center space-x-4 py-4">
          <StelButton
            label="Constellations"
            img="/static/imgs/symbols/btn-cst-lines.svg"
            obj={stel?.core.constellations || null}
            attr="lines_visible"
          />
          <StelButton
            label="Atmosphere"
            img="/static/imgs/symbols/btn-atmosphere.svg"
            obj={stel?.core.atmosphere || null}
            attr="visible"
          />
          <StelButton
            label="Landscape"
            img="/static/imgs/symbols/btn-landscape.svg"
            obj={stel?.core.landscapes || null}
            attr="visible"
          />
          <StelButton
            label="Azimuthal Grid"
            img="/static/imgs/symbols/btn-azimuthal-grid.svg"
            obj={stel?.core.lines.azimuthal || null}
            attr="visible"
          />
          <StelButton
            label="Equatorial Grid"
            img="/static/imgs/symbols/btn-equatorial-grid.svg"
            obj={stel?.core.lines.equatorial || null}
            attr="visible"
          />
          <StelButton
            label="Nebulae"
            img="/static/imgs/symbols/btn-nebulae.svg"
            obj={stel?.core.dsos || null}
            attr="visible"
          />
          <StelButton
            label="DSS"
            img="/static/imgs/symbols/btn-nebulae.svg"
            obj={stel?.core.dss || null}
            attr="visible"
          />
        </div>

        {/* Fullscreen Button */}
        {!isFullscreen && (
          <div className="flex justify-center mt-6">
            <button
              onClick={toggleFullscreen}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              
              <span className="hidden sm:inline transition-opacity duration-300 group-hover:opacity-100 opacity-80">
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default Home;