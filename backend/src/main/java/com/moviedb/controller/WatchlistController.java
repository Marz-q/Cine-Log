package com.moviedb.controller;

import com.moviedb.dto.MovieDto;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> getWatchlist(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        return ResponseEntity.ok(watchlistService.getWatchlist(principal.getId()));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleWatchlist(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        Long tmdbId = ((Number) body.get("tmdbId")).longValue();
        String title = (String) body.get("title");
        String posterPath = (String) body.get("posterPath");
        String backdropPath = (String) body.get("backdropPath");
        String releaseDate = (String) body.get("releaseDate");
        String genres = (String) body.get("genres");

        boolean added = watchlistService.toggleWatchlist(principal.getId(), tmdbId, title, posterPath, backdropPath, releaseDate, genres);
        return ResponseEntity.ok(Collections.singletonMap("inWatchlist", added));
    }

    @GetMapping("/status/{tmdbId}")
    public ResponseEntity<Map<String, Boolean>> getStatus(
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.ok(Collections.singletonMap("inWatchlist", false));
        boolean inWatchlist = watchlistService.isWatchlist(principal.getId(), tmdbId);
        return ResponseEntity.ok(Collections.singletonMap("inWatchlist", inWatchlist));
    }
}
