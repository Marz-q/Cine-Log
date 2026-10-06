package com.moviedb.dto;

import java.util.List;

public class MovieDetailDto extends MovieDto {

    private List<String> cast;
    private String trailerUrl;
    private String trailerKey;
    private boolean isWatched;
    private boolean isWatchlist;
    private Double userRating;
    private Long userReviewId;

    public MovieDetailDto() {
    }

    public List<String> getCast() {
        return cast;
    }

    public void setCast(List<String> cast) {
        this.cast = cast;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public String getTrailerKey() {
        return trailerKey;
    }

    public void setTrailerKey(String trailerKey) {
        this.trailerKey = trailerKey;
    }

    public boolean isWatched() {
        return isWatched;
    }

    public void setWatched(boolean watched) {
        isWatched = watched;
    }

    public boolean isWatchlist() {
        return isWatchlist;
    }

    public void setWatchlist(boolean watchlist) {
        isWatchlist = watchlist;
    }

    public Double getUserRating() {
        return userRating;
    }

    public void setUserRating(Double userRating) {
        this.userRating = userRating;
    }

    public Long getUserReviewId() {
        return userReviewId;
    }

    public void setUserReviewId(Long userReviewId) {
        this.userReviewId = userReviewId;
    }
}
