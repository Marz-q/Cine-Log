package com.moviedb.dto;

import java.time.LocalDateTime;

public class UserProfileDto {

    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private long watchedCount;
    private long watchlistCount;
    private long reviewsCount;
    private long ratingsCount;
    private long listsCount;
    private long followersCount;
    private long followingCount;
    private boolean isFollowing;

    public UserProfileDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getWatchedCount() {
        return watchedCount;
    }

    public void setWatchedCount(long watchedCount) {
        this.watchedCount = watchedCount;
    }

    public long getWatchlistCount() {
        return watchlistCount;
    }

    public void setWatchlistCount(long watchlistCount) {
        this.watchlistCount = watchlistCount;
    }

    public long getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(long reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public long getRatingsCount() {
        return ratingsCount;
    }

    public void setRatingsCount(long ratingsCount) {
        this.ratingsCount = ratingsCount;
    }

    public long getListsCount() {
        return listsCount;
    }

    public void setListsCount(long listsCount) {
        this.listsCount = listsCount;
    }

    public long getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(long followersCount) {
        this.followersCount = followersCount;
    }

    public long getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(long followingCount) {
        this.followingCount = followingCount;
    }

    public boolean isFollowing() {
        return isFollowing;
    }

    public void setFollowing(boolean following) {
        isFollowing = following;
    }
}
