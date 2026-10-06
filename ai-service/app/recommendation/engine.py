from collections import Counter
from typing import List
from app.models.schemas import (
    MovieHistoryItem,
    RecommendationRequest,
    RecommendationResponse,
    RecommendedMovie,
    TasteProfileResponse,
)

CANDIDATE_POOL = [
    {
        "tmdb_id": 693134,
        "title": "Dune: Part Two",
        "genres": "Sci-Fi, Adventure",
        "keywords": ["epic", "desert", "prophecy", "war"]
    },
    {
        "tmdb_id": 872585,
        "title": "Oppenheimer",
        "genres": "Drama, History",
        "keywords": ["atomic", "biography", "quantum", "tension"]
    },
    {
        "tmdb_id": 496243,
        "title": "Parasite",
        "genres": "Drama, Thriller, Comedy",
        "keywords": ["class", "dark comedy", "suspense", "social"]
    },
    {
        "tmdb_id": 569094,
        "title": "Spider-Man: Across the Spider-Verse",
        "genres": "Animation, Action, Sci-Fi",
        "keywords": ["multiverse", "animation", "visuals", "hero"]
    },
    {
        "tmdb_id": 157336,
        "title": "Interstellar",
        "genres": "Sci-Fi, Drama, Adventure",
        "keywords": ["space", "relativity", "wormhole", "family"]
    },
    {
        "tmdb_id": 335984,
        "title": "Blade Runner 2049",
        "genres": "Sci-Fi, Mystery, Drama",
        "keywords": ["cyberpunk", "future", "identity", "noir"]
    },
    {
        "tmdb_id": 545611,
        "title": "Everything Everywhere All at Once",
        "genres": "Action, Adventure, Sci-Fi",
        "keywords": ["multiverse", "family", "martial arts", "absurd"]
    },
    {
        "tmdb_id": 666277,
        "title": "Past Lives",
        "genres": "Drama, Romance",
        "keywords": ["destiny", "memory", "longing", "nyc"]
    },
    {
        "tmdb_id": 244786,
        "title": "Whiplash",
        "genres": "Drama, Music",
        "keywords": ["obsession", "jazz", "perfection", "rivalry"]
    },
    {
        "tmdb_id": 129,
        "title": "Spirited Away",
        "genres": "Animation, Fantasy, Adventure",
        "keywords": ["spirits", "folklore", "coming of age", "ghibli"]
    },
    {
        "tmdb_id": 27205,
        "title": "Inception",
        "genres": "Action, Sci-Fi, Adventure",
        "keywords": ["dreams", "heist", "mind-bending", "physics"]
    },
    {
        "tmdb_id": 238,
        "title": "The Godfather",
        "genres": "Crime, Drama",
        "keywords": ["mafia", "family", "dynasty", "power"]
    }
]

class RecommendationEngine:
    """Content-based recommendation and taste profiling engine."""

    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        watched_ids = {m.tmdb_id for m in request.history}
        genre_weights: Counter = Counter()

        for item in request.history:
            weight = (item.rating or 4.0) / 5.0
            if item.genres:
                for g in [x.strip() for x in item.genres.split(",")]:
                    genre_weights[g] += weight

        if not genre_weights:
            dominant_genre = "Sci-Fi"
            genre_weights["Sci-Fi"] = 2.0
            genre_weights["Drama"] = 1.5
        else:
            dominant_genre = genre_weights.most_common(1)[0][0]

        scored_candidates: List[RecommendedMovie] = []

        for candidate in CANDIDATE_POOL:
            if candidate["tmdb_id"] in watched_ids:
                continue

            candidate_genres = [x.strip() for x in candidate["genres"].split(",")]
            score = sum(genre_weights.get(g, 0.1) for g in candidate_genres)
            normalized_score = round(min(0.98, max(0.65, score / 3.0)), 2)

            reason = f"High match for your preference in {dominant_genre} and visual storytelling."

            scored_candidates.append(
                RecommendedMovie(
                    tmdb_id=candidate["tmdb_id"],
                    title=candidate["title"],
                    genres=candidate["genres"],
                    reason=reason,
                    similarity_score=normalized_score,
                )
            )

        scored_candidates.sort(key=lambda x: x.similarity_score, reverse=True)
        limit = request.limit or 6

        return RecommendationResponse(
            user_id=request.user_id,
            dominant_genre=dominant_genre,
            recommendations=scored_candidates[:limit],
        )

    def generate_taste_profile(self, user_id: int, history: List[MovieHistoryItem]) -> TasteProfileResponse:
        genre_counter: Counter = Counter()
        ratings: List[float] = []

        for item in history:
            if item.rating:
                ratings.append(item.rating)
            if item.genres:
                for g in [x.strip() for x in item.genres.split(",")]:
                    genre_counter[g] += 1

        top_genres = [g for g, _ in genre_counter.most_common(3)]
        if not top_genres:
            top_genres = ["Sci-Fi", "Drama", "Mystery"]

        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 4.2
        tone = "Discerning Critic" if avg_rating < 3.8 else "Generous Cinephile"

        summary = (
            f"Gravitates towards {', '.join(top_genres[:2])} with deep narratives, "
            f"consistently rewarding character nuance and directorial craftsmanship."
        )

        return TasteProfileResponse(
            user_id=user_id,
            top_genres=top_genres,
            average_rating=avg_rating,
            total_movies_logged=len(history),
            dominant_tone=tone,
            taste_summary=summary,
        )

recommendation_engine = RecommendationEngine()
