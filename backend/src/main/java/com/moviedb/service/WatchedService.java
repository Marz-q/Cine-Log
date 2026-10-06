package com.moviedb.service;

import com.moviedb.dto.MovieDto;
import com.moviedb.entity.Movie;
import com.moviedb.entity.User;
import com.moviedb.entity.WatchedItem;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.UserRepository;
import com.moviedb.repository.WatchedRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WatchedService {

    private final WatchedRepository watchedRepository;
    private final UserRepository userRepository;
    private final TmdbService tmdbService;

    public WatchedService(WatchedRepository watchedRepository,
                          UserRepository userRepository,
                          TmdbService tmdbService) {
        this.watchedRepository = watchedRepository;
        this.userRepository = userRepository;
        this.tmdbService = tmdbService;
    }

    @Transactional
    public boolean toggleWatched(Long userId, Long tmdbId, String title, String posterPath, String backdropPath, String releaseDate, String genres) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<WatchedItem> existing = watchedRepository.findByUserIdAndMovieTmdbId(userId, tmdbId);
        if (existing.isPresent()) {
            watchedRepository.delete(existing.get());
            return false;
        } else {
            Movie movie = tmdbService.findOrCreateMovie(tmdbId, title, posterPath, backdropPath, releaseDate, genres);
            watchedRepository.save(new WatchedItem(user, movie));
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<MovieDto> getWatched(Long userId) {
        return watchedRepository.findByUserIdOrderByWatchedAtDesc(userId).stream()
                .map(item -> DtoMapper.toMovieDto(item.getMovie()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isWatched(Long userId, Long tmdbId) {
        return watchedRepository.existsByUserIdAndMovieTmdbId(userId, tmdbId);
    }
}
