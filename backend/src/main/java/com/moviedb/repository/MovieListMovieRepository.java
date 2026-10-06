package com.moviedb.repository;

import com.moviedb.entity.MovieListMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieListMovieRepository extends JpaRepository<MovieListMovie, Long> {
    List<MovieListMovie> findByMovieListIdOrderByAddedAtDesc(Long movieListId);
    Optional<MovieListMovie> findByMovieListIdAndMovieTmdbId(Long movieListId, Long tmdbId);
    boolean existsByMovieListIdAndMovieTmdbId(Long movieListId, Long tmdbId);
    void deleteByMovieListIdAndMovieTmdbId(Long movieListId, Long tmdbId);
    long countByMovieListId(Long movieListId);
}
