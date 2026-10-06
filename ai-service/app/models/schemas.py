from typing import List, Optional
from pydantic import BaseModel, Field

class SentimentRequest(BaseModel):
    text: str = Field(..., description="Review text to analyze")

class SentimentResponse(BaseModel):
    score: float = Field(..., description="Sentiment score between -1.0 and 1.0")
    label: str = Field(..., description="positive, neutral, or negative")
    positive_signals: List[str] = Field(default_factory=list)
    negative_signals: List[str] = Field(default_factory=list)

class MovieHistoryItem(BaseModel):
    tmdb_id: int
    title: str
    genres: Optional[str] = None
    rating: Optional[float] = None

class RecommendationRequest(BaseModel):
    user_id: int
    history: List[MovieHistoryItem] = Field(default_factory=list)
    limit: Optional[int] = 6

class RecommendedMovie(BaseModel):
    tmdb_id: int
    title: str
    genres: str
    reason: str
    similarity_score: float

class RecommendationResponse(BaseModel):
    user_id: int
    dominant_genre: str
    recommendations: List[RecommendedMovie]

class TasteProfileResponse(BaseModel):
    user_id: int
    username: Optional[str] = "FilmBuff"
    top_genres: List[str]
    average_rating: float
    total_movies_logged: int
    dominant_tone: str
    taste_summary: str
