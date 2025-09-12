-- ================================
-- USERS & AUTH
-- ================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100),
    bio TEXT,
    profile_picture TEXT,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE
);

-- ================================
-- CELESTIAL OBJECTS (Stars, Planets, Exoplanets, Asteroids)
-- ================================
CREATE TABLE celestial_objects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,          -- Star, Planet, Exoplanet, Asteroid
    nasa_id VARCHAR(100),               -- External reference
    ra DOUBLE PRECISION,                -- Right Ascension
    dec DOUBLE PRECISION,               -- Declination
    distance_ly DOUBLE PRECISION,
    mass NUMERIC,
    radius NUMERIC,
    discovery_year INT,
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ================================
-- FAVORITES / TRACKED OBJECTS
-- ================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    celestial_object_id INT REFERENCES celestial_objects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, celestial_object_id)
);

-- ================================
-- USER JOURNALS / RESEARCH LOGS
-- ================================
CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    celestial_object_id INT REFERENCES celestial_objects(id), -- optional link
    images TEXT[],                -- Array of image URLs
    observation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- ASTRONOMICAL EVENTS
-- ================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    event_type VARCHAR(50),          -- Eclipse, Meteor Shower, Alignment
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    visibility_region TEXT,
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions to events
CREATE TABLE event_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- ================================
-- APOD (Astronomy Picture of the Day)
-- ================================
CREATE TABLE apod (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    title VARCHAR(200),
    explanation TEXT,
    media_type VARCHAR(20),           -- image or video
    url TEXT,
    hd_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User saved APODs
CREATE TABLE apod_favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    apod_id INT REFERENCES apod(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, apod_id)
);

-- ================================
-- AI INTERACTIONS
-- ================================
CREATE TABLE ai_interactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    context_object_id INT REFERENCES celestial_objects(id), -- optional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ================================
-- NEWS ARTICLES
-- ================================
CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    summary TEXT,
    source VARCHAR(150),
    url TEXT UNIQUE NOT NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User saved articles
CREATE TABLE saved_articles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    article_id INT REFERENCES news_articles(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);
-