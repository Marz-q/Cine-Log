package com.moviedb.service;

import com.moviedb.dto.*;
import com.moviedb.entity.Rating;
import com.moviedb.entity.Review;
import com.moviedb.entity.User;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final WatchedRepository watchedRepository;
    private final WatchlistRepository watchlistRepository;
    private final ReviewRepository reviewRepository;
    private final RatingRepository ratingRepository;
    private final MovieListRepository movieListRepository;
    private final ReviewLikeRepository likeRepository;
    private final ReviewCommentRepository commentRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository,
                       FollowRepository followRepository,
                       WatchedRepository watchedRepository,
                       WatchlistRepository watchlistRepository,
                       ReviewRepository reviewRepository,
                       RatingRepository ratingRepository,
                       MovieListRepository movieListRepository,
                       ReviewLikeRepository likeRepository,
                       ReviewCommentRepository commentRepository,
                       AuthService authService) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.watchedRepository = watchedRepository;
        this.watchlistRepository = watchlistRepository;
        this.reviewRepository = reviewRepository;
        this.ratingRepository = ratingRepository;
        this.movieListRepository = movieListRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String username, Long currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        boolean isFollowing = currentUserId != null &&
                followRepository.existsByFollowerIdAndFollowingId(currentUserId, user.getId());

        return authService.buildUserProfileDto(user, isFollowing);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        User updated = userRepository.save(user);
        return authService.buildUserProfileDto(updated, false);
    }

    @Transactional(readOnly = true)
    public List<MovieDto> getUserWatched(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return watchedRepository.findByUserIdOrderByWatchedAtDesc(user.getId()).stream()
                .map(item -> DtoMapper.toMovieDto(item.getMovie()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MovieDto> getUserWatchlist(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return watchlistRepository.findByUserIdOrderByAddedAtDesc(user.getId()).stream()
                .map(item -> DtoMapper.toMovieDto(item.getMovie()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(String username, Long currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(review -> {
                    long likes = likeRepository.countByReviewId(review.getId());
                    long comments = commentRepository.countByReviewId(review.getId());
                    boolean isLiked = currentUserId != null && likeRepository.existsByUserIdAndReviewId(currentUserId, review.getId());
                    return DtoMapper.toReviewResponse(review, likes, comments, isLiked);
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> getUserRatings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return ratingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(DtoMapper::toRatingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getUserActivity(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<ActivityDto> activities = new ArrayList<>();

        // Add reviews
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Review r : reviews) {
            ActivityDto act = new ActivityDto();
            act.setId("rev-" + r.getId());
            act.setType("REVIEWED");
            act.setUserId(user.getId());
            act.setUsername(user.getUsername());
            act.setDisplayName(user.getDisplayName());
            act.setUserAvatar(user.getAvatarUrl());
            act.setTmdbId(r.getMovie().getTmdbId());
            act.setMovieTitle(r.getMovie().getTitle());
            act.setMoviePoster(r.getMovie().getPosterPath());
            act.setRating(r.getRating());
            act.setDetail(r.getReviewText());
            act.setTimestamp(r.getCreatedAt());
            activities.add(act);
        }

        // Add ratings that didn't have full review
        List<Rating> ratings = ratingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Rating rt : ratings) {
            boolean hasReview = reviews.stream().anyMatch(rv -> rv.getMovie().getTmdbId().equals(rt.getMovie().getTmdbId()));
            if (!hasReview) {
                ActivityDto act = new ActivityDto();
                act.setId("rate-" + rt.getId());
                act.setType("RATED");
                act.setUserId(user.getId());
                act.setUsername(user.getUsername());
                act.setDisplayName(user.getDisplayName());
                act.setUserAvatar(user.getAvatarUrl());
                act.setTmdbId(rt.getMovie().getTmdbId());
                act.setMovieTitle(rt.getMovie().getTitle());
                act.setMoviePoster(rt.getMovie().getPosterPath());
                act.setRating(rt.getRatingValue());
                act.setDetail("Rated " + rt.getRatingValue() + " ★");
                act.setTimestamp(rt.getCreatedAt());
                activities.add(act);
            }
        }

        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return activities.stream().limit(25).collect(Collectors.toList());
    }
}
