package com.moviedb.repository;

import com.moviedb.entity.MovieList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieListRepository extends JpaRepository<MovieList, Long> {
    List<MovieList> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<MovieList> findByIsPublicTrueOrderByCreatedAtDesc();
    long countByUserId(Long userId);
}
