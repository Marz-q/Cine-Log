package com.moviedb.repository;

import com.moviedb.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovieTmdbIdOrderByCreatedAtDesc(Long tmdbId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Review> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
    long countByUserId(Long userId);
    long countByMovieTmdbId(Long tmdbId);

    @Query("SELECT r FROM Review r WHERE r.user.id IN :userIds ORDER BY r.createdAt DESC")
    List<Review> findRecentByFollowedUserIds(@Param("userIds") List<Long> userIds);

    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findTopRecentReviews();
}
