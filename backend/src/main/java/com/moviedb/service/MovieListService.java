package com.moviedb.service;

import com.moviedb.dto.MovieDto;
import com.moviedb.dto.MovieListRequest;
import com.moviedb.dto.MovieListResponse;
import com.moviedb.entity.Movie;
import com.moviedb.entity.MovieList;
import com.moviedb.entity.MovieListMovie;
import com.moviedb.entity.User;
import com.moviedb.exception.BadRequestException;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.MovieListMovieRepository;
import com.moviedb.repository.MovieListRepository;
import com.moviedb.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieListService {

    private final MovieListRepository movieListRepository;
    private final MovieListMovieRepository movieListMovieRepository;
    private final UserRepository userRepository;
    private final TmdbService tmdbService;

    public MovieListService(MovieListRepository movieListRepository,
                            MovieListMovieRepository movieListMovieRepository,
                            UserRepository userRepository,
                            TmdbService tmdbService) {
        this.movieListRepository = movieListRepository;
        this.movieListMovieRepository = movieListMovieRepository;
        this.userRepository = userRepository;
        this.tmdbService = tmdbService;
    }

    @Transactional
    public MovieListResponse createList(Long userId, MovieListRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MovieList list = new MovieList(user, request.getTitle(), request.getDescription(), request.getIsPublic());
        MovieList saved = movieListRepository.save(list);

        return DtoMapper.toMovieListResponse(saved, 0, List.of());
    }

    @Transactional(readOnly = true)
    public MovieListResponse getListById(Long listId) {
        MovieList list = movieListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie list not found"));

        List<MovieListMovie> listMovies = movieListMovieRepository.findByMovieListIdOrderByAddedAtDesc(listId);
        List<MovieDto> movies = listMovies.stream()
                .map(item -> DtoMapper.toMovieDto(item.getMovie()))
                .collect(Collectors.toList());

        List<String> posters = movies.stream()
                .map(MovieDto::getPosterPath)
                .filter(p -> p != null && !p.isEmpty())
                .limit(5)
                .collect(Collectors.toList());

        MovieListResponse response = DtoMapper.toMovieListResponse(list, movies.size(), posters);
        response.setMovies(movies);
        return response;
    }

    @Transactional
    public void addMovieToList(Long userId, Long listId, Long tmdbId, String title, String posterPath, String backdropPath, String releaseDate, String genres) {
        MovieList list = movieListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie list not found"));

        if (!list.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only add movies to your own lists");
        }

        if (movieListMovieRepository.existsByMovieListIdAndMovieTmdbId(listId, tmdbId)) {
            throw new BadRequestException("Movie is already in this list");
        }

        Movie movie = tmdbService.findOrCreateMovie(tmdbId, title, posterPath, backdropPath, releaseDate, genres);
        movieListMovieRepository.save(new MovieListMovie(list, movie));
    }

    @Transactional
    public void removeMovieFromList(Long userId, Long listId, Long tmdbId) {
        MovieList list = movieListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie list not found"));

        if (!list.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only remove movies from your own lists");
        }

        movieListMovieRepository.deleteByMovieListIdAndMovieTmdbId(listId, tmdbId);
    }

    @Transactional
    public void deleteList(Long userId, Long listId) {
        MovieList list = movieListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie list not found"));

        if (!list.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own lists");
        }

        movieListRepository.delete(list);
    }

    @Transactional(readOnly = true)
    public List<MovieListResponse> getPublicLists() {
        return movieListRepository.findByIsPublicTrueOrderByCreatedAtDesc().stream()
                .map(list -> {
                    List<MovieListMovie> listMovies = movieListMovieRepository.findByMovieListIdOrderByAddedAtDesc(list.getId());
                    List<String> posters = listMovies.stream()
                            .map(lm -> lm.getMovie().getPosterPath())
                            .filter(p -> p != null && !p.isEmpty())
                            .limit(4)
                            .collect(Collectors.toList());
                    return DtoMapper.toMovieListResponse(list, listMovies.size(), posters);
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MovieListResponse> getUserLists(Long userId) {
        return movieListRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(list -> {
                    List<MovieListMovie> listMovies = movieListMovieRepository.findByMovieListIdOrderByAddedAtDesc(list.getId());
                    List<String> posters = listMovies.stream()
                            .map(lm -> lm.getMovie().getPosterPath())
                            .filter(p -> p != null && !p.isEmpty())
                            .limit(4)
                            .collect(Collectors.toList());
                    return DtoMapper.toMovieListResponse(list, listMovies.size(), posters);
                }).collect(Collectors.toList());
    }
}
