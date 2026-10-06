# Cine-Log Requirements Specification

## 1. Project Overview
Cine-Log is a full-stack movie social web application inspired by Letterboxd. Designed as an authentic university Software Engineering capstone project, Cine-Log provides film discovery, logging, reviewing, social following, custom list curation, and AI-assisted taste profiling and sentiment analysis.

---

## 2. Functional Requirements

### 2.1 User Management & Authentication
- **FR-AUTH-01**: Users must be able to register with a unique username, valid email, and secure password.
- **FR-AUTH-02**: Users must authenticate using JWT tokens via Spring Security.
- **FR-AUTH-03**: Users must be able to view their profile, display metrics (watched count, watchlist count, reviews, lists, followers, following), and edit profile info (display name, bio, avatar).

### 2.2 Movie Discovery & Details
- **FR-MOV-01**: Users can view popular, trending, and recently released movies fetched via the TMDB API.
- **FR-MOV-02**: Users can search movies by title, director, or genre.
- **FR-MOV-03**: Movie detail view displays large poster/backdrop, release year, runtime, director, cast, synopsis, genres, and community rating.
- **FR-MOV-04**: Movie trailer playback supported via YouTube video embedding when available.

### 2.3 Film Logging & Ratings
- **FR-LOG-01**: Authenticated users can mark movies as "Watched" with persistent logging.
- **FR-LOG-02**: Authenticated users can save movies to a personal "Watchlist".
- **FR-LOG-03**: Authenticated users can rate movies on a 0.5 to 5.0 star scale.

### 2.4 Reviews & Social Community
- **FR-SOC-01**: Users can write, edit, and delete reviews for movies.
- **FR-SOC-02**: Community reviews display author, rating, publication date, sentiment label, likes, and comments.
- **FR-SOC-03**: Users can like and comment on community reviews.
- **FR-SOC-04**: Users can follow/unfollow other members and view their activity stream in the social feed.

### 2.5 Custom Lists
- **FR-LST-01**: Users can create custom named movie lists (e.g. "Top 10 Horror", "Best Sci-Fi") with optional descriptions and public/private visibility.
- **FR-LST-02**: Owners can search and add movies to lists, or remove films from their lists.

### 2.6 AI Features
- **FR-AI-01**: Automatically evaluate review sentiment polarity using FastAPI endpoint `/sentiment`.
- **FR-AI-02**: Generate content-based recommendations via `/recommendations` based on user watching history and genre affinities.
- **FR-AI-03**: Expose user taste profile summaries via `/taste-profile/{userId}`.

---

## 3. Non-Functional Requirements
- **NFR-01 (Performance)**: Client requests render smoothly with loading indicators and optimistic state updates.
- **NFR-02 (Security)**: Passwords hashed with BCrypt. JWT token verification enforced on all mutating REST endpoints.
- **NFR-03 (Design Identity)**: Strict adherence to the specified palette: Marine Blue (P 105-8 C), Bright Red (P 48-8 C), Butter Yellow (98 C). No purple allowed.
- **NFR-04 (Responsiveness)**: Fluid grid layouts supporting desktop, tablet, and mobile displays.
