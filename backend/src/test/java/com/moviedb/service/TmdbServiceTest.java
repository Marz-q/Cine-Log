package com.moviedb.service;

import com.moviedb.config.TmdbConfig;
import com.moviedb.dto.MovieDto;
import com.moviedb.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TmdbServiceTest {

    @Mock
    private TmdbConfig tmdbConfig;

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TmdbService tmdbService;

    @BeforeEach
    void setUp() {
        lenient().when(tmdbConfig.getBaseUrl()).thenReturn("https://api.themoviedb.org/3");
        lenient().when(tmdbConfig.getApiKey()).thenReturn("test-api-key");
        lenient().when(tmdbConfig.hasApiKey()).thenReturn(true);
    }

    @Test
    void searchMovies_WhenEmptyQuery_ReturnsEmptyList() {
        List<MovieDto> results = tmdbService.searchMovies("   ");
        assertTrue(results.isEmpty());
    }

    @Test
    void searchMovies_WhenTmdbReturnsResults_ReturnsDtos() {
        Map<String, Object> movieItem = new HashMap<>();
        movieItem.put("id", 157336);
        movieItem.put("title", "Interstellar");
        movieItem.put("poster_path", "/interstellar.jpg");
        movieItem.put("backdrop_path", "/interstellar_bg.jpg");
        movieItem.put("release_date", "2014-11-05");
        movieItem.put("overview", "A team of explorers travel through a wormhole.");
        movieItem.put("vote_average", 8.6);
        movieItem.put("genre_ids", List.of(878, 12));

        Map<String, Object> tmdbResponse = new HashMap<>();
        tmdbResponse.put("results", List.of(movieItem));

        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.ok(tmdbResponse));

        List<MovieDto> results = tmdbService.searchMovies("Interstellar");

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
        MovieDto dto = results.get(0);
        assertEquals(157336L, dto.getTmdbId());
        assertEquals("Interstellar", dto.getTitle());
        assertEquals("2014", dto.getReleaseYear());
        assertTrue(dto.getGenres().contains("Sci-Fi"));
    }

    @Test
    void searchMovies_WhenTmdbFails_FallsBackToCuratedMovies() {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("TMDB service timeout"));

        // Curated list has "Oppenheimer"
        List<MovieDto> results = tmdbService.searchMovies("Oppenheimer");

        assertFalse(results.isEmpty());
        assertEquals("Oppenheimer", results.get(0).getTitle());
    }
}
