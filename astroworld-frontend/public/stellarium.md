To use the Stellarium Web Engine in another project, follow these steps based on the stellarium-web-engine.html example:

1. Build and Copy Files
Ensure the engine is built successfully (as you did).
Copy stellarium-web-engine.js and stellarium-web-engine.wasm from build to your project's static assets directory (e.g., public/js/ or similar).
2. Include in Your HTML
Add the script tag to your HTML file:

<script src="path/to/stellarium-web-engine.js"></script>

3. Initialize the Engine
In your JavaScript code (e.g., in a Vue component or plain JS):

StelWebEngine({
  wasmFile: 'path/to/stellarium-web-engine.wasm',  // Path to the WASM file
  canvas: document.getElementById('your-canvas-id'),  // Your canvas element
  translateFn: function(domain, str) { return str; },  // Optional translation function
  onReady: function(stel) {
    // Engine is ready; add data sources and configure
    var baseUrl = 'path/to/data/';  // Path to data sources (see below)
    stel.core.stars.addDataSource({ url: baseUrl + 'stars' });
    stel.core.skycultures.addDataSource({ url: baseUrl + 'skycultures/western', key: 'western' });
    // Add more sources as needed (e.g., planets, DSOs)
    
    // Example: Set observer location
    stel.core.observer.longitude = 0;  // Degrees
    stel.core.observer.latitude = 45;
    
    // Example: Listen for changes
    stel.change(function(obj, attr) {
      console.log('Changed:', obj, attr);
    });
  }
});

4. Add Data Sources
Copy or host the data from test-skydata (e.g., stars, skycultures, surveys) to your project's server.
Use relative or absolute URLs in addDataSource calls.
For minimal setup, start with stars and skycultures.
5. Customize and Control
Use the JavaScript API (e.g., stel.core.fov = 1.0; to set field of view, or stel.zoomTo(0.5); to zoom).
Refer to src/js/pre.js for available functions like zoomTo, on for events, and setFont.
For advanced features, explore src/js/obj.js for object manipulation.
Notes
Ensure your server serves the WASM file with the correct MIME type (application/wasm).
For production, bundle data sources or use HiPS surveys for online access.
If using Vue (like the example), integrate with your framework's lifecycle.
Check browser console for errors; ensure WebAssembly and WebGL2 support.
If you need help with specific integrations or API details, provide more context about your project.