from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import (
    SentimentRequest,
    SentimentResponse,
    RecommendationRequest,
    RecommendationResponse,
    TasteProfileResponse,
)
from app.sentiment.analyzer import sentiment_analyzer
from app.recommendation.engine import recommendation_engine

app = FastAPI(
    title="Cine-Log AI Microservice",
    description="Sentiment analysis, taste profiling, and content-based movie recommendations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "cine-log-ai-service",
        "version": "1.0.0"
    }

@app.post("/sentiment", response_model=SentimentResponse)
def analyze_review_sentiment(payload: SentimentRequest):
    return sentiment_analyzer.analyze(payload.text)

@app.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest):
    return recommendation_engine.generate_recommendations(payload)

@app.get("/taste-profile/{user_id}", response_model=TasteProfileResponse)
def get_user_taste_profile(user_id: int):
    # Generates a default personalized taste profile for the user
    return recommendation_engine.generate_taste_profile(user_id=user_id, history=[])
