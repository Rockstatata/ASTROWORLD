# NASA API Integration Guide

## Overview
AstroWorld now integrates multiple NASA APIs to provide real-time space data and stunning imagery directly on the home page.

## Features Implemented

### 1. **APOD Hero Section**
- Displays NASA's Astronomy Picture of the Day as a cinematic hero banner
- Includes title, date, and copyright information
- Smooth fade-in animations

### 2. **Space Weather Alerts (DONKI)**
- Real-time notifications from NASA's Space Weather Database Of Notifications
- Displays solar flares, coronal mass ejections, and other space weather events
- Card-based layout with animations

### 3. **Near-Earth Objects (NeoWs)**
- Shows asteroids and comets passing close to Earth
- Highlights potentially hazardous asteroids (PHA)
- Displays diameter, velocity, and miss distance
- Updates daily

### 4. **Earth Images (EPIC)**
- Latest photos of Earth from the DSCOVR satellite
- 1 million miles away from Earth perspective
- Lightbox view for full-size images
- Natural color imagery

### 5. **Mars Rover Photos**
- Recent images from NASA's Curiosity rover
- Shows camera type and capture date
- Interactive gallery with full-screen view
- Real photos from the Red Planet

### 6. **Exoplanet Statistics**
- Live count of confirmed exoplanets
- Data from NASA/Caltech Exoplanet Archive
- Animated counter with sparkle effects
- Statistics cards showing diversity

### 7. **Starry Background**
- Animated canvas-based starfield
- Twinkling stars with varying sizes
- Cosmic nebula overlays
- Shooting star effects
- Fully responsive

## Setup Instructions

### 1. Get NASA API Key
Visit [NASA API Portal](https://api.nasa.gov/) and sign up for a free API key.

### 2. Configure Environment Variables
Create a `.env` file in `astroworld-frontend/` directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your NASA API key:

```env
VITE_NASA_API_KEY=your_actual_api_key_here
```

**Note:** You can use `DEMO_KEY` for testing, but it has rate limits (30 requests/hour, 50 requests/day).

### 3. Install Dependencies
```bash
cd astroworld-frontend
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the updated home page with NASA data.

## API Endpoints Used

| API | Endpoint | Purpose |
|-----|----------|---------|
| APOD | `/planetary/apod` | Astronomy Picture of the Day |
| DONKI | `/DONKI/notifications` | Space weather alerts |
| NeoWs | `/neo/rest/v1/feed` | Near-Earth asteroids |
| EPIC | `/EPIC/api/natural` | Earth imagery |
| Mars Rovers | `/mars-photos/api/v1/rovers/{rover}/latest_photos` | Mars photos |
| Exoplanet Archive | Caltech TAP Service | Confirmed exoplanet count |

## Rate Limits

### Demo Key
- 30 requests per hour
- 50 requests per day

### Personal Key (Free)
- 1,000 requests per hour
- No daily limit

## Component Architecture

```
src/
├── services/
│   └── nasa/
│       └── nasaAPI.ts          # Centralized NASA API client
├── hooks/
│   └── nasa/
│       ├── useApod.ts          # APOD hook
│       ├── useDonki.ts         # DONKI hook
│       ├── useNeoWs.ts         # NeoWs hook
│       ├── useEpic.ts          # EPIC hook
│       ├── useMars.ts          # Mars hook
│       └── useExoplanets.ts    # Exoplanet hook
└── components/
    └── Home/
        ├── ApodHero.tsx        # Hero with APOD
        ├── StarryBackground.tsx # Animated stars
        ├── DonkiPanel.tsx      # Space weather
        ├── NeoWsPanel.tsx      # Asteroids
        ├── EpicPanel.tsx       # Earth images
        ├── MarsPanel.tsx       # Mars photos
        └── ExoplanetStat.tsx   # Exoplanet counter
```

## Customization

### Adjust Data Limits
Edit the hook parameters in `Home.tsx`:

```tsx
// Show more/fewer items
<DonkiPanel /> // Default: 6 events
<NeoWsPanel /> // Default: 6 objects
<EpicPanel />  // Default: 6 images
<MarsPanel />  // Default: 6 photos
```

### Change Rover
In `MarsPanel.tsx`, change the rover name:

```tsx
const { photos } = useMars('curiosity', 6); // or 'opportunity', 'spirit'
```

### Modify Animations
All components use Framer Motion. Adjust transition values:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }} // Adjust duration
>
```

## Performance Considerations

1. **Caching**: Hooks use local state; consider adding React Query for better caching
2. **Loading States**: All components show skeleton loaders
3. **Error Handling**: Graceful fallbacks for API failures
4. **Lazy Loading**: Images use `loading="lazy"` attribute
5. **Background**: Canvas-based stars are performance-optimized

## Troubleshooting

### API Key Not Working
- Verify key in `.env` file
- Restart development server after changing `.env`
- Check console for error messages

### Rate Limit Exceeded
- Upgrade from DEMO_KEY to personal key
- Implement caching layer
- Reduce component refresh rates

### Images Not Loading
- Check CORS settings
- Verify NASA API status at [status.nasa.gov](https://status.nasa.gov)
- Check network tab for failed requests

### Slow Performance
- Reduce star count in `StarryBackground.tsx`
- Limit number of components on page
- Enable browser hardware acceleration

## Additional Resources

- [NASA API Documentation](https://api.nasa.gov/)
- [APOD API](https://github.com/nasa/apod-api)
- [Mars Rover Photos API](https://github.com/chrisccerami/mars-photo-api)
- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
- [DONKI Documentation](https://ccmc.gsfc.nasa.gov/support/DONKI-webservices.php)

## Future Enhancements

- [ ] Add ISS tracking (using ISS location API)
- [ ] Implement solar system 3D visualization
- [ ] Add Webb Telescope imagery
- [ ] Include astronomical events calendar
- [ ] Add user favorites/bookmarking
- [ ] Implement data caching with service workers
- [ ] Add sharing functionality for images
- [ ] Create downloadable reports

## Credits

All data and imagery provided by NASA and its partners. AstroWorld is not affiliated with or endorsed by NASA.
