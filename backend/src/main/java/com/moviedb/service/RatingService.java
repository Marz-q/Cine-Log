package com.moviedb.service;

import com.moviedb.dto.RatingRequest;
import com.moviedb.dto.RatingResponse;
import com.moviedb.entity.Movie;
import com.moviedb.entity.Rating;
import com.moviedb.entity.User;
import com.moviedb.entity.WatchedItem;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.MovieRepository;
import com.moviedb.repository.RatingRepository;
import com.moviedb.repository.UserRepository;
import com.moviedb.repository.WatchedRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final TmdbService tmdbService;
    private final WatchedRepository watchedRepository;

    public RatingService(RatingRepository ratingRepository,
                         UserRepository userRepository,
                         TmdbService tmdbService,
                         WatchedRepository watchedRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.tmdbService = tmdbService;
        this.watchedRepository = watchedRepository;
    }

    @Transactional
    public RatingResponse rateMovie(Long userId, RatingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Movie movie = tmdbService.findOrCreateMovie(
                request.getTmdbId(),
                request.getMovieTitle(),
                request.getPosterPath(),
                request.getBackdropPath(),
                request.getReleaseDate(),
                request.getGenres()
        );

        Rating rating = ratingRepository.findByUserIdAndMovieTmdbId(userId, request.getTmdbId())
                .orElse(new Rating(user, movie, request.getRatingValue()));

        rating.setRatingValue(request.getRatingValue());
        Rating saved = ratingRepository.save(rating);

        if (!watchedRepository.existsByUserIdAndMovieTmdbId(userId, request.getTmdbId())) {
            watchedRepository.save(new WatchedItem(user, movie));
        }

        return DtoMapper.toRatingResponse(saved);
    }

    @Transactional
    public void deleteRating(Long userId, Long tmdbId) {
        ratingRepository.deleteByUserIdAndMovieTmdbId(userId, tmdbId);
    }

    @Transactional(readOnly = true)
    public Double getUserRating(Long userId, Long tmdbId) {
        return ratingRepository.findByUserIdAndMovieTmdbId(userId, tmdbId)
                .map(Rating::getRatingValue)
                .orElse(null);
    }
}
