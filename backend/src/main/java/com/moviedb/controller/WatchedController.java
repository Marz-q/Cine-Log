package com.moviedb.controller;

import com.moviedb.dto.MovieDto;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.WatchedService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watched")
public class WatchedController {

    private final WatchedService watchedService;

    public WatchedController(WatchedService watchedService) {
        this.watchedService = watchedService;
    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> getWatched(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        return ResponseEntity.ok(watchedService.getWatched(principal.getId()));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleWatched(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        Long tmdbId = ((Number) body.get("tmdbId")).longValue();
        String title = (String) body.get("title");
        String posterPath = (String) body.get("posterPath");
        String backdropPath = (String) body.get("backdropPath");
        String releaseDate = (String) body.get("releaseDate");
        String genres = (String) body.get("genres");

        boolean watched = watchedService.toggleWatched(principal.getId(), tmdbId, title, posterPath, backdropPath, releaseDate, genres);
        return ResponseEntity.ok(Collections.singletonMap("watched", watched));
    }

    @GetMapping("/status/{tmdbId}")
    public ResponseEntity<Map<String, Boolean>> getStatus(
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.ok(Collections.singletonMap("watched", false));
        boolean watched = watchedService.isWatched(principal.getId(), tmdbId);
        return ResponseEntity.ok(Collections.singletonMap("watched", watched));
    }
}
