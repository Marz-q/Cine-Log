# Cine-Log System Architecture

## 1. Architectural Overview
Cine-Log follows a layered, modular architecture designed for high maintainability, clear separation of concerns, and standard REST conventions.

```
[ Frontend: React + Vite ] 
         │ (HTTP / JSON / JWT)
         ▼
[ Backend: Spring Boot 3 / Java 17 ]
    ├── Controller Layer (REST endpoints, DTO mapping)
    ├── Service Layer (Business logic, TMDB client, AI client)
    ├── Repository Layer (Spring Data JPA)
    └── Security (JWT Filter, BCrypt, Stateless Sessions)
         │
         ├───► [ External API: TMDB v3 ]
         ├───► [ AI Service: FastAPI Python 3.14 ]
         │         ├── Sentiment Analyzer
         │         └── Recommendation & Taste Profiler
         │
         ▼
[ Database: PostgreSQL / JPA Hibernate ]
```

---

## 2. Component Specifications

### 2.1 Frontend (React / Vite)
- **Framework**: React 18 with Vite build tool.
- **Routing**: React Router v7 (`react-router-dom`) with RootLayout.
- **State Management**: React Context (`AuthContext`) for authentication token and user session persistence.
- **Service Layer**: Dedicated Axios modules (`api.js`, `movieService.js`, `reviewService.js`, `userService.js`, `listService.js`).
- **Styling**: Pure Vanilla CSS design tokens based on Marine Blue (`#0b1726`), Bright Red (`#e6232e`), and Butter Yellow (`#f8d46b`).

### 2.2 Backend (Spring Boot 3)
- **Controller → Service → Repository Pattern**:
  - `com.moviedb.controller`: Receives HTTP requests, validates inputs via Jakarta Validation (`@Valid`), delegates to services.
  - `com.moviedb.service`: Core business rules, synchronization of external TMDB movie records with PostgreSQL entities, review sentiment coordination.
  - `com.moviedb.repository`: Spring Data JPA interfaces with type-safe derived query methods.
- **Security**: Stateless Spring Security 6 with `JwtAuthenticationFilter` verifying HMAC-SHA256 tokens on incoming requests.
- **Resilience**: `DataSourceConfig` provides seamless PostgreSQL primary connectivity with embedded fallback to ensure out-of-the-box local development reliability.

### 2.3 AI Microservice (Python / FastAPI)
- **FastAPI**: Lightweight ASGI web application on port 8000.
- **Pydantic Schemas**: Strict schema validation for `/sentiment`, `/recommendations`, and `/taste-profile/{userId}`.
- **Lexical Sentiment Engine**: Movie review domain lexicon analyzer rating polarity from -1.0 to +1.0.
- **Recommendation Engine**: Content-based genre scoring and similarity heuristics.

### 2.4 Database (PostgreSQL)
- Relational schema defined in `database/schema.sql`.
- Entities: `users`, `movies`, `reviews`, `ratings`, `watchlist_movies`, `watched_movies`, `lists`, `list_movies`, `likes`, `comments`, `follows`, `user_preferences`.
- Indexes placed on foreign keys and frequently queried fields (`tmdb_id`, `username`, `created_at`).
