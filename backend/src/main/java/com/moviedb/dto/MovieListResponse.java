package com.moviedb.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MovieListResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userDisplayName;
    private String userAvatar;
    private String title;
    private String description;
    private Boolean isPublic;
    private long moviesCount;
    private List<String> previewPosters = new ArrayList<>();
    private List<MovieDto> movies = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MovieListResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserDisplayName() {
        return userDisplayName;
    }

    public void setUserDisplayName(String userDisplayName) {
        this.userDisplayName = userDisplayName;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public long getMoviesCount() {
        return moviesCount;
    }

    public void setMoviesCount(long moviesCount) {
        this.moviesCount = moviesCount;
    }

    public List<String> getPreviewPosters() {
        return previewPosters;
    }

    public void setPreviewPosters(List<String> previewPosters) {
        this.previewPosters = previewPosters;
    }

    public List<MovieDto> getMovies() {
        return movies;
    }

    public void setMovies(List<MovieDto> movies) {
        this.movies = movies;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
