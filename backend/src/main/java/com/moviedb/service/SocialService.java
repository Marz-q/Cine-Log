package com.moviedb.service;

import com.moviedb.dto.ActivityDto;
import com.moviedb.dto.UserProfileDto;
import com.moviedb.entity.Follow;
import com.moviedb.entity.Review;
import com.moviedb.entity.User;
import com.moviedb.exception.BadRequestException;
import com.moviedb.exception.ResourceNotFoundException;
import com.moviedb.mapper.DtoMapper;
import com.moviedb.repository.FollowRepository;
import com.moviedb.repository.ReviewRepository;
import com.moviedb.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SocialService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AuthService authService;

    public SocialService(FollowRepository followRepository,
                         UserRepository userRepository,
                         ReviewRepository reviewRepository,
                         AuthService authService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.authService = authService;
    }

    @Transactional
    public boolean toggleFollow(Long followerId, String targetUsername) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found: " + targetUsername));

        if (follower.getId().equals(target.getId())) {
            throw new BadRequestException("You cannot follow yourself");
        }

        Optional<Follow> existing = followRepository.findByFollowerIdAndFollowingId(follower.getId(), target.getId());
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return false;
        } else {
            followRepository.save(new Follow(follower, target));
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivityFeed(Long currentUserId) {
        List<Long> followedIds = followRepository.findByFollowerId(currentUserId).stream()
                .map(f -> f.getFollowing().getId())
                .collect(Collectors.toList());

        List<Review> reviews;
        if (followedIds.isEmpty()) {
            reviews = reviewRepository.findTopRecentReviews();
        } else {
            reviews = reviewRepository.findRecentByFollowedUserIds(followedIds);
            if (reviews.isEmpty()) {
                reviews = reviewRepository.findTopRecentReviews();
            }
        }

        List<ActivityDto> activities = new ArrayList<>();
        for (Review r : reviews) {
            ActivityDto act = new ActivityDto();
            act.setId("rev-" + r.getId());
            act.setType("REVIEWED");
            act.setUserId(r.getUser().getId());
            act.setUsername(r.getUser().getUsername());
            act.setDisplayName(r.getUser().getDisplayName());
            act.setUserAvatar(r.getUser().getAvatarUrl());
            act.setTmdbId(r.getMovie().getTmdbId());
            act.setMovieTitle(r.getMovie().getTitle());
            act.setMoviePoster(r.getMovie().getPosterPath());
            act.setRating(r.getRating());
            act.setDetail(r.getReviewText());
            act.setTimestamp(r.getCreatedAt());
            activities.add(act);
        }

        return activities;
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> getFollowers(String username, Long currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return followRepository.findByFollowingId(user.getId()).stream()
                .map(Follow::getFollower)
                .map(follower -> {
                    boolean isFollowing = currentUserId != null &&
                            followRepository.existsByFollowerIdAndFollowingId(currentUserId, follower.getId());
                    return authService.buildUserProfileDto(follower, isFollowing);
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> getFollowing(String username, Long currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return followRepository.findByFollowerId(user.getId()).stream()
                .map(Follow::getFollowing)
                .map(target -> {
                    boolean isFollowing = currentUserId != null &&
                            followRepository.existsByFollowerIdAndFollowingId(currentUserId, target.getId());
                    return authService.buildUserProfileDto(target, isFollowing);
                }).collect(Collectors.toList());
    }
}
