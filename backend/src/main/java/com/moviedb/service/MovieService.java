package com.moviedb.service;

import com.moviedb.dto.MovieDetailDto;
import com.moviedb.dto.MovieDto;
import com.moviedb.entity.Rating;
import com.moviedb.entity.Review;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.repository.RatingRepository;
import com.moviedb.repository.ReviewRepository;
import com.moviedb.repository.WatchedRepository;
import com.moviedb.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final TmdbService tmdbService;
    private final WatchlistRepository watchlistRepository;
    private final WatchedRepository watchedRepository;
    private final RatingRepository ratingRepository;
    private final ReviewRepository reviewRepository;

    public MovieService(TmdbService tmdbService,
                        WatchlistRepository watchlistRepository,
                        WatchedRepository watchedRepository,
                        RatingRepository ratingRepository,
                        ReviewRepository reviewRepository) {
        this.tmdbService = tmdbService;
        this.watchlistRepository = watchlistRepository;
        this.watchedRepository = watchedRepository;
        this.ratingRepository = ratingRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<MovieDto> getPopularMovies() {
        return tmdbService.getPopularMovies();
    }

    public List<MovieDto> getTrendingMovies() {
        return tmdbService.getTrendingMovies();
    }

    public List<MovieDto> getRecentMovies() {
        return tmdbService.getRecentMovies();
    }

    public List<MovieDto> searchMovies(String query) {
        return tmdbService.searchMovies(query);
    }

    public List<MovieDto> getMoviesByGenre(String genre) {
        return tmdbService.getMoviesByGenre(genre);
    }

    public MovieDetailDto getMovieDetails(Long tmdbId, Long currentUserId) {
        MovieDetailDto details = tmdbService.getMovieDetails(tmdbId);
        if (details == null) {
            throw new ResourceNotFoundException("Movie not found with TMDB ID: " + tmdbId);
        }

        if (currentUserId != null) {
            details.setWatchlist(watchlistRepository.existsByUserIdAndMovieTmdbId(currentUserId, tmdbId));
            details.setWatched(watchedRepository.existsByUserIdAndMovieTmdbId(currentUserId, tmdbId));

            Optional<Rating> ratingOpt = ratingRepository.findByUserIdAndMovieTmdbId(currentUserId, tmdbId);
            ratingOpt.ifPresent(rating -> details.setUserRating(rating.getRatingValue()));

            Optional<Review> reviewOpt = reviewRepository.findByUserIdAndMovieTmdbId(currentUserId, tmdbId);
            reviewOpt.ifPresent(review -> details.setUserReviewId(review.getId()));
        }

        return details;
    }
}
