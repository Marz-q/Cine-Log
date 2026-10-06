package com.moviedb.controller;

import com.moviedb.dto.RatingRequest;
import com.moviedb.dto.RatingResponse;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public ResponseEntity<RatingResponse> rateMovie(
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        RatingResponse response = ratingService.rateMovie(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{tmdbId}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        ratingService.deleteRating(principal.getId(), tmdbId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/movie/{tmdbId}")
    public ResponseEntity<Map<String, Double>> getMovieRating(
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.ok(Collections.singletonMap("rating", null));
        Double rating = ratingService.getUserRating(principal.getId(), tmdbId);
        return ResponseEntity.ok(Collections.singletonMap("rating", rating));
    }
}
