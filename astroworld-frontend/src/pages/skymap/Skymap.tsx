import React, { useEffect, useRef, useState } from 'react';
import type { StellariumEngine } from '../../types/stellarium';
import StelButton from '../../components/Skymap/StelButton';
import Layout from '../../components/Layout';
import { getTitle, getInfos } from '../../utils/stellarium';

const Skymap: React.FC = () => {
  const [stel, setStel] = useState<StellariumEngine | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInitialized = useRef(false);

  useEffect(() => {
    if (engineInitialized.current || !canvasRef.current) return;
    engineInitialized.current = true;

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

          // Log constellation properties to check for images_visible
          if (core.constellations) {
            console.log('Constellation object properties:', Object.keys(core.constellations));
            console.log('Constellation object:', core.constellations);
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
    return () => {
      // Cleanup will be handled by Layout component
    };
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
    <Layout
      showLoginButton={false}
      isFullscreen={isFullscreen}
      mainClassName="pt-16 h-screen relative"
      footer={
        <footer className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl px-6 py-3">
            <div className="flex items-center justify-center space-x-2">
              <StelButton
                label="Constellations"
                img="/static/imgs/symbols/btn-cst-lines.svg"
                obj={stel?.core.constellations || null}
                attr="lines_visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Constellation Art"
                img="/static/imgs/symbols/btn-constellation-names.svg"
                obj={stel?.core.constellations || null}
                attr="images_visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Atmosphere"
                img="/static/imgs/symbols/btn-atmosphere.svg"
                obj={stel?.core.atmosphere || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Landscape"
                img="/static/imgs/symbols/btn-landscape.svg"
                obj={stel?.core.landscapes || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Azimuthal Grid"
                img="/static/imgs/symbols/btn-azimuthal-grid.svg"
                obj={stel?.core.lines.azimuthal || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Equatorial Grid"
                img="/static/imgs/symbols/btn-equatorial-grid.svg"
                obj={stel?.core.lines.equatorial || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="Nebulae"
                img="/static/imgs/symbols/btn-nebulae.svg"
                obj={stel?.core.dsos || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              <StelButton
                label="DSS"
                img="/static/imgs/symbols/btn-nebulae.svg"
                obj={stel?.core.dss || null}
                attr="visible"
              />
              <div className="w-px h-12 bg-gray-700/50" />
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="group relative w-16 h-16 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-200"
                title="Enter Fullscreen"
              >
                <svg className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Fullscreen
                </div>
              </button>
            </div>
          </div>
        </footer>
      }
    >
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
    </Layout>
  );
};

export default Skymap;