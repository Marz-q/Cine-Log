package com.moviedb.repository;

import com.moviedb.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    List<Rating> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    void deleteByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
}
