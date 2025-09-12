
# ASTROWORLD 🌌

**ASTROWORLD** is an all-in-one hub for astronomy enthusiasts. Explore celestial objects, track events, get AI-powered guidance, and stay up-to-date with the latest space news — all in a single interactive platform.  

---

## 🚀 Features

### 🌠 Core Astronomy Features
- **Dynamic Sky Maps**: Explore stars, planets, exoplanets, and asteroids with an interactive sky map.  
- **Exoplanet Database**: Browse exoplanets with filters like distance, mass, radius, and habitability.  
- **Asteroid & NEO Tracking**: Track near-Earth objects and get real-time updates.  
- **Astronomical Event Calendar**: Stay informed about eclipses, meteor showers, and planetary alignments.  
- **APOD (Astronomy Picture of the Day)**: Daily NASA images with descriptions; favorite and save them.  

### 👤 User Features
- **Research Journal / Observation Logs**: Keep detailed logs of your astronomical observations, attach images, and link them to celestial objects.  
- **AI Astronomy Mentor**: Chat with an intelligent LLM to learn about celestial objects, astronomical phenomena, or space science topics.  
- **AI-Powered Summaries**: Get concise, AI-generated summaries for celestial objects and complex space datasets.  
- **Customizable Dashboard**: Visualize your favorite celestial objects and events with charts and graphs.  
- **Astronomy News Aggregator**: Fetch the latest news from trusted space sources, filter by category, and save articles for later.  

### 🌟 Optional / Future Features
- AI-guided learning paths for beginners  
- Gamification and badges for milestones  
- Personalized object/event recommendations  

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.x + Django Rest Framework (DRF)  
- **Database**: PostgreSQL  
- **Async / Background Tasks**: Celery + Redis  
- **Authentication**: JWT (SimpleJWT)  
- **APIs**: OpenAI, NASA Open APIs (APOD, NEO, Exoplanet Archive), Spaceflight News API  

### Frontend
- **Framework**: React (Vite)  
- **UI**: Tailwind CSS  
- **Data Fetching**: Axios / React Query  
- **Visualization**: Aladin Lite for sky maps, Recharts/D3.js for dashboards  

### Deployment / Dev Tools
- Git for version control  
- Docker & Docker Compose (optional)  
- Pre-commit hooks, ESLint, Prettier, Black for code quality  

---

## 📂 Project Structure

```

astroworld/
├─ backend/           # Django backend
│  ├─ manage.py
│  ├─ astroworld/     # settings, apps
│  └─ apps/           # users, core, journals, ai, news
├─ frontend/          # React frontend
│  └─ astroworld-frontend/
├─ infra/             # docker-compose, prod configs
└─ README.md

````

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/astroworld.git
cd astroworld
````

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in DB credentials and API keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd ../frontend/astroworld-frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173` and backend API at `http://localhost:8000/api`.

### 4. Optional Background Tasks (Celery)

```bash
# Start Redis first
redis-server &

# Start Celery worker
celery -A astroworld worker -l info

# Start Celery beat (scheduled tasks)
celery -A astroworld beat -l info
```

---

## 🔑 Environment Variables

* `SECRET_KEY` → Django secret key
* `DATABASE_URL` → PostgreSQL URL
* `REDIS_URL` → Redis URL for Celery
* `OPENAI_API_KEY` → OpenAI API key
* `NASA_API_KEY` → NASA API key
* `NEWSAPI_KEY` → News API key
* `FRONTEND_URL` → React frontend URL

---

## 📈 Future Enhancements

* Real-time sky simulations using Skyfield/Astropy
* Advanced AI recommendations and learning paths
* Full community and discussion forums
* Push notifications for upcoming events

---

## 📄 License

MIT License © 2025 ASTROWORLD

---

