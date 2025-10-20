# 🚀 Quick Start Guide - ASTROWORLD NASA Features

## For Developers New to the Project

### Step 1: Get Your NASA API Key (2 minutes)
1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the simple form (name, email)
3. Check your email for the API key
4. Copy the key (it looks like: `abc123xyz456...`)

### Step 2: Setup (5 minutes)

**Option A: Automated Setup (Windows PowerShell)**
```powershell
cd astroworld-frontend
.\setup.ps1
```
This will:
- Create your `.env` file
- Install dependencies
- Guide you through API key setup

**Option B: Manual Setup**
```bash
cd astroworld-frontend

# Create .env file
cp .env.example .env

# Edit .env and add your NASA API key
# Replace DEMO_KEY with your actual key

# Install dependencies
npm install
```

### Step 3: Run (1 minute)
```bash
npm run dev
```

Visit `http://localhost:5173` and enjoy! 🌟

## What You'll See

### Home Page Features
1. **Animated Starfield** - Twinkling stars background
2. **NASA APOD Hero** - Daily astronomy photo
3. **Space Weather Alerts** - Solar flares and CMEs
4. **Asteroid Tracker** - Near-Earth objects
5. **Earth from Space** - DSCOVR satellite images
6. **Mars Photos** - Latest from Curiosity rover
7. **Exoplanet Counter** - Live count from NASA

### All Features Are:
- ✅ Fully animated
- ✅ Responsive (mobile/tablet/desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Click to expand images
- ✅ Real-time NASA data

## Troubleshooting

### "Loading..." Never Finishes
- Check your internet connection
- Verify NASA API key in `.env`
- Restart dev server after editing `.env`

### API Rate Limit Error
- DEMO_KEY allows 30 requests/hour
- Get your personal key (1,000 requests/hour)
- Clear browser cache

### Images Not Showing
- NASA APIs may have temporary outages
- Check browser console for errors
- Try refreshing the page

## Customization

### Want More/Fewer Items?
Edit the component calls in `src/pages/home/Home.tsx`:

```tsx
<DonkiPanel />      // Shows 6 alerts by default
<NeoWsPanel />      // Shows 6 asteroids
<EpicPanel />       // Shows 6 Earth images
<MarsPanel />       // Shows 6 Mars photos
```

### Change Animation Speed?
Edit transition durations in any component:

```tsx
transition={{ duration: 0.6 }} // Make it 1.0 for slower
```

### Different Mars Rover?
In `MarsPanel.tsx`:
```tsx
useMars('opportunity', 6) // or 'spirit'
```

## Learn More

- **Full Documentation**: See `NASA_INTEGRATION.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **NASA API Docs**: [https://api.nasa.gov/](https://api.nasa.gov/)

## Need Help?

1. Check the documentation files
2. Look at browser console for errors
3. Verify `.env` configuration
4. Ensure backend is running (if needed)

## Pro Tips 💡

1. **Use Personal API Key**: DEMO_KEY has low limits
2. **Clear Cache**: If data seems stale
3. **Monitor Console**: Useful warnings appear there
4. **Explore Components**: Each has unique interactions
5. **Mobile Testing**: Looks great on phones too!

---

**Happy exploring! 🌌✨**

Time to see the cosmos come alive! 🚀
