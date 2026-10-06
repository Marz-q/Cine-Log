package com.moviedb.service;

import com.moviedb.config.TmdbConfig;
import com.moviedb.dto.MovieDto;
import com.moviedb.dto.MovieDetailDto;
import com.moviedb.entity.Movie;
import com.moviedb.repository.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);

    private final TmdbConfig tmdbConfig;
    private final MovieRepository movieRepository;
    private final RestTemplate restTemplate;

    public TmdbService(TmdbConfig tmdbConfig, MovieRepository movieRepository, RestTemplate restTemplate) {
        this.tmdbConfig = tmdbConfig;
        this.movieRepository = movieRepository;
        this.restTemplate = restTemplate;
    }

    public List<MovieDto> getPopularMovies() {
        if (tmdbConfig.hasApiKey()) {
            try {
                String url = String.format("%s/movie/popular?api_key=%s&language=en-US&page=1",
                        tmdbConfig.getBaseUrl(), tmdbConfig.getApiKey());
                return fetchMoviesFromTmdb(url);
            } catch (Exception e) {
                log.warn("Failed to fetch popular movies from TMDB API: {}. Using curated movies.", e.getMessage());
            }
        }
        return getCuratedPopularMovies();
    }

    public List<MovieDto> getTrendingMovies() {
        if (tmdbConfig.hasApiKey()) {
            try {
                String url = String.format("%s/trending/movie/week?api_key=%s",
                        tmdbConfig.getBaseUrl(), tmdbConfig.getApiKey());
                return fetchMoviesFromTmdb(url);
            } catch (Exception e) {
                log.warn("Failed to fetch trending movies from TMDB API: {}. Using curated movies.", e.getMessage());
            }
        }
        return getCuratedTrendingMovies();
    }

    public List<MovieDto> getRecentMovies() {
        if (tmdbConfig.hasApiKey()) {
            try {
                String url = String.format("%s/movie/now_playing?api_key=%s&language=en-US&page=1",
                        tmdbConfig.getBaseUrl(), tmdbConfig.getApiKey());
                return fetchMoviesFromTmdb(url);
            } catch (Exception e) {
                log.warn("Failed to fetch recent movies from TMDB API: {}. Using curated movies.", e.getMessage());
            }
        }
        return getCuratedRecentMovies();
    }

    private static final Map<Integer, String> TMDB_GENRES = Map.ofEntries(
            Map.entry(28, "Action"),
            Map.entry(12, "Adventure"),
            Map.entry(16, "Animation"),
            Map.entry(35, "Comedy"),
            Map.entry(80, "Crime"),
            Map.entry(99, "Documentary"),
            Map.entry(18, "Drama"),
            Map.entry(10751, "Family"),
            Map.entry(14, "Fantasy"),
            Map.entry(36, "History"),
            Map.entry(27, "Horror"),
            Map.entry(10402, "Music"),
            Map.entry(9648, "Mystery"),
            Map.entry(10749, "Romance"),
            Map.entry(878, "Sci-Fi"),
            Map.entry(10770, "TV Movie"),
            Map.entry(53, "Thriller"),
            Map.entry(10752, "War"),
            Map.entry(37, "Western")
    );

    public List<MovieDto> searchMovies(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        if (tmdbConfig.hasApiKey()) {
            try {
                URI uri = UriComponentsBuilder.fromHttpUrl(tmdbConfig.getBaseUrl() + "/search/movie")
                        .queryParam("api_key", tmdbConfig.getApiKey())
                        .queryParam("query", query.trim())
                        .queryParam("include_adult", false)
                        .queryParam("language", "en-US")
                        .queryParam("page", 1)
                        .build()
                        .toUri();
                List<MovieDto> results = fetchMoviesFromTmdb(uri);
                if (results != null && !results.isEmpty()) {
                    return results;
                }
            } catch (Exception e) {
                log.warn("Failed to search movies from TMDB API: {}. Searching local repository.", e.getMessage());
            }
        }

        String lowerQuery = query.toLowerCase().trim();
        return getAllCuratedMovies().stream()
                .filter(m -> m.getTitle().toLowerCase().contains(lowerQuery) ||
                        (m.getGenres() != null && m.getGenres().toLowerCase().contains(lowerQuery)) ||
                        (m.getDirector() != null && m.getDirector().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMoviesByGenre(String genre) {
        if (genre == null || genre.trim().isEmpty()) {
            return getPopularMovies();
        }

        String target = genre.toLowerCase().trim();
        return getAllCuratedMovies().stream()
                .filter(m -> m.getGenres() != null && m.getGenres().toLowerCase().contains(target))
                .collect(Collectors.toList());
    }

    public MovieDetailDto getMovieDetails(Long tmdbId) {
        if (tmdbConfig.hasApiKey()) {
            try {
                String url = String.format("%s/movie/%d?api_key=%s&append_to_response=credits,videos&language=en-US",
                        tmdbConfig.getBaseUrl(), tmdbId, tmdbConfig.getApiKey());
                
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return parseTmdbDetailResponse(response.getBody());
                }
            } catch (Exception e) {
                log.warn("Failed to fetch movie {} details from TMDB: {}. Checking local database/catalogue.", tmdbId, e.getMessage());
            }
        }

        // Fallback: check curated catalogue or database
        return getAllCuratedMovieDetails().stream()
                .filter(m -> m.getTmdbId().equals(tmdbId))
                .findFirst()
                .orElseGet(() -> {
                    // Check local Movie entity if cached
                    Optional<Movie> movieOpt = movieRepository.findByTmdbId(tmdbId);
                    if (movieOpt.isPresent()) {
                        Movie m = movieOpt.get();
                        MovieDetailDto dto = new MovieDetailDto();
                        dto.setId(m.getId());
                        dto.setTmdbId(m.getTmdbId());
                        dto.setTitle(m.getTitle());
                        dto.setPosterPath(m.getPosterPath());
                        dto.setBackdropPath(m.getBackdropPath());
                        dto.setReleaseDate(m.getReleaseDate());
                        dto.setOverview(m.getOverview());
                        dto.setVoteAverage(m.getVoteAverage());
                        dto.setRuntime(m.getRuntime());
                        dto.setDirector(m.getDirector());
                        dto.setGenres(m.getGenres());
                        dto.setCast(Arrays.asList("Lead Actor", "Supporting Actor"));
                        return dto;
                    }
                    return null;
                });
    }

    public Movie findOrCreateMovie(Long tmdbId, String title, String posterPath, String backdropPath, String releaseDate, String genres) {
        return movieRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> {
                    Movie movie = new Movie();
                    movie.setTmdbId(tmdbId);
                    movie.setTitle(title != null ? title : "Untitled");
                    movie.setPosterPath(posterPath);
                    movie.setBackdropPath(backdropPath);
                    movie.setReleaseDate(releaseDate);
                    movie.setGenres(genres);
                    return movieRepository.save(movie);
                });
    }

    @SuppressWarnings("unchecked")
    private List<MovieDto> fetchMoviesFromTmdb(URI uri) {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    uri, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
            if (results == null) return Collections.emptyList();

            List<MovieDto> list = new ArrayList<>();
            for (Map<String, Object> item : results) {
                MovieDto dto = mapTmdbItemToDto(item);
                if (dto != null) {
                    list.add(dto);
                }
            }
            return list;
        } catch (Exception e) {
            log.warn("Error fetching movies from TMDB: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<MovieDto> fetchMoviesFromTmdb(String url) {
        return fetchMoviesFromTmdb(URI.create(url));
    }

    @SuppressWarnings("unchecked")
    private MovieDto mapTmdbItemToDto(Map<String, Object> item) {
        try {
            MovieDto dto = new MovieDto();
            dto.setTmdbId(((Number) item.get("id")).longValue());
            dto.setTitle((String) item.get("title"));
            dto.setPosterPath((String) item.get("poster_path"));
            dto.setBackdropPath((String) item.get("backdrop_path"));
            dto.setReleaseDate((String) item.get("release_date"));
            dto.setOverview((String) item.get("overview"));
            if (item.get("vote_average") != null) {
                dto.setVoteAverage(((Number) item.get("vote_average")).doubleValue());
            }

            List<Number> genreIds = (List<Number>) item.get("genre_ids");
            if (genreIds != null && !genreIds.isEmpty()) {
                List<String> names = genreIds.stream()
                        .map(id -> TMDB_GENRES.get(id.intValue()))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                if (!names.isEmpty()) {
                    dto.setGenreList(names);
                    dto.setGenres(String.join(", ", names));
                }
            }
            return dto;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private MovieDetailDto parseTmdbDetailResponse(Map<String, Object> data) {
        MovieDetailDto dto = new MovieDetailDto();
        dto.setTmdbId(((Number) data.get("id")).longValue());
        dto.setTitle((String) data.get("title"));
        dto.setPosterPath((String) data.get("poster_path"));
        dto.setBackdropPath((String) data.get("backdrop_path"));
        dto.setReleaseDate((String) data.get("release_date"));
        dto.setOverview((String) data.get("overview"));
        if (data.get("vote_average") != null) {
            dto.setVoteAverage(((Number) data.get("vote_average")).doubleValue());
        }
        if (data.get("runtime") != null) {
            dto.setRuntime(((Number) data.get("runtime")).intValue());
        }

        // Genres
        List<Map<String, Object>> genresList = (List<Map<String, Object>>) data.get("genres");
        if (genresList != null) {
            List<String> names = genresList.stream()
                    .map(g -> (String) g.get("name"))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            dto.setGenreList(names);
            dto.setGenres(String.join(", ", names));
        }

        // Credits: Director & Cast
        Map<String, Object> credits = (Map<String, Object>) data.get("credits");
        if (credits != null) {
            List<Map<String, Object>> crew = (List<Map<String, Object>>) credits.get("crew");
            if (crew != null) {
                crew.stream()
                        .filter(c -> "Director".equalsIgnoreCase((String) c.get("job")))
                        .findFirst()
                        .ifPresent(d -> dto.setDirector((String) d.get("name")));
            }

            List<Map<String, Object>> castList = (List<Map<String, Object>>) credits.get("cast");
            if (castList != null) {
                List<String> castNames = castList.stream()
                        .limit(6)
                        .map(c -> (String) c.get("name"))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                dto.setCast(castNames);
            }
        }

        // Videos: Trailer
        Map<String, Object> videos = (Map<String, Object>) data.get("videos");
        if (videos != null) {
            List<Map<String, Object>> videoResults = (List<Map<String, Object>>) videos.get("results");
            if (videoResults != null) {
                videoResults.stream()
                        .filter(v -> "Trailer".equalsIgnoreCase((String) v.get("type")) &&
                                "YouTube".equalsIgnoreCase((String) v.get("site")))
                        .findFirst()
                        .ifPresent(v -> {
                            String key = (String) v.get("key");
                            dto.setTrailerKey(key);
                            dto.setTrailerUrl("https://www.youtube.com/watch?v=" + key);
                        });
            }
        }

        // Cache or update in local Movie table
        findOrCreateMovie(dto.getTmdbId(), dto.getTitle(), dto.getPosterPath(), dto.getBackdropPath(), dto.getReleaseDate(), dto.getGenres());

        return dto;
    }

    // ========================================================================
    // Curated High-Quality Movie Catalog (Ensures immediate out-of-the-box UI)
    // Real TMDB IDs, official CDN paths, directors, and trailers
    // ========================================================================

    private List<MovieDto> getCuratedPopularMovies() {
        return getAllCuratedMovies().subList(0, Math.min(8, getAllCuratedMovies().size()));
    }

    private List<MovieDto> getCuratedTrendingMovies() {
        List<MovieDto> all = new ArrayList<>(getAllCuratedMovies());
        Collections.reverse(all);
        return all.subList(0, Math.min(8, all.size()));
    }

    private List<MovieDto> getCuratedRecentMovies() {
        return getAllCuratedMovies().stream()
                .filter(m -> m.getReleaseDate() != null && m.getReleaseDate().compareTo("2020-01-01") >= 0)
                .collect(Collectors.toList());
    }

    private List<MovieDto> getAllCuratedMovies() {
        return getAllCuratedMovieDetails().stream()
                .map(d -> (MovieDto) d)
                .collect(Collectors.toList());
    }

    private List<MovieDetailDto> getAllCuratedMovieDetails() {
        List<MovieDetailDto> list = new ArrayList<>();

        list.add(createCurated(
                693134L,
                "Dune: Part Two",
                "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                "/xOMo8BRK7PfcJv9JCnx7s520fff.jpg",
                "2024-03-01",
                "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
                8.3,
                166,
                "Denis Villeneuve",
                "Sci-Fi, Adventure",
                Arrays.asList("Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem", "Austin Butler", "Florence Pugh"),
                "Way9Dexny3w"
        ));

        list.add(createCurated(
                872585L,
                "Oppenheimer",
                "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                "/fm6KqXpk3M2HVveGHudvKp37AvF.jpg",
                "2023-07-21",
                "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
                8.1,
                180,
                "Christopher Nolan",
                "Drama, History",
                Arrays.asList("Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh"),
                "uYPbbksJxIg"
        ));

        list.add(createCurated(
                496243L,
                "Parasite",
                "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                "/hiKmpnnSantftGFKdEgGd0YvOI5.jpg",
                "2019-05-30",
                "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
                8.5,
                132,
                "Bong Joon-ho",
                "Drama, Thriller, Comedy",
                Arrays.asList("Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik", "Park So-dam"),
                "5xH0R_fxysQ"
        ));

        list.add(createCurated(
                569094L,
                "Spider-Man: Across the Spider-Verse",
                "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
                "2023-06-02",
                "After reuniting with Gwen Stacy, Brooklyn's full-time friendly neighborhood Spider-Man is catapulted across the Multiverse.",
                8.4,
                140,
                "Joaquim Dos Santos",
                "Animation, Action, Sci-Fi",
                Arrays.asList("Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Jake Johnson", "Daniel Kaluuya"),
                "cqGjhVJWtEg"
        ));

        list.add(createCurated(
                157336L,
                "Interstellar",
                "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "/rAiYTsqBkgnKVXrjyXMqQv265QZ.jpg",
                "2014-11-07",
                "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                8.4,
                169,
                "Christopher Nolan",
                "Sci-Fi, Drama, Adventure",
                Arrays.asList("Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine", "Matt Damon"),
                "zSWdZVtXT7E"
        ));

        list.add(createCurated(
                238L,
                "The Godfather",
                "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
                "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
                "1972-03-24",
                "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
                8.7,
                175,
                "Francis Ford Coppola",
                "Crime, Drama",
                Arrays.asList("Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall", "Diane Keaton"),
                "sY1S34973zA"
        ));

        list.add(createCurated(
                129L,
                "Spirited Away",
                "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
                "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
                "2001-07-20",
                "A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage within herself to free them.",
                8.5,
                125,
                "Hayao Miyazaki",
                "Animation, Fantasy, Adventure",
                Arrays.asList("Rumi Hiiragi", "Miyu Irino", "Mari Natsuki", "Takashi Naito"),
                "ByXuk9QqQkk"
        ));

        list.add(createCurated(
                244786L,
                "Whiplash",
                "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
                "/f2t4Jb1v53H68qg4v93t4y7e.jpg",
                "2014-10-10",
                "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost.",
                8.4,
                106,
                "Damien Chazelle",
                "Drama, Music",
                Arrays.asList("Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"),
                "7d_jQycdQGo"
        ));

        list.add(createCurated(
                335984L,
                "Blade Runner 2049",
                "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
                "/ilRyASDvt7v7cpm5V6KKnoxS2h.jpg",
                "2017-10-06",
                "Thirty years after the events of the first film, a new Blade Runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
                8.0,
                164,
                "Denis Villeneuve",
                "Sci-Fi, Mystery, Drama",
                Arrays.asList("Ryan Gosling", "Harrison Ford", "Ana de Armas", "Sylvia Hoeks", "Robin Wright"),
                "gCcx85zbxz4"
        ));

        list.add(createCurated(
                545611L,
                "Everything Everywhere All at Once",
                "/w3LxiVYPqrlexAQoAk529XYho95.jpg",
                "/70aVSo3eeIuKi0077Vq5j5Wf8E.jpg",
                "2022-03-25",
                "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
                7.8,
                139,
                "Daniel Kwan, Daniel Scheinert",
                "Action, Adventure, Sci-Fi",
                Arrays.asList("Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"),
                "wxN1T1uxQ2g"
        ));

        list.add(createCurated(
                666277L,
                "Past Lives",
                "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
                "/2vFuG6bWcuSDVeGGiFAxALvgllp.jpg",
                "2023-06-02",
                "Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora's family emigrates from South Korea. Decades later, they are reunited for one fateful week.",
                7.8,
                105,
                "Celine Song",
                "Drama, Romance",
                Arrays.asList("Greta Lee", "Teo Yoo", "John Magaro"),
                "kA244xCurV8"
        ));

        list.add(createCurated(
                27205L,
                "Inception",
                "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
                "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                "2010-07-16",
                "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life.",
                8.4,
                148,
                "Christopher Nolan",
                "Action, Sci-Fi, Adventure",
                Arrays.asList("Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy", "Ken Watanabe"),
                "YoHD9XEInc0"
        ));

        return list;
    }

    private MovieDetailDto createCurated(Long tmdbId, String title, String poster, String backdrop, String releaseDate,
                                        String overview, Double rating, Integer runtime, String director, String genres,
                                        List<String> cast, String trailerKey) {
        MovieDetailDto dto = new MovieDetailDto();
        dto.setTmdbId(tmdbId);
        dto.setTitle(title);
        dto.setPosterPath(poster);
        dto.setBackdropPath(backdrop);
        dto.setReleaseDate(releaseDate);
        dto.setOverview(overview);
        dto.setVoteAverage(rating);
        dto.setRuntime(runtime);
        dto.setDirector(director);
        dto.setGenres(genres);
        if (genres != null) {
            dto.setGenreList(Arrays.asList(genres.split(",\\s*")));
        }
        dto.setCast(cast);
        dto.setTrailerKey(trailerKey);
        dto.setTrailerUrl("https://www.youtube.com/watch?v=" + trailerKey);
        return dto;
    }
}
