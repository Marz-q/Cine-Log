package com.moviedb.controller;

import com.moviedb.dto.MovieDetailDto;
import com.moviedb.dto.MovieDto;
import com.moviedb.security.UserPrincipal;
import com.moviedb.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping("/popular")
    public ResponseEntity<List<MovieDto>> getPopular() {
        return ResponseEntity.ok(movieService.getPopularMovies());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<MovieDto>> getTrending() {
        return ResponseEntity.ok(movieService.getTrendingMovies());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<MovieDto>> getRecent() {
        return ResponseEntity.ok(movieService.getRecentMovies());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieDto>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(movieService.searchMovies(query));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<MovieDto>> getByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(movieService.getMoviesByGenre(genre));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        return ResponseEntity.ok(Arrays.asList(
                "Sci-Fi", "Drama", "Thriller", "Action", "Adventure",
                "Animation", "Crime", "Fantasy", "Mystery", "Romance", "Comedy"
        ));
    }

    @GetMapping("/{tmdbId}")
    public ResponseEntity<MovieDetailDto> getDetails(
            @PathVariable Long tmdbId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(movieService.getMovieDetails(tmdbId, currentUserId));
    }
}
