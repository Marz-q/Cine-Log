# Cine-Log

> A full-stack movie social web application inspired by Letterboxd. Track films, log watched titles, build watchlists, write reviews with automated AI sentiment analysis, create custom movie lists, and connect with fellow cinephiles.

---

## 1. Tech Stack

- **Frontend**: React (Vite, JavaScript), React Router, Axios, Pure CSS.
- **Backend**: Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Hibernate, Spring Security + JWT, Maven.
- **Database**: PostgreSQL (with embedded JPA development fallback for instant onboarding).
- **Movie Data**: TMDB API v3 (titles, posters, backdrops, cast, directors, trailers).
- **AI Service**: Python, FastAPI, Uvicorn, Pydantic (sentiment analysis & recommendation engine).
- **Testing**: JUnit 5, Mockito.

---

## 2. Visual Identity

Built with an intentional cinematic palette:
- **Marine Blue (P 105-8 C)**: Surfaces, background, navigation, and cards.
- **Bright Red (P 48-8 C)**: Action buttons, rating indicators, likes, and active states.
- **Butter Yellow (98 C)**: Main headings, movie titles, and key metrics.

---

## 3. Project Structure

```
movie-social/
│
├── frontend/             # React + Vite frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components (Navbar, MovieCard, ReviewCard, etc.)
│   │   ├── pages/        # Route pages (Home, MovieDetails, Profile, Lists, etc.)
│   │   ├── layouts/      # RootLayout with header & footer
│   │   ├── services/     # Axios API service layer (api, auth, movie, review, user, list)
│   │   ├── context/      # AuthContext session provider
│   │   ├── index.css     # Complete design token system
│   │   ├── App.jsx       # Routing declaration
│   │   └── main.jsx
│   └── package.json
│
├── backend/              # Spring Boot REST API
│   ├── src/
│   │   ├── main/java/com/moviedb/
│   │   │   ├── config/   # SecurityConfig, WebConfig, TmdbConfig, DataSourceConfig
│   │   │   ├── controller/ # REST Controllers
│   │   │   ├── service/  # Business logic & TMDB/AI integrations
│   │   │   ├── repository/ # Spring Data JPA repositories
│   │   │   ├── entity/   # JPA entities (User, Movie, Review, Rating, List, etc.)
│   │   │   ├── dto/      # Data Transfer Objects
│   │   │   ├── mapper/   # DtoMapper
│   │   │   ├── security/ # JWT provider & filters
│   │   │   ├── exception/# GlobalExceptionHandler & custom exceptions
│   │   │   └── MovieApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/
│   ├── mvnw.cmd & mvnw   # Cross-platform Maven wrappers
│   └── pom.xml
│
├── ai-service/           # FastAPI Python microservice
│   ├── app/
│   │   ├── main.py       # FastAPI application
│   │   ├── recommendation/ # Recommendation engine
│   │   ├── sentiment/    # Lexicon sentiment analyzer
│   │   └── models/       # Pydantic request/response schemas
│   └── requirements.txt
│
├── database/
│   └── schema.sql        # PostgreSQL DDL table definitions and indexes
│
├── docs/
│   ├── requirements.md   # Functional and non-functional requirements
│   ├── architecture.md   # System architecture diagram and flow
│   └── api.md            # REST API endpoint reference
│
├── run-backend.js        # Cross-platform backend runner
├── run-ai.js             # Cross-platform AI service runner
├── .env.example          # Environment variable template
├── package.json          # Root runner using concurrently
└── README.md
```

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js (v18+) & npm
- Java 17 (JDK)
- Python (3.10+) with `fastapi` and `uvicorn` (`pip install fastapi uvicorn`)
- PostgreSQL (optional for local development; embedded fallback runs automatically if PostgreSQL is not active)

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: add your `TMDB_API_KEY` for live TMDB data. The application includes a rich curated cinematic catalog out of the box if no key is provided.)*

### 2. Install Dependencies
From the repository root:
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Run the Entire Stack
From the project root:
```bash
npm run dev
```

`concurrently` starts all three services simultaneously:
- **Frontend**: http://localhost:5173
- **Spring Boot Backend**: http://localhost:8080
- **FastAPI AI Service**: http://localhost:8000 (Docs: http://localhost:8000/docs)

---

## 5. Running Tests

Run backend unit tests (JUnit 5 + Mockito):
```bash
npm test
```
Or directly from `backend/`:
```bash
cd backend
./mvnw test        # Linux/macOS
.\mvnw.cmd test    # Windows
```

---

## 6. API Summary

- `POST /api/auth/register` & `POST /api/auth/login` - User registration & JWT authentication
- `GET /api/movies/popular`, `trending`, `recent` - Movie discovery
- `GET /api/movies/{tmdbId}` - Detailed film view with trailer, cast, and status
- `GET /api/reviews/movie/{tmdbId}` & `POST /api/reviews` - Reviews with AI sentiment analysis
- `POST /api/watchlist/toggle` & `POST /api/watched/toggle` - Film tracking
- `GET /api/lists` & `POST /api/lists` - Custom community movie lists
- `GET /api/social/feed` & `POST /api/social/follow/{username}` - Social activity and follows
- `GET /api/recommendations` & `GET /api/recommendations/taste-profile` - AI recommendations
