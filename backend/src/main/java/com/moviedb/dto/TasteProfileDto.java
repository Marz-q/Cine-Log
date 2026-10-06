package com.moviedb.dto;

import java.util.List;

public class TasteProfileDto {

    private Long userId;
    private String username;
    private List<String> topGenres;
    private Double averageRating;
    private long totalMoviesLogged;
    private String dominantTone;
    private String tasteSummary;

    public TasteProfileDto() {
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

    public List<String> getTopGenres() {
        return topGenres;
    }

    public void setTopGenres(List<String> topGenres) {
        this.topGenres = topGenres;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalMoviesLogged() {
        return totalMoviesLogged;
    }

    public void setTotalMoviesLogged(long totalMoviesLogged) {
        this.totalMoviesLogged = totalMoviesLogged;
    }

    public String getDominantTone() {
        return dominantTone;
    }

    public void setDominantTone(String dominantTone) {
        this.dominantTone = dominantTone;
    }

    public String getTasteSummary() {
        return tasteSummary;
    }

    public void setTasteSummary(String tasteSummary) {
        this.tasteSummary = tasteSummary;
    }
}
