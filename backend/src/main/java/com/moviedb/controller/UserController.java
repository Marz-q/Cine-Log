package com.moviedb.controller;

import com.moviedb.dto.*;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.MovieListService;
import com.moviedb.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final MovieListService movieListService;

    public UserController(UserService userService, MovieListService movieListService) {
        this.userService = userService;
        this.movieListService = movieListService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDto> getProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(userService.getProfile(username, currentUserId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        return ResponseEntity.ok(userService.updateProfile(principal.getId(), request));
    }

    @GetMapping("/{username}/watched")
    public ResponseEntity<List<MovieDto>> getUserWatched(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserWatched(username));
    }

    @GetMapping("/{username}/watchlist")
    public ResponseEntity<List<MovieDto>> getUserWatchlist(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserWatchlist(username));
    }

    @GetMapping("/{username}/reviews")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(userService.getUserReviews(username, currentUserId));
    }

    @GetMapping("/{username}/ratings")
    public ResponseEntity<List<RatingResponse>> getUserRatings(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserRatings(username));
    }

    @GetMapping("/{username}/activity")
    public ResponseEntity<List<ActivityDto>> getUserActivity(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserActivity(username));
    }

    @GetMapping("/{username}/lists")
    public ResponseEntity<List<MovieListResponse>> getUserLists(@PathVariable String username) {
        UserProfileDto profile = userService.getProfile(username, null);
        return ResponseEntity.ok(movieListService.getUserLists(profile.getId()));
    }
}
