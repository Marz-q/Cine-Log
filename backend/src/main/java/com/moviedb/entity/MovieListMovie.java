package com.moviedb.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "list_movies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"list_id", "movie_id"})
})
public class MovieListMovie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "list_id", nullable = false)
    private MovieList movieList;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    public MovieListMovie() {
    }

    public MovieListMovie(MovieList movieList, Movie movie) {
        this.movieList = movieList;
        this.movie = movie;
    }

    @PrePersist
    protected void onCreate() {
        this.addedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MovieList getMovieList() {
        return movieList;
    }

    public void setMovieList(MovieList movieList) {
        this.movieList = movieList;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
