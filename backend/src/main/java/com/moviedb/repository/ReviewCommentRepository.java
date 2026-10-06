package com.moviedb.repository;

import com.moviedb.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {
    List<ReviewComment> findByReviewIdOrderByCreatedAtAsc(Long reviewId);
    long countByReviewId(Long reviewId);
}
