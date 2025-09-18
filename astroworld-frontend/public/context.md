

---

# 🌌 ASTROWORLD — Project Context

## 📖 Overview

ASTROWORLD is an **all-in-one astronomy hub** for enthusiasts, learners, and researchers.
The platform blends **education, exploration, and interaction** through AI, data, and beautiful design.

Users can:

* Explore dynamic **sky maps** and **celestial objects** (planets, stars, exoplanets, asteroids).
* Track **astronomical events** (eclipses, meteor showers, alignments).
* Browse **NASA’s Astronomy Picture of the Day (APOD)**.
* Save and track favorite objects, events, and images.
* Access **curated astronomy/space news**.
* Chat with an **AI assistant** trained on astronomy knowledge.
* Keep **personal journals/observation logs** linked to celestial objects.

---

## 🎯 Core Features

1. **User Authentication & Profiles**

   * Sign up / login system
   * Profile customization (bio, picture, saved content)

2. **Dynamic Sky Maps**

   * Interactive star maps with real celestial coordinates
   * Browse/search objects

3. **Celestial Objects Database**

   * Planets, stars, exoplanets, asteroids with details
   * Linked to NASA/Exoplanet API

4. **Astronomical Events**

   * List of events with date/time, visibility
   * User subscriptions + reminders

5. **APOD Integration**

   * Daily images/videos from NASA APOD API
   * Users can save favorites

6. **AI Astronomy Assistant**

   * Natural language Q\&A about space
   * Personalized interactions saved in user history

7. **User Journals**

   * Log personal observations/research
   * Optionally link to celestial objects

8. **News Feed**

   * Curated space-related news via APIs (NewsAPI, Space.com, etc.)
   * Users can save articles

9. **Community (Optional/Stretch)**

   * Like, comment, share journals
   * Connect with other enthusiasts

---

## 🗄️ Database Schema (PostgreSQL)

### Main Entities

* **users**
* **celestial\_objects**
* **events**
* **apod**
* **news\_articles**
* **journals**
* **ai\_interactions**
* **favorites** (generalized for objects, events, APOD, news)

Relationships:

* 1 user → many favorites, journals, interactions
* Many users ↔ many celestial\_objects (through favorites)
* Many users ↔ many events (through subscriptions/favorites)

---

## ⚙️ Tech Stack

* **Backend**: Django (Python)
* **Frontend**: React + TailwindCSS (modern, responsive UI)
* **Database**: PostgreSQL
* **AI**: OpenAI API (LLM for astronomy Q\&A, guidance)
* **Astronomy APIs/Datasets**:

  * NASA APOD API
  * NASA Exoplanet Archive
  * JPL Horizons / Stellarium (for coordinates)
  * NewsAPI (space news)
* **Auth**: JWT or Django sessions
* **Deployment**: Docker + Render/Heroku/Vercel (frontend)

---

## 🎨 Design & UX

* **Theme**: Dark mode by default, space blue (#1B6CA8 / #0059FF) as primary accent.
* **Typography**: Futuristic headings (Orbitron/Exo 2), clean body (Inter/Open Sans).
* **UI Style**: Modern, card-based, immersive fullscreen backgrounds.
* **Hero Section**: High-res space photography + tagline + CTA.
* **Features Preview**: Scroll-based, animated cards showing major features.
* **Immersive Visuals**: Full-width space photos between sections, parallax animations.

---

## 📅 Timeline (2 Months, Beginner-Friendly)

1. **Week 1–2**: Setup Django + React + PostgreSQL, implement auth & profiles.
2. **Week 3**: Add celestial\_objects & favorites (basic CRUD).
3. **Week 4**: Integrate APOD API + journals.
4. **Week 5**: Add events + subscriptions.
5. **Week 6**: AI Assistant integration (OpenAI API).
6. **Week 7**: News feed + saved articles.
7. **Week 8**: UI polish, responsive design, deployment.

---

## 🌟 Extra/Stretch Features

* 3D celestial object visualizations (using Three.js).
* AR-based sky map (mobile view).
* Social/community interactions (likes, comments).
* Recommendation system for new objects/events.

---

This **context file** tells any LLM everything it needs about:

* Your **goal**
* The **stack & APIs**
* The **schema**
* The **timeline**
* The **design direction**

---
