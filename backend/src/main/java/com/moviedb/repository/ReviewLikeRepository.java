package com.moviedb.repository;

import com.moviedb.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    long countByReviewId(Long reviewId);
    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);
    Optional<ReviewLike> findByUserIdAndReviewId(Long userId, Long reviewId);
    void deleteByUserIdAndReviewId(Long userId, Long reviewId);
}
