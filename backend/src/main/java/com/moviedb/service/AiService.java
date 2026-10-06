package com.moviedb.service;

import com.moviedb.dto.MovieDto;
import com.moviedb.dto.TasteProfileDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> analyzeSentiment(String text) {
        Map<String, Object> result = new HashMap<>();
        if (text == null || text.trim().isEmpty()) {
            result.put("score", 0.0);
            result.put("label", "neutral");
            return result;
        }

        try {
            String url = aiServiceUrl + "/sentiment";
            Map<String, String> request = Collections.singletonMap("text", text);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, new ParameterizedTypeReference<>() {});

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("FastAPI AI sentiment analysis call failed ({}); using rule-based fallback.", e.getMessage());
        }

        // Rule-based graceful fallback
        return ruleBasedSentimentFallback(text);
    }

    public List<MovieDto> getRecommendations(Long userId, List<MovieDto> userHistory) {
        try {
            String url = aiServiceUrl + "/recommendations";
            Map<String, Object> request = new HashMap<>();
            request.put("user_id", userId);
            request.put("history", userHistory);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, new ParameterizedTypeReference<>() {});

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // If FastAPI returned recommendation list
                Object recsObj = response.getBody().get("recommendations");
                if (recsObj instanceof List) {
                    log.info("Received {} recommendations from AI FastAPI service for user {}", ((List<?>) recsObj).size(), userId);
                }
            }
        } catch (Exception e) {
            log.warn("FastAPI recommendation service not reachable ({}); using collaborative heuristic fallback.", e.getMessage());
        }

        return Collections.emptyList();
    }

    public TasteProfileDto getTasteProfile(Long userId, String username, List<String> userGenres, double averageRating, long count) {
        try {
            String url = aiServiceUrl + "/taste-profile/" + userId;
            ResponseEntity<TasteProfileDto> response = restTemplate.getForEntity(url, TasteProfileDto.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("FastAPI taste profile endpoint not reachable ({}); using heuristic taste profiler.", e.getMessage());
        }

        TasteProfileDto dto = new TasteProfileDto();
        dto.setUserId(userId);
        dto.setUsername(username);
        dto.setTopGenres(userGenres.isEmpty() ? Arrays.asList("Sci-Fi", "Drama", "Mystery") : userGenres);
        dto.setAverageRating(Math.round(averageRating * 10.0) / 10.0);
        dto.setTotalMoviesLogged(count);
        dto.setDominantTone(averageRating >= 4.0 ? "Critical & Appreciative" : "Eclectic Cinephile");
        dto.setTasteSummary("Prefers visually rich, narrative-driven cinema with strong thematic focus.");
        return dto;
    }

    private Map<String, Object> ruleBasedSentimentFallback(String text) {
        String lower = text.toLowerCase();
        int score = 0;
        String[] positiveWords = {"masterpiece", "great", "loved", "brilliant", "amazing", "incredible", "favorite", "stellar", "phenomenal", "perfection", "superb", "best"};
        String[] negativeWords = {"terrible", "awful", "boring", "hated", "worst", "waste", "disappointing", "flat", "poor", "dull", "mess"};

        for (String w : positiveWords) {
            if (lower.contains(w)) score++;
        }
        for (String w : negativeWords) {
            if (lower.contains(w)) score--;
        }

        Map<String, Object> map = new HashMap<>();
        double normalized = Math.max(-1.0, Math.min(1.0, score * 0.35));
        map.put("score", Math.round(normalized * 100.0) / 100.0);
        if (score > 0) {
            map.put("label", "positive");
        } else if (score < 0) {
            map.put("label", "negative");
        } else {
            map.put("label", "neutral");
        }
        return map;
    }
}
