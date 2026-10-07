from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import (
    SentimentRequest,
    SentimentResponse,
    RecommendationRequest,
    RecommendationResponse,
    TasteProfileResponse,
    ChatRequest,
    ChatResponse,
)
import os
import json
import urllib.request
import urllib.error
import re
from app.sentiment.analyzer import sentiment_analyzer
from app.recommendation.engine import recommendation_engine

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

app = FastAPI(
    title="Cine-Log AI Microservice",
    description="Sentiment analysis, taste profiling, content-based recommendations, and Groq-powered AI film chatbot.",
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

@app.post("/chat", response_model=ChatResponse)
def cinebot_chat(payload: ChatRequest):
    excluded_str = ""
    if payload.excluded_titles:
        items = [f"- {t.strip()}" for t in payload.excluded_titles if t.strip()]
        if items:
            excluded_str = (
                "\n\nCRITICAL EXCLUSION RULE (HIGHEST PRIORITY):\n"
                "The user has ALREADY watched or added the following films to their watchlist:\n"
                + "\n".join(items)
                + "\nDO NOT SUGGEST OR RECOMMEND ANY OF THE ABOVE TITLES UNDER ANY CIRCUMSTANCES. Recommend other top-notch films instead."
            )

    system_prompt = (
        "You are CineBot, the intelligent and passionate AI Film Curator for Cine-Log (a social film journal for cinephiles).\n"
        "Your mission is to provide compelling, high-quality movie recommendations when the user asks for suggestions or mentions a genre.\n"
        "Always format recommended film titles distinctly as **Title (Year)** so the system can render interactive cards.\n"
        "For each movie, provide a 1-2 sentence compelling reason why it's a must-watch for this genre and highlight its vibe/themes.\n"
        "Keep your tone knowledgeable, welcoming, and cinephile-friendly."
        + excluded_str
    )

    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in payload.messages:
        formatted_messages.append({"role": msg.role, "content": msg.content})

    groq_payload = json.dumps({
        "model": GROQ_MODEL,
        "messages": formatted_messages,
        "temperature": 0.7,
        "max_tokens": 900,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=groq_payload,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Cine-Log-AIService/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            reply_text = data["choices"][0]["message"]["content"]
    except Exception as e:
        # Fallback to secondary model if first fails or timeout
        try:
            groq_payload_fallback = json.dumps({
                "model": "openai/gpt-oss-20b",
                "messages": formatted_messages,
                "temperature": 0.7,
                "max_tokens": 900,
            }).encode("utf-8")
            req_fb = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=groq_payload_fallback,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                    "User-Agent": "Cine-Log-AIService/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req_fb, timeout=15) as resp_fb:
                data_fb = json.loads(resp_fb.read().decode("utf-8"))
                reply_text = data_fb["choices"][0]["message"]["content"]
        except Exception as e2:
            raise HTTPException(status_code=502, detail=f"Failed to communicate with Groq AI: {str(e2)}")

    # Extract suggested titles
    title_matches = re.findall(r"\*\*([^*]+?)(?:\s*\(\d{4}\))?\*\*", reply_text)
    suggested = [t.strip() for t in title_matches if len(t.strip()) > 1]

    return ChatResponse(
        reply=reply_text,
        suggested_titles=suggested,
    )

