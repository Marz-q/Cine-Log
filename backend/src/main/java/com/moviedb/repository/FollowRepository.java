package com.moviedb.repository;

import com.moviedb.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    long countByFollowerId(Long followerId);
    long countByFollowingId(Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
    List<Follow> findByFollowerId(Long followerId);
    List<Follow> findByFollowingId(Long followingId);
}
