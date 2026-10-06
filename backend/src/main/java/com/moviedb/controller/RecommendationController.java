package com.moviedb.controller;

import com.moviedb.dto.MovieDto;
import com.moviedb.dto.TasteProfileDto;
import com.moviedb.entity.Rating;
import com.moviedb.entity.WatchedItem;
import com.moviedb.repository.RatingRepository;
import com.moviedb.repository.WatchedRepository;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.AiService;
import com.moviedb.service.TmdbService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final AiService aiService;
    private final TmdbService tmdbService;
    private final WatchedRepository watchedRepository;
    private final RatingRepository ratingRepository;

    public RecommendationController(AiService aiService,
                                    TmdbService tmdbService,
                                    WatchedRepository watchedRepository,
                                    RatingRepository ratingRepository) {
        this.aiService = aiService;
        this.tmdbService = tmdbService;
        this.watchedRepository = watchedRepository;
        this.ratingRepository = ratingRepository;
    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> getRecommendations(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.ok(tmdbService.getPopularMovies());
        }

        List<WatchedItem> watched = watchedRepository.findByUserIdOrderByWatchedAtDesc(principal.getId());
        Set<Long> watchedTmdbIds = watched.stream()
                .map(w -> w.getMovie().getTmdbId())
                .collect(Collectors.toSet());

        // Extract user favorite genres
        Map<String, Integer> genreCounts = new HashMap<>();
        for (WatchedItem item : watched) {
            String genres = item.getMovie().getGenres();
            if (genres != null) {
                for (String g : genres.split(",\\s*")) {
                    genreCounts.put(g, genreCounts.getOrDefault(g, 0) + 1);
                }
            }
        }

        String topGenre = genreCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Sci-Fi");

        List<MovieDto> genreMovies = tmdbService.getMoviesByGenre(topGenre).stream()
                .filter(m -> !watchedTmdbIds.contains(m.getTmdbId()))
                .limit(8)
                .collect(Collectors.toList());

        if (genreMovies.isEmpty()) {
            genreMovies = tmdbService.getPopularMovies().stream()
                    .filter(m -> !watchedTmdbIds.contains(m.getTmdbId()))
                    .limit(8)
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(genreMovies);
    }

    @GetMapping("/taste-profile")
    public ResponseEntity<TasteProfileDto> getTasteProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 1L;
        String username = principal != null ? principal.getUsername() : "Guest";

        List<WatchedItem> watched = watchedRepository.findByUserIdOrderByWatchedAtDesc(userId);
        List<Rating> ratings = ratingRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, Integer> genreCounts = new HashMap<>();
        for (WatchedItem item : watched) {
            String genres = item.getMovie().getGenres();
            if (genres != null) {
                for (String g : genres.split(",\\s*")) {
                    genreCounts.put(g, genreCounts.getOrDefault(g, 0) + 1);
                }
            }
        }

        List<String> topGenres = genreCounts.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        double avgRating = ratings.isEmpty() ? 4.2 :
                ratings.stream().mapToDouble(Rating::getRatingValue).average().orElse(4.2);

        TasteProfileDto profile = aiService.getTasteProfile(userId, username, topGenres, avgRating, watched.size());
        return ResponseEntity.ok(profile);
    }
}
