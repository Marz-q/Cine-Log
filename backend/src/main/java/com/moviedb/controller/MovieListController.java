package com.moviedb.controller;

import com.moviedb.dto.MovieListRequest;
import com.moviedb.dto.MovieListResponse;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.MovieListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lists")
public class MovieListController {

    private final MovieListService movieListService;

    public MovieListController(MovieListService movieListService) {
        this.movieListService = movieListService;
    }

    @GetMapping
    public ResponseEntity<List<MovieListResponse>> getPublicLists() {
        return ResponseEntity.ok(movieListService.getPublicLists());
    }

    @GetMapping("/my")
    public ResponseEntity<List<MovieListResponse>> getMyLists(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        return ResponseEntity.ok(movieListService.getUserLists(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<MovieListResponse> createList(
            @Valid @RequestBody MovieListRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        MovieListResponse response = movieListService.createList(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieListResponse> getListById(@PathVariable Long id) {
        return ResponseEntity.ok(movieListService.getListById(id));
    }

    @PostMapping("/{id}/movies")
    public ResponseEntity<Void> addMovieToList(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        Long tmdbId = ((Number) body.get("tmdbId")).longValue();
        String title = (String) body.get("title");
        String posterPath = (String) body.get("posterPath");
        String backdropPath = (String) body.get("backdropPath");
        String releaseDate = (String) body.get("releaseDate");
        String genres = (String) body.get("genres");

        movieListService.addMovieToList(principal.getId(), id, tmdbId, title, posterPath, backdropPath, releaseDate, genres);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/movies/{tmdbId}")
    public ResponseEntity<Void> removeMovieFromList(
            @PathVariable Long id,
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        movieListService.removeMovieFromList(principal.getId(), id, tmdbId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) throw new UnauthorizedException("Authentication required");
        movieListService.deleteList(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
