package com.moviedb.repository;

import com.moviedb.entity.WatchedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchedRepository extends JpaRepository<WatchedItem, Long> {
    List<WatchedItem> findByUserIdOrderByWatchedAtDesc(Long userId);
    Optional<WatchedItem> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    boolean existsByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    void deleteByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    long countByUserId(Long userId);
}
