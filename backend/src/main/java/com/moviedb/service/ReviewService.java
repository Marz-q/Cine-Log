package com.moviedb.service;

import com.moviedb.dto.CommentResponse;
import com.moviedb.dto.ReviewRequest;
import com.moviedb.dto.ReviewResponse;
import com.moviedb.entity.*;
import com.moviedb.exception.BadRequestException;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.exception.UnauthorizedException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository likeRepository;
    private final ReviewCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;
    private final RatingRepository ratingRepository;
    private final WatchedRepository watchedRepository;
    private final AiService aiService;

    public ReviewService(ReviewRepository reviewRepository,
                         ReviewLikeRepository likeRepository,
                         ReviewCommentRepository commentRepository,
                         UserRepository userRepository,
                         MovieRepository movieRepository,
                         TmdbService tmdbService,
                         RatingRepository ratingRepository,
                         WatchedRepository watchedRepository,
                         AiService aiService) {
        this.reviewRepository = reviewRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
        this.ratingRepository = ratingRepository;
        this.watchedRepository = watchedRepository;
        this.aiService = aiService;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForMovie(Long tmdbId, Long currentUserId) {
        List<Review> reviews = reviewRepository.findByMovieTmdbIdOrderByCreatedAtDesc(tmdbId);
        return reviews.stream().map(review -> {
            long likes = likeRepository.countByReviewId(review.getId());
            long comments = commentRepository.countByReviewId(review.getId());
            boolean isLiked = currentUserId != null && likeRepository.existsByUserIdAndReviewId(currentUserId, review.getId());
            return DtoMapper.toReviewResponse(review, likes, comments, isLiked);
        }).collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
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

        Review review = reviewRepository.findByUserIdAndMovieTmdbId(userId, request.getTmdbId())
                .orElse(new Review());

        review.setUser(user);
        review.setMovie(movie);
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        // AI Sentiment Analysis
        Map<String, Object> sentiment = aiService.analyzeSentiment(request.getReviewText());
        if (sentiment.get("score") instanceof Number) {
            review.setSentimentScore(((Number) sentiment.get("score")).doubleValue());
        }
        if (sentiment.get("label") instanceof String) {
            review.setSentimentLabel((String) sentiment.get("label"));
        }

        Review savedReview = reviewRepository.save(review);

        // Synchronize rating if provided
        if (request.getRating() != null) {
            Rating rating = ratingRepository.findByUserIdAndMovieTmdbId(userId, request.getTmdbId())
                    .orElse(new Rating(user, movie, request.getRating()));
            rating.setRatingValue(request.getRating());
            ratingRepository.save(rating);
        }

        // Auto mark as watched
        if (!watchedRepository.existsByUserIdAndMovieTmdbId(userId, request.getTmdbId())) {
            watchedRepository.save(new WatchedItem(user, movie));
        }

        return DtoMapper.toReviewResponse(savedReview, 0, 0, false);
    }

    @Transactional
    public ReviewResponse updateReview(Long userId, Long reviewId, String reviewText, Double rating) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own reviews");
        }

        review.setReviewText(reviewText);
        if (rating != null) {
            review.setRating(rating);
            ratingRepository.findByUserIdAndMovieTmdbId(userId, review.getMovie().getTmdbId())
                    .ifPresent(r -> {
                        r.setRatingValue(rating);
                        ratingRepository.save(r);
                    });
        }

        Map<String, Object> sentiment = aiService.analyzeSentiment(reviewText);
        if (sentiment.get("score") instanceof Number) {
            review.setSentimentScore(((Number) sentiment.get("score")).doubleValue());
        }
        if (sentiment.get("label") instanceof String) {
            review.setSentimentLabel((String) sentiment.get("label"));
        }

        Review updated = reviewRepository.save(review);
        long likes = likeRepository.countByReviewId(updated.getId());
        long comments = commentRepository.countByReviewId(updated.getId());
        boolean isLiked = likeRepository.existsByUserIdAndReviewId(userId, updated.getId());

        return DtoMapper.toReviewResponse(updated, likes, comments, isLiked);
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own reviews");
        }

        likeRepository.deleteByUserIdAndReviewId(userId, reviewId);
        reviewRepository.delete(review);
    }

    @Transactional
    public boolean toggleLike(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<ReviewLike> existing = likeRepository.findByUserIdAndReviewId(userId, reviewId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            return false;
        } else {
            likeRepository.save(new ReviewLike(user, review));
            return true;
        }
    }

    @Transactional
    public CommentResponse addComment(Long userId, Long reviewId, String commentText) {
        if (commentText == null || commentText.trim().isEmpty()) {
            throw new BadRequestException("Comment cannot be empty");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ReviewComment comment = new ReviewComment(user, review, commentText.trim());
        ReviewComment saved = commentRepository.save(comment);

        return DtoMapper.toCommentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long reviewId) {
        return commentRepository.findByReviewIdOrderByCreatedAtAsc(reviewId).stream()
                .map(DtoMapper::toCommentResponse)
                .collect(Collectors.toList());
    }
}
