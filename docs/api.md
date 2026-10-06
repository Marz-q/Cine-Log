# Cine-Log REST API Specification

Base URL: `http://localhost:8080/api`

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |

---

## 2. Movies (`/api/movies`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/movies/popular` | Fetch popular films | No |
| `GET` | `/api/movies/trending` | Fetch trending films of the week | No |
| `GET` | `/api/movies/recent` | Fetch recently released films | No |
| `GET` | `/api/movies/search?q={query}` | Search films by keyword | No |
| `GET` | `/api/movies/genre/{genre}` | Discover films by genre | No |
| `GET` | `/api/movies/genres` | List available film genres | No |
| `GET` | `/api/movies/{tmdbId}` | Fetch movie details, cast, trailer, and user log status | Optional |

---

## 3. Reviews & Community (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reviews/movie/{tmdbId}` | Get all reviews for a film | No |
| `POST` | `/api/reviews` | Create review with AI sentiment analysis | Yes |
| `PUT` | `/api/reviews/{id}` | Edit user's own review | Yes |
| `DELETE` | `/api/reviews/{id}` | Delete user's own review | Yes |
| `POST` | `/api/reviews/{id}/like` | Toggle like on a review | Yes |
| `GET` | `/api/reviews/{id}/comments` | Get comments for a review | No |
| `POST` | `/api/reviews/{id}/comments` | Add comment to a review | Yes |

---

## 4. Ratings (`/api/ratings`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ratings` | Rate a movie (0.5 to 5.0 stars) | Yes |
| `DELETE` | `/api/ratings/{tmdbId}` | Remove rating for a movie | Yes |
| `GET` | `/api/ratings/movie/{tmdbId}` | Get user rating for a movie | Optional |

---

## 5. Watchlist & Watched (`/api/watchlist`, `/api/watched`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/watchlist` | Get user watchlist films | Yes |
| `POST` | `/api/watchlist/toggle` | Toggle film in/out of watchlist | Yes |
| `GET` | `/api/watched` | Get user watched films | Yes |
| `POST` | `/api/watched/toggle` | Toggle film in/out of watched list | Yes |

---

## 6. Custom Lists (`/api/lists`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/lists` | Get community public movie lists | No |
| `GET` | `/api/lists/my` | Get current user's movie lists | Yes |
| `POST` | `/api/lists` | Create custom movie list | Yes |
| `GET` | `/api/lists/{id}` | Get single list with contained movies | No |
| `POST` | `/api/lists/{id}/movies` | Add movie to list | Yes |
| `DELETE` | `/api/lists/{id}/movies/{tmdbId}` | Remove movie from list | Yes |
| `DELETE` | `/api/lists/{id}` | Delete custom movie list | Yes |

---

## 7. Social (`/api/social`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/social/follow/{username}` | Follow or unfollow user | Yes |
| `GET` | `/api/social/feed` | Activity feed of followed cinephiles | Optional |
| `GET` | `/api/social/followers/{username}` | List user followers | Optional |
| `GET` | `/api/social/following/{username}` | List users being followed | Optional |

---

## 8. AI Recommendations & Taste Profile (`/api/recommendations`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/recommendations` | Get personalized film recommendations | Optional |
| `GET` | `/api/recommendations/taste-profile` | Get user AI taste profiling summary | Optional |
