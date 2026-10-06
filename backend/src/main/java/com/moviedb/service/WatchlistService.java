package com.moviedb.service;

import com.moviedb.dto.MovieDto;
import com.moviedb.entity.Movie;
import com.moviedb.entity.User;
import com.moviedb.entity.WatchlistItem;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.UserRepository;
import com.moviedb.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final TmdbService tmdbService;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            UserRepository userRepository,
                            TmdbService tmdbService) {
        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
        this.tmdbService = tmdbService;
    }

    @Transactional
    public boolean toggleWatchlist(Long userId, Long tmdbId, String title, String posterPath, String backdropPath, String releaseDate, String genres) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<WatchlistItem> existing = watchlistRepository.findByUserIdAndMovieTmdbId(userId, tmdbId);
        if (existing.isPresent()) {
            watchlistRepository.delete(existing.get());
            return false;
        } else {
            Movie movie = tmdbService.findOrCreateMovie(tmdbId, title, posterPath, backdropPath, releaseDate, genres);
            watchlistRepository.save(new WatchlistItem(user, movie));
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<MovieDto> getWatchlist(Long userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId).stream()
                .map(item -> DtoMapper.toMovieDto(item.getMovie()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isWatchlist(Long userId, Long tmdbId) {
        return watchlistRepository.existsByUserIdAndMovieTmdbId(userId, tmdbId);
    }
}
