package com.moviedb.controller;

import com.moviedb.dto.CommentRequest;
import com.moviedb.dto.CommentResponse;
import com.moviedb.dto.ReviewRequest;
import com.moviedb.dto.ReviewResponse;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/movie/{tmdbId}")
    public ResponseEntity<List<ReviewResponse>> getMovieReviews(
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(reviewService.getReviewsForMovie(tmdbId, currentUserId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        ReviewResponse created = reviewService.createReview(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        String text = (String) body.get("reviewText");
        Double rating = body.get("rating") != null ? ((Number) body.get("rating")).doubleValue() : null;
        return ResponseEntity.ok(reviewService.updateReview(principal.getId(), id, text, rating));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        reviewService.deleteReview(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Boolean>> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        boolean liked = reviewService.toggleLike(principal.getId(), id);
        return ResponseEntity.ok(Collections.singletonMap("liked", liked));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        CommentResponse response = reviewService.addComment(principal.getId(), id, request.getCommentText());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getComments(id));
    }
}
