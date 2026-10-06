import re
from typing import Dict, List, Tuple
from app.models.schemas import SentimentResponse

POSITIVE_KEYWORDS = {
    "masterpiece": 1.0, "brilliant": 0.9, "incredible": 0.85, "phenomenal": 0.9,
    "stellar": 0.85, "stunning": 0.8, "captivating": 0.8, "mesmerizing": 0.8,
    "breathtaking": 0.85, "compelling": 0.75, "heartwarming": 0.7, "superb": 0.85,
    "magnificent": 0.85, "genius": 0.9, "loved": 0.75, "love": 0.7, "great": 0.65,
    "good": 0.5, "favorite": 0.8, "perfection": 0.95, "flawless": 0.95,
    "must-watch": 0.85, "entertaining": 0.6, "emotional": 0.5, "original": 0.6
}

NEGATIVE_KEYWORDS = {
    "terrible": -0.9, "awful": -0.9, "horrible": -0.95, "boring": -0.75, "dull": -0.7,
    "worst": -1.0, "waste": -0.85, "unwatchable": -0.95, "disappointing": -0.7,
    "disappointment": -0.75, "poor": -0.65, "bad": -0.6, "mess": -0.7, "flat": -0.6,
    "cliché": -0.6, "cliche": -0.6, "pretentious": -0.65, "forgettable": -0.7,
    "cringe": -0.75, "hated": -0.85, "hate": -0.8, "tedious": -0.75, "pointless": -0.8
}

class SentimentAnalyzer:
    """Modular film review sentiment analyzer."""

    def analyze(self, text: str) -> SentimentResponse:
        if not text or not text.strip():
            return SentimentResponse(score=0.0, label="neutral")

        clean_text = text.lower()
        words = re.findall(r"\b[a-z'-]+\b", clean_text)

        total_score = 0.0
        pos_signals: List[str] = []
        neg_signals: List[str] = []

        for word in words:
            if word in POSITIVE_KEYWORDS:
                weight = POSITIVE_KEYWORDS[word]
                total_score += weight
                pos_signals.append(word)
            elif word in NEGATIVE_KEYWORDS:
                weight = NEGATIVE_KEYWORDS[word]
                total_score += weight
                neg_signals.append(word)

        # Normalize score into [-1.0, 1.0]
        count = len(pos_signals) + len(neg_signals)
        if count == 0:
            final_score = 0.0
            label = "neutral"
        else:
            raw_avg = total_score / (count ** 0.6)
            final_score = round(max(-1.0, min(1.0, raw_avg)), 2)

            if final_score >= 0.25:
                label = "positive"
            elif final_score <= -0.25:
                label = "negative"
            else:
                label = "neutral"

        return SentimentResponse(
            score=final_score,
            label=label,
            positive_signals=list(set(pos_signals))[:5],
            negative_signals=list(set(neg_signals))[:5],
        )

sentiment_analyzer = SentimentAnalyzer()
