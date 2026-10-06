package com.moviedb.repository;

import com.moviedb.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(Long userId);
    Optional<WatchlistItem> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    boolean existsByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    void deleteByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    long countByUserId(Long userId);
}
