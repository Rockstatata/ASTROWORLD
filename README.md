
<div align="center">

# 🌌 ASTROWORLD
### *Your Gateway to the Cosmos*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NASA API](https://img.shields.io/badge/NASA-API-E03C31?style=for-the-badge&logo=nasa&logoColor=white)](https://api.nasa.gov/)

**A comprehensive, full-stack astronomical exploration platform that transforms NASA's vast data repositories into an immersive cosmic experience.**

[🚀 Features](#-features) • [📸 Screenshots](#-screenshots) • [🛠️ Tech Stack](#️-tech-stack) • [⚡ Quick Start](#-quick-start) • [📖 Documentation](#-documentation)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Integrations](#-api-integrations)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ASTROWORLD** is not just another space app—it's a **complete astronomical ecosystem** that brings together cutting-edge web technologies, real-time space data, AI-powered assistance, and stunning 3D visualization to create an unparalleled cosmic exploration experience.

### 🎯 Vision
To democratize space exploration by making complex astronomical data accessible, interactive, and engaging for enthusiasts, students, researchers, and anyone fascinated by the cosmos.

### ✨ What Makes It Special

- 🌍 **17+ NASA APIs** integrated in real-time
- 🔭 **3D Sky Visualization** powered by Stellarium Web Engine (WebAssembly + WebGL)
- 🤖 **AI-Powered Assistant** for personalized cosmic guidance
- 📊 **200+ React Components** with enterprise-grade architecture
- 🎨 **Modern UI/UX** with Framer Motion animations and TailwindCSS 4
- 📱 **Fully Responsive** design from mobile to 4K displays
- 🚀 **50+ REST API Endpoints** with comprehensive data models
- ⚡ **Real-time Data Sync** via Celery background tasks
- 🔐 **JWT Authentication** with secure session management
- 🌌 **Interactive Starfield** with physics-based animations

---

## 🚀 Features

### 🏠 Home Dashboard - NASA Data Hub
Transform your homepage into a live mission control center:

<table>
<tr>
<td width="50%">

**🖼️ APOD Hero Section**
- Daily Astronomy Picture of the Day as cinematic hero banner
- Full metadata with title, date, and copyright
- Smooth fade-in animations with Framer Motion
- High-resolution image loading with lazy loading

</td>
<td width="50%">

**⭐ Animated Starry Background**
- Canvas-based 1000+ star rendering
- Physics-based twinkling effects
- Shooting star animations with realistic trajectories
- Cosmic nebula overlays with gradient effects

</td>
</tr>
<tr>
<td>

**☀️ Space Weather Alerts (DONKI)**
- Real-time solar flares and coronal mass ejections
- Geomagnetic storm predictions
- Radiation storm warnings
- Interactive event cards with detailed metadata

</td>
<td>

**🌑 Near-Earth Objects (NeoWs)**
- Daily asteroid tracking with orbital data
- Hazardous object highlighting (PHA)
- Velocity, diameter, and miss distance calculations
- Visual danger indicators

</td>
</tr>
<tr>
<td>

**🌍 Earth from Space (EPIC)**
- Latest imagery from DSCOVR satellite (1M miles away)
- Natural color Earth photography
- Lightbox viewer for full-resolution images
- Coordinate and timestamp metadata

</td>
<td>

**🔴 Mars Rover Photos**
- Real-time photos from Curiosity, Perseverance, and Opportunity
- Camera-specific filtering (NAVCAM, MASTCAM, etc.)
- Sol date and Earth date tracking
- Interactive gallery with full-screen view

</td>
</tr>
</table>

### 🔭 Skymap - 3D Cosmic Visualization

The crown jewel of ASTROWORLD—a fully interactive 3D sky powered by **Stellarium Web Engine**:

**Core Features:**
- 🌌 **1+ Billion Stars** from ESA Gaia database
- 🪐 **Real-time Planetary Positions** with accurate ephemeris
- 🌟 **110,000+ Deep Sky Objects** (nebulae, galaxies, clusters)
- 🛰️ **Satellite Tracking** with TLE orbital data
- 🗺️ **Multi-Cultural Constellations** (Western, Chinese, Egyptian, etc.)
- 📍 **GPS-Based Observer Location** with automatic coordinate detection
- ⏱️ **Time Control** - Past, present, future sky states
- 🔍 **Object Search** with fuzzy matching
- 📌 **Custom Markers** with AI-generated descriptions
- 💾 **Sky View Saving** for favorite configurations

**Technical Implementation:**
- WebAssembly for near-native performance
- WebGL 2.0 for hardware-accelerated rendering
- Custom marker overlay system with coordinate projection
- Real-time sky coordinate transformations (ICRS, J2000, Alt-Az)

### 🤖 Murph AI - Your Cosmic Companion

An intelligent astronomy assistant powered by state-of-the-art LLMs:

**Capabilities:**
- 💬 **Contextual Conversations** about astronomy, astrophysics, and space science
- 🔭 **Celestial Object Descriptions** with rich formatting
- 📚 **Research Paper Summarization** for academic content
- 🎓 **Learning Path Recommendations** based on user interests
- 🗂️ **Multi-turn Dialogue** with conversation memory
- 📝 **Markdown Support** for formatted responses
- 💾 **Conversation Persistence** and export
- 🔄 **Session Management** with multiple threads

**Integration Points:**
- Direct integration with Skymap for object descriptions
- Research paper analysis in Explore section
- Personalized content recommendations
- Learning assistance throughout the platform

### 🔬 Explore - Research Discovery Platform

A comprehensive research and social discovery system:

**Research Features:**
- 📄 **17,000+ Research Papers** from arXiv, NASA ADS, and Crossref
- 🔍 **Advanced Filtering** by category, date, citations, and keywords
- 📊 **Citation Metrics** and author information
- 🏷️ **Tagging System** for personal organization
- 📥 **PDF Downloads** with metadata preservation
- 🤖 **AI Summaries** for complex papers

**Social Features:**
- 👥 **User Discovery** - Find researchers with similar interests
- 🔔 **Following System** - Track favorite astronomers
- 📖 **Public Journals** - Share observations and discoveries
- 💬 **Comment System** - Discuss papers and findings
- ❤️ **Like & Save** - Curate personal research library

### 👤 Profile - Personal Cosmic Dashboard

Your centralized command center for all astronomy activities:

**Content Management:**
- 🗂️ **Unified Content Library** - All saved NASA data in one place
- 📌 **Sky Markers** - Personal celestial object bookmarks
- 📚 **Research Papers** - Academic library with notes
- 📓 **Observation Journals** - Personal cosmic diary
- 🗃️ **Collections** - Organize content into themed playlists
- ⭐ **Favorites** - Quick access to most-loved content

**User Statistics:**
- 📈 **Activity Tracking** - Comprehensive usage analytics
- 🎯 **Engagement Metrics** - Content interaction statistics
- 🏆 **Achievements** - Astronomy knowledge milestones
- 📊 **Learning Progress** - Track cosmic education journey

**Social Profile:**
- 👥 **Follower/Following** - Network management
- 🌐 **Public Content** - Share discoveries with community
- 📰 **Activity Feed** - Recent actions and updates
- 🖼️ **Profile Customization** - Avatar, bio, interests

### 📅 Events - Cosmic Calendar

Never miss a celestial spectacle:

**Event Types:**
- 🌑 **Solar & Lunar Eclipses** with visibility maps
- ☄️ **Meteor Showers** with peak times and ZHR data
- 🪐 **Planetary Alignments** and conjunctions
- 🛰️ **ISS Passes** with viewing times
- 🚀 **Rocket Launches** from multiple agencies
- 🌟 **Special Astronomical Events** curated by experts

**Notification System:**
- 📧 **Email Alerts** with customizable timing
- 🔔 **In-App Notifications** for upcoming events
- 📍 **Location-Based Visibility** calculations
- ⏰ **Multi-timezone Support** with local time conversion

### 📰 News - Space News Aggregator

Stay updated with the latest from the cosmos:

**News Sources:**
- 🚀 **NASA Official** announcements and press releases
- 🌍 **Space Agencies** - ESA, JAXA, Roscosmos, CNSA
- 🔬 **Scientific Journals** - Nature, Science, Astronomy
- 💼 **Commercial Space** - SpaceX, Blue Origin, Virgin Galactic
- 📡 **Space Industry** news and updates

**Features:**
- 🏷️ **Category Filtering** - Missions, discoveries, technology, etc.
- 🔍 **Search Functionality** with keyword matching
- 💾 **Save for Later** with personal news library
- 🔗 **Share on Social** media integration
- 📱 **Mobile-Optimized** cards with lazy loading

### 🖼️ Gallery - NASA Image Library

Explore millions of stunning space images:

**Image Collections:**
- 🔭 **Hubble Space Telescope** - Deep space imagery
- 🌌 **James Webb Space Telescope** - Infrared universe
- 🔴 **Mars Rovers** - Surface photography
- 🌍 **Earth Observatory** - Satellite imagery
- 🌙 **Apollo Missions** - Historic lunar photography
- 🛰️ **ISS Photography** - Earth from orbit

**Gallery Features:**
- 🔍 **Advanced Search** with metadata filtering
- 📏 **Multiple Resolutions** from thumbnails to full-size
- 📋 **Technical Metadata** - Camera, date, location
- 💾 **Download Options** for personal use
- 🗂️ **Collection Management** - Organize favorites
- 🎨 **Lightbox Viewer** with zoom and pan

### 🚀 SpaceX Integration

Real-time SpaceX mission tracking:

- 🚀 **Launch Schedule** with countdown timers
- 🎯 **Mission Details** - Payload, orbit, outcome
- 📍 **Launchpad Information** with geographic data
- 🔧 **Rocket Specifications** - Falcon 9, Falcon Heavy, Starship
- 📊 **Success Statistics** and historical data
- 🛰️ **Starlink Tracking** with constellation status

---

## 📸 Screenshots

<div align="center">

### 🏠 Home Dashboard
*Experience NASA data like never before*

<table>
<tr>
<td><img src="screenshots/home1.png" alt="Home Hero" width="400"/></td>
<td><img src="screenshots/home2.png" alt="Home Panels" width="400"/></td>
</tr>
<tr>
<td><img src="screenshots/home3.png" alt="Space Weather" width="400"/></td>
<td><img src="screenshots/home4.png" alt="Asteroids" width="400"/></td>
</tr>
</table>

### 🔭 Skymap Visualization
*3D interactive cosmic exploration*

<table>
<tr>
<td><img src="screenshots/skymap1.png" alt="Skymap Overview" width="400"/></td>
<td><img src="screenshots/skymap2.png" alt="Skymap Markers" width="400"/></td>
</tr>
<tr>
<td><img src="screenshots/skymap3.png" alt="Skymap AI" width="400"/></td>
<td><img src="screenshots/skymap4.png" alt="Skymap Objects" width="400"/></td>
</tr>
</table>

### 🤖 Murph AI Assistant
*Your personal astronomy guide*

<table>
<tr>
<td><img src="screenshots/murphai1.png" alt="Murph Chat" width="400"/></td>
<td><img src="screenshots/murphai2.png" alt="Murph Responses" width="400"/></td>
</tr>
</table>

### 🔬 Explore & Discover
*Research meets social networking*

<table>
<tr>
<td><img src="screenshots/explore1.png" alt="Research Papers" width="400"/></td>
<td><img src="screenshots/explore2.png" alt="User Discovery" width="400"/></td>
</tr>
</table>

### 👤 User Profile
*Your cosmic dashboard*

<table>
<tr>
<td><img src="screenshots/profile1.png" alt="Profile Overview" width="400"/></td>
<td><img src="screenshots/profile2.png" alt="Saved Content" width="400"/></td>
</tr>
<tr>
<td><img src="screenshots/profile3.png" alt="Collections" width="400"/></td>
<td><img src="screenshots/profile4.png" alt="Statistics" width="400"/></td>
</tr>
</table>

### 📅 Events & 📰 News
*Stay informed about the cosmos*

<table>
<tr>
<td><img src="screenshots/events1.png" alt="Events Calendar" width="400"/></td>
<td><img src="screenshots/news.png" alt="Space News" width="400"/></td>
</tr>
</table>

### 🖼️ Gallery
*Millions of stunning space images*

<table>
<tr>
<td><img src="screenshots/gallery1.png" alt="Gallery Grid" width="400"/></td>
<td><img src="screenshots/gallery2.png" alt="Gallery Detail" width="400"/></td>
</tr>
</table>

### 🎨 Welcome Experience
*Onboarding that inspires*

<table>
<tr>
<td><img src="screenshots/Welcome1.png" alt="Welcome 1" width="250"/></td>
<td><img src="screenshots/Welcome3.png" alt="Welcome 3" width="250"/></td>
<td><img src="screenshots/Welcome5.png" alt="Welcome 5" width="250"/></td>
</tr>
</table>

</div>

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 19 + TypeScript]
        B[TailwindCSS 4 + Framer Motion]
        C[Stellarium WebGL/WASM]
        D[TanStack Query]
    end
    
    subgraph "API Layer"
        E[Django REST Framework]
        F[JWT Authentication]
        G[API Endpoints 50+]
    end
    
    subgraph "Data Layer"
        H[PostgreSQL]
        I[Redis Cache]
        J[Celery Workers]
    end
    
    subgraph "External Services"
        K[17 NASA APIs]
        L[OpenAI GPT]
        M[Research DBs]
        N[News APIs]
    end
    
    A --> D
    B --> A
    C --> A
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    J --> K
    J --> L
    J --> M
    J --> N
    K --> E
    L --> E
    M --> E
    N --> E
```

</div>

### 🔄 Data Flow Architecture

```
User Interface
    ↓
React Components (200+)
    ↓
TanStack Query (State Management)
    ↓
API Services (Axios)
    ↓
Django REST API (50+ Endpoints)
    ↓
Database Models (PostgreSQL)
    ↓
External APIs (NASA, OpenAI, etc.)
    ↓
Background Tasks (Celery + Redis)
    ↓
Real-time Data Synchronization
```

### 🎯 Key Architectural Decisions

- **Microservices-Ready Monolith**: Modular Django apps for easy future scaling
- **API-First Design**: All features accessible via REST API
- **Server State Management**: TanStack Query for optimal caching and synchronization
- **Component-Based UI**: Reusable React components with strict TypeScript
- **Background Processing**: Celery for data synchronization without blocking users
- **Multi-Level Caching**: Redis + in-memory + browser cache for performance
- **JWT Authentication**: Stateless authentication for horizontal scaling

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.1 | UI library with latest features |
| **Language** | TypeScript | 5.8 | Type-safe development |
| **Build Tool** | Vite | 7.1 | Lightning-fast HMR |
| **Styling** | TailwindCSS | 4.1 | Utility-first CSS |
| **Animation** | Framer Motion | 12.23 | Smooth transitions |
| **State** | TanStack Query | 5.90 | Server state management |
| **Routing** | React Router | 7.8 | Client-side navigation |
| **HTTP** | Axios | 1.12 | API communication |
| **Icons** | Lucide React | 0.545 | Beautiful icons |
| **3D Engine** | Stellarium WASM | - | WebGL sky rendering |

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Django | 5.2 | Web framework |
| **API** | Django REST Framework | - | RESTful API |
| **Database** | PostgreSQL | 15+ | Primary database |
| **Auth** | Simple JWT | - | Token authentication |
| **Tasks** | Celery | - | Background processing |
| **Cache** | Redis | 7+ | Caching & message broker |
| **CORS** | django-cors-headers | - | Cross-origin requests |
| **Language** | Python | 3.11+ | Server-side logic |

### External Services

| Service | Purpose | APIs Used |
|---------|---------|-----------|
| **NASA** | Space data | 17 different APIs |
| **OpenAI** | AI assistance | GPT models |
| **arXiv** | Research papers | Academic database |
| **NASA ADS** | Astronomy papers | Scientific database |
| **Crossref** | Paper metadata | DOI resolution |
| **Spaceflight News** | Space news | News aggregation |
| **SpaceX** | Launch data | SpaceX API |

</div>

---

## ⚡ Quick Start

### Prerequisites

```bash
# Required
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

# Optional (for full features)
- Redis 7+ (for Celery)
- NASA API Key (free from api.nasa.gov)
- OpenAI API Key (for AI features)
```

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Rockstatata/ASTROWORLD.git
cd ASTROWORLD
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd astroworld-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE astroworld;
\q

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### 3️⃣ Frontend Setup

```bash
# Open new terminal
cd astroworld-frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env file with:
echo "VITE_API_URL=http://localhost:8000/api" > .env
echo "VITE_NASA_API_KEY=your_nasa_api_key_here" >> .env

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4️⃣ Optional: Celery Setup (Background Tasks)

```bash
# Install Redis
# On Windows: Download from https://github.com/microsoftarchive/redis/releases
# On macOS: brew install redis
# On Linux: sudo apt install redis

# Start Redis
redis-server

# In new terminal, start Celery worker
cd astroworld-backend
celery -A astroworld worker -l info

# In another terminal, start Celery beat (scheduler)
celery -A astroworld beat -l info
```

### 5️⃣ Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:8000/api
3. **Admin Panel**: http://localhost:8000/admin

### 🔑 Get API Keys

| Service | URL | Required For |
|---------|-----|--------------|
| NASA API | https://api.nasa.gov/ | All NASA data features |
| OpenAI | https://platform.openai.com/ | Murph AI assistant |
| Groq (Alternative) | https://groq.com/ | Faster AI responses |

---

## 📁 Project Structure

```
ASTROWORLD/
│
├── 📂 astroworld-backend/          # Django Backend
│   ├── 📂 astroworld/              # Project Configuration
│   │   ├── settings.py             # Django settings
│   │   ├── urls.py                 # URL routing
│   │   ├── wsgi.py                 # WSGI config
│   │   └── asgi.py                 # ASGI config
│   │
│   ├── 📂 users/                   # User Management App
│   │   ├── models.py               # User, UserContent, UserJournal
│   │   ├── views.py                # User API endpoints
│   │   ├── serializers.py          # DRF serializers
│   │   └── explore_views.py        # Social discovery
│   │
│   ├── 📂 nasa_api/                # NASA API Integration
│   │   ├── services.py             # NASA API clients
│   │   ├── views_extended.py       # 17 NASA endpoints
│   │   ├── models.py               # NASA data models
│   │   ├── tasks.py                # Background sync
│   │   └── management/commands/    # Data import commands
│   │
│   ├── 📂 murphai/                 # AI Chat System
│   │   ├── models.py               # Conversation, Message
│   │   ├── views.py                # Chat API
│   │   ├── groq_service.py         # AI service
│   │   └── urls.py                 # Chat routes
│   │
│   ├── 📂 skymap/                  # Sky Visualization
│   │   ├── models.py               # SkyMarker, SkyView
│   │   ├── views.py                # Skymap API
│   │   └── serializers.py          # Skymap data
│   │
│   ├── 📂 research_papers/         # Academic Papers
│   │   ├── services.py             # arXiv, NASA ADS
│   │   └── tasks.py                # Paper sync
│   │
│   ├── 📂 spaceflightnews/         # News Aggregation
│   │   ├── models.py               # NewsArticle
│   │   ├── services.py             # News APIs
│   │   └── tasks.py                # News sync
│   │
│   ├── 📂 spacex_api/              # SpaceX Integration
│   │   ├── models.py               # Launch, Rocket
│   │   ├── services.py             # SpaceX API
│   │   └── tasks.py                # Launch sync
│   │
│   ├── manage.py                   # Django CLI
│   ├── requirements.txt            # Python dependencies
│   └── db.sqlite3 / PostgreSQL     # Database
│
├── 📂 astroworld-frontend/         # React Frontend
│   ├── 📂 public/                  # Static Assets
│   │   └── astroworld-engine/      # Stellarium WASM
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/          # React Components (200+)
│   │   │   ├── common/             # Reusable UI
│   │   │   ├── Home/               # Home components
│   │   │   ├── Skymap/             # 3D sky components
│   │   │   ├── murphai/            # AI chat UI
│   │   │   ├── explore/            # Research discovery
│   │   │   ├── profile/            # User dashboard
│   │   │   ├── events/             # Event calendar
│   │   │   ├── news/               # News feed
│   │   │   └── gallery/            # Image gallery
│   │   │
│   │   ├── 📂 pages/               # Route Components
│   │   │   ├── home/               # Home page
│   │   │   ├── skymap/             # Skymap page
│   │   │   ├── murph_ai/           # AI chat page
│   │   │   ├── explore/            # Research page
│   │   │   ├── profile/            # Profile page
│   │   │   ├── events/             # Events page
│   │   │   ├── news/               # News page
│   │   │   ├── gallery/            # Gallery page
│   │   │   └── auth/               # Auth pages
│   │   │
│   │   ├── 📂 hooks/               # Custom React Hooks
│   │   │   ├── nasa/               # NASA data hooks
│   │   │   ├── useUserContent.ts   # Content management
│   │   │   ├── useSkymap.ts        # Sky visualization
│   │   │   ├── useMurphAi.ts       # AI chat
│   │   │   └── useExplore.ts       # Research discovery
│   │   │
│   │   ├── 📂 services/            # API Clients
│   │   │   ├── nasa/               # NASA API
│   │   │   ├── userInteractions.ts # User API
│   │   │   ├── exploreAPI.ts       # Research API
│   │   │   └── skymapApi.ts        # Skymap API
│   │   │
│   │   ├── 📂 context/             # React Contexts
│   │   │   └── authContext.tsx     # Auth state
│   │   │
│   │   ├── 📂 routes/              # Routing
│   │   │   └── AllRoutes.tsx       # Route definitions
│   │   │
│   │   ├── 📂 types/               # TypeScript Types
│   │   │   ├── index.ts            # Common types
│   │   │   └── stellarium.ts       # Stellarium types
│   │   │
│   │   ├── 📂 utils/               # Utilities
│   │   │   ├── murphaiUtils.ts     # AI utilities
│   │   │   └── stellarium.ts       # Sky utilities
│   │   │
│   │   ├── App.tsx                 # Root component
│   │   └── main.tsx                # Entry point
│   │
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── vite.config.ts              # Vite config
│   ├── tailwind.config.js          # Tailwind config
│   └── .env                        # Environment variables
│
├── 📂 screenshots/                 # Project Screenshots
│   ├── home*.png                   # Home page screens
│   ├── skymap*.png                 # Skymap screens
│   ├── murphai*.png                # AI chat screens
│   └── ...                         # Other screens
│
├── README.md                       # This file
├── Project_Report.md               # Detailed analysis
└── NASA_INTEGRATION.md             # NASA API guide
```

---

## 🛰️ API Integrations

### NASA APIs (17 Integrated)

<table>
<tr>
<th>API</th>
<th>Purpose</th>
<th>Endpoints</th>
<th>Update Frequency</th>
</tr>
<tr>
<td><strong>APOD</strong></td>
<td>Astronomy Picture of the Day</td>
<td><code>/planetary/apod</code></td>
<td>Daily</td>
</tr>
<tr>
<td><strong>DONKI</strong></td>
<td>Space Weather Database</td>
<td><code>/DONKI/*</code></td>
<td>Real-time</td>
</tr>
<tr>
<td><strong>NeoWs</strong></td>
<td>Near-Earth Objects</td>
<td><code>/neo/rest/v1/*</code></td>
<td>Daily</td>
</tr>
<tr>
<td><strong>EPIC</strong></td>
<td>Earth Imagery</td>
<td><code>/EPIC/api/*</code></td>
<td>Daily</td>
</tr>
<tr>
<td><strong>Mars Rovers</strong></td>
<td>Mars Photos</td>
<td><code>/mars-photos/api/*</code></td>
<td>Daily</td>
</tr>
<tr>
<td><strong>Exoplanet Archive</strong></td>
<td>Confirmed Exoplanets</td>
<td>Caltech TAP</td>
<td>Weekly</td>
</tr>
<tr>
<td><strong>Image Library</strong></td>
<td>NASA Media Collection</td>
<td><code>/search</code></td>
<td>On-demand</td>
</tr>
<tr>
<td><strong>TLE</strong></td>
<td>Satellite Tracking</td>
<td>TLE API</td>
<td>Daily</td>
</tr>
<tr>
<td><strong>GIBS</strong></td>
<td>Earth Imagery Tiles</td>
<td>WMTS</td>
<td>Daily</td>
</tr>
<tr>
<td colspan="4" align="center"><em>+ 8 more APIs including GeneLab, TechPort, Patents, SSD, CNEOS, Horizons, MPC, Space Weather</em></td>
</tr>
</table>

### Rate Limits & Optimization

- **Demo Key**: 30 requests/hour, 50 requests/day
- **Personal Key**: 1,000 requests/hour, unlimited daily
- **Backend Caching**: 15-minute cache for most endpoints
- **Frontend Caching**: TanStack Query with 5-minute stale time
- **Background Sync**: Celery tasks for periodic data updates

---

## 💻 Development

### Running Tests

```bash
# Backend tests
cd astroworld-backend
python manage.py test

# Frontend tests
cd astroworld-frontend
npm run test
```

### Code Quality

```bash
# Frontend linting
npm run lint

# TypeScript checking
npm run type-check

# Backend formatting (if using Black)
black .

# Check for issues
flake8
```

### Database Migrations

```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

### Development Workflow

1. **Feature Branch**: Create from `master`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development**: Make changes with hot reload
   - Backend: Django auto-reload
   - Frontend: Vite HMR

3. **Testing**: Write and run tests

4. **Commit**: Use conventional commits
   ```bash
   git commit -m "feat: add new NASA API endpoint"
   ```

5. **Pull Request**: Submit for review

### Environment Variables

#### Backend (.env)

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/astroworld
# Or individual settings:
DB_NAME=astroworld
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# NASA API
NASA_API_KEY=your_nasa_api_key

# AI Services
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_key

# Celery
USE_CELERY=True
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@astroworld.dev

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# Optional: Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_CELERY=true
```

---

## 🚀 Deployment

### Recommended Topology

For this codebase, the best production setup is:

- Frontend: **Vercel** (React/Vite static build + global edge CDN)
- Backend API: **Render Web Service** (Django + Gunicorn)
- Database: **Render PostgreSQL**

This gives better frontend performance, cleaner separation of concerns, and easier scaling than putting both frontend and backend on a single Render web service.

### Why This Is Better Than "Everything on Render"

- Vercel is optimized for static frontend delivery and SPA routing
- Render is excellent for long-running Python web processes and managed Postgres
- Independent deploys: UI changes do not require backend restarts
- Better cost/performance tuning: scale API and frontend independently

### Deployment Files Included In This Repo

- `render.yaml` (Render Blueprint for backend + Postgres)
- `astroworld-backend/requirements.txt`
- `astroworld-backend/runtime.txt`
- `astroworld-backend/Procfile`
- `astroworld-frontend/vercel.json`

### 1) Deploy Backend + Postgres on Render

1. Push the repository to GitHub.
2. In Render, click **New +** -> **Blueprint** and select this repo.
3. Render reads `render.yaml` and creates:
    - `astroworld-backend` web service
    - `astroworld-postgres` database
4. In backend environment variables, set real values for:
    - `NASA_API_KEY`
    - `GROQ_API_KEY`
5. Deploy.

Backend build/start commands (already configured):

```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input
python manage.py migrate && gunicorn astroworld.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
```

### 2) Deploy Frontend on Vercel

1. In Vercel, import the same repo.
2. Set project root to `astroworld-frontend`.
3. Add env var:

```bash
VITE_API_URL=https://<your-render-backend>.onrender.com
```

4. Deploy.

### 3) Wire CORS/CSRF Back In Render

After Vercel gives you your domain, update Render backend env vars:

```bash
FRONTEND_URL=https://<your-vercel-app>.vercel.app
CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-vercel-app>.vercel.app,https://*.vercel.app
CORS_ALLOWED_ORIGIN_REGEXES=https://.*\.vercel\.app
ALLOWED_HOSTS=<your-render-backend>.onrender.com
```

Then redeploy backend.

### 4) Production Smoke Test

1. Open frontend URL and verify homepage renders.
2. Register/login and confirm JWT-protected endpoints work.
3. Check API health:

```bash
curl https://<your-render-backend>.onrender.com/
```

4. In Render logs, verify migrations ran and no CORS errors are present.

### Optional: Deploy Frontend Also On Render

You can host frontend on Render Static Site if you prefer one provider.
It is simpler operationally, but usually slower globally than Vercel CDN for static assets.

---

## 🌟 Key Features Deep Dive

### Universal Save System

ASTROWORLD implements a **unified content management system** that allows users to save any type of content:

```typescript
// Save any NASA content with one component
<SaveButton
  contentType="apod"
  contentId="2024-10-29"
  title="Galaxy NGC 1365"
  description="A stunning barred spiral galaxy"
  thumbnailUrl="https://..."
  sourceUrl="https://..."
/>
```

**Supported Content Types:**
- 🖼️ APOD images
- 🔴 Mars rover photos
- 🌍 Earth EPIC images
- 🌑 Near-Earth objects
- 🪐 Exoplanets
- ☀️ Space weather events
- 📰 News articles
- 🔭 Celestial objects from Skymap
- 📅 Cosmic events
- 🖼️ NASA image library items
- 🚀 Space launches

**Backend Model:**
```python
class UserContent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.CharField(max_length=50)
    content_id = models.CharField(max_length=255)
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    thumbnail_url = models.TextField(blank=True)
    source_url = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### AI-Powered Features

**Murph AI Architecture:**

```
User Input
    ↓
Conversation Context (Multi-turn)
    ↓
Astronomy-Specific Prompting
    ↓
LLM Processing (Groq/OpenAI)
    ↓
Response Formatting (Markdown)
    ↓
Database Persistence
    ↓
User Display
```

**AI Capabilities:**
- 🔭 **Object Descriptions**: Rich astronomy information
- 📚 **Paper Summaries**: Academic content digestion
- 🎓 **Learning Paths**: Personalized education
- 💬 **Q&A**: Contextual astronomy assistance
- 🧠 **Memory**: Multi-turn conversation context

### Background Task System

**Celery Beat Schedule:**

```python
CELERY_BEAT_SCHEDULE = {
    'sync-daily-nasa-data': {
        'task': 'nasa_api.tasks.sync_daily_nasa_data',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
    'sync-space-weather': {
        'task': 'nasa_api.tasks.sync_space_weather',
        'schedule': crontab(minute=0),  # Every hour
    },
    'send-neo-alerts': {
        'task': 'nasa_api.tasks.send_neo_alerts',
        'schedule': crontab(hour=9, minute=0),  # 9 AM daily
    },
    # ... more tasks
}
```

**Background Tasks:**
- 📊 Daily NASA data synchronization
- ☀️ Hourly space weather updates
- 🌑 Daily near-Earth object tracking
- 📰 News aggregation and curation
- 📚 Research paper indexing
- 🚀 SpaceX launch data updates
- 📧 Email notification delivery
- 🗑️ Old data cleanup

---

## 📊 Project Statistics

### Codebase Metrics

<table>
<tr>
<th>Category</th>
<th>Count</th>
<th>Details</th>
</tr>
<tr>
<td><strong>Frontend Components</strong></td>
<td>200+</td>
<td>React/TypeScript components</td>
</tr>
<tr>
<td><strong>Backend Endpoints</strong></td>
<td>50+</td>
<td>REST API endpoints</td>
</tr>
<tr>
<td><strong>Database Models</strong></td>
<td>25+</td>
<td>Django ORM models</td>
</tr>
<tr>
<td><strong>Custom Hooks</strong></td>
<td>25+</td>
<td>React custom hooks</td>
</tr>
<tr>
<td><strong>Pages/Routes</strong></td>
<td>15+</td>
<td>Main application pages</td>
</tr>
<tr>
<td><strong>NASA APIs</strong></td>
<td>17</td>
<td>Integrated space data sources</td>
</tr>
<tr>
<td><strong>Background Tasks</strong></td>
<td>12+</td>
<td>Celery periodic tasks</td>
</tr>
<tr>
<td><strong>Lines of Code</strong></td>
<td>~80,000</td>
<td>Frontend + Backend combined</td>
</tr>
</table>

### Development Timeline

- **Phase 1**: Core infrastructure and authentication ✅
- **Phase 2**: NASA API integration (17 APIs) ✅
- **Phase 3**: Stellarium 3D skymap implementation ✅
- **Phase 4**: AI assistant (Murph AI) ✅
- **Phase 5**: Research discovery platform ✅
- **Phase 6**: User content management system ✅
- **Phase 7**: Events and notifications ✅
- **Phase 8**: SpaceX integration ✅
- **Phase 9**: Gallery and news aggregation ✅
- **Phase 10**: Polish and optimization ✅

### Feature Completion

- ✅ **Core Features**: 100%
- ✅ **NASA Integration**: 100%
- ✅ **AI Features**: 95%
- ✅ **Social Features**: 90%
- ✅ **Advanced Analytics**: 85%
- 🔄 **Mobile App**: Planned
- 🔄 **AR/VR**: Future enhancement

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. 🐛 **Report Bugs**: Open an issue with detailed reproduction steps
2. 💡 **Suggest Features**: Share your ideas for new features
3. 📝 **Improve Documentation**: Help make our docs better
4. 🔧 **Submit Pull Requests**: Fix bugs or add features
5. 🌟 **Star the Repository**: Show your support!

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write/update tests
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **Frontend**: ESLint + Prettier configuration
- **Backend**: PEP 8 Python style guide
- **Commits**: Conventional Commits specification
- **Tests**: Write tests for new features
- **Documentation**: Update docs for API changes

---

## 📖 Documentation

- 📘 **[NASA Integration Guide](astroworld-frontend/NASA_INTEGRATION.md)** - Detailed NASA API setup
- 📗 **[Project Report](Project_Report.md)** - Comprehensive technical analysis
- 📕 **API Documentation** - Auto-generated from DRF (available at `/api/docs`)
- 📙 **Component Storybook** - (Coming soon)

---

## 🐛 Troubleshooting

### Common Issues

**Issue: NASA API Rate Limit**
```bash
# Solution: Get a personal API key from api.nasa.gov
# Update .env file with your key
VITE_NASA_API_KEY=your_personal_key_here
```

**Issue: PostgreSQL Connection Error**
```bash
# Solution: Verify PostgreSQL is running
# Windows: Check Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**Issue: Celery Not Working**
```bash
# Solution: Ensure Redis is running
redis-cli ping  # Should return "PONG"

# Check Celery worker is running
celery -A astroworld worker -l info
```

**Issue: Stellarium Not Loading**
```bash
# Solution: Verify WASM files are in public/astroworld-engine/
# Check browser console for errors
# Ensure HTTPS is used in production (WASM requirement)
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 ASTROWORLD

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **NASA** - For providing incredible open APIs and data
- **Stellarium** - For the amazing WebGL sky engine
- **React Team** - For the fantastic frontend framework
- **Django Team** - For the robust backend framework
- **Open Source Community** - For countless helpful libraries

---

## 📞 Contact & Support

- 📧 **Email**: your.email@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Rockstatata/ASTROWORLD/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Rockstatata/ASTROWORLD/discussions)
- 🌟 **Star the Project**: [GitHub Repository](https://github.com/Rockstatata/ASTROWORLD)

---

## 🌠 Future Roadmap

### Q1 2025
- [ ] Mobile applications (React Native)
- [ ] Advanced AI recommendations
- [ ] Real-time WebSocket features
- [ ] Enhanced social networking

### Q2 2025
- [ ] AR sky overlay for mobile
- [ ] VR space exploration
- [ ] Advanced analytics dashboard
- [ ] API for third-party developers

### Q3 2025
- [ ] Educational platform launch
- [ ] Gamification system
- [ ] Community forums
- [ ] Live event streaming

### Q4 2025
- [ ] Machine learning recommendations
- [ ] Advanced visualization tools
- [ ] Citizen science integration
- [ ] International language support

---

<div align="center">

## ⭐ Show Your Support

If you find this project helpful or interesting, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Rockstatata/ASTROWORLD&type=Date)](https://star-history.com/#Rockstatata/ASTROWORLD&Date)

---

### 🌌 *"Explore the cosmos, one click at a time."*

**Made with ❤️ and countless hours of dedication**

[⬆ Back to Top](#-astroworld)

</div>

