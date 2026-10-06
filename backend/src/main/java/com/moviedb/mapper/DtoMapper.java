package com.moviedb.mapper;

import com.moviedb.dto.*;
import com.moviedb.entity.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DtoMapper {

    public static UserProfileDto toUserProfileDto(User user, long watched, long watchlist, long reviews, long ratings, long lists, long followers, long following, boolean isFollowing) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setBio(user.getBio());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setWatchedCount(watched);
        dto.setWatchlistCount(watchlist);
        dto.setReviewsCount(reviews);
        dto.setRatingsCount(ratings);
        dto.setListsCount(lists);
        dto.setFollowersCount(followers);
        dto.setFollowingCount(following);
        dto.setFollowing(isFollowing);
        return dto;
    }

    public static MovieDto toMovieDto(Movie movie) {
        if (movie == null) return null;
        MovieDto dto = new MovieDto();
        dto.setId(movie.getId());
        dto.setTmdbId(movie.getTmdbId());
        dto.setTitle(movie.getTitle());
        dto.setPosterPath(movie.getPosterPath());
        dto.setBackdropPath(movie.getBackdropPath());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setOverview(movie.getOverview());
        dto.setVoteAverage(movie.getVoteAverage());
        dto.setRuntime(movie.getRuntime());
        dto.setDirector(movie.getDirector());
        dto.setGenres(movie.getGenres());

        if (movie.getGenres() != null && !movie.getGenres().trim().isEmpty()) {
            dto.setGenreList(Arrays.asList(movie.getGenres().split(",\\s*")));
        } else {
            dto.setGenreList(new ArrayList<>());
        }
        return dto;
    }

    public static ReviewResponse toReviewResponse(Review review, long likesCount, long commentsCount, boolean isLiked) {
        ReviewResponse dto = new ReviewResponse();
        dto.setId(review.getId());
        dto.setUserId(review.getUser().getId());
        dto.setUsername(review.getUser().getUsername());
        dto.setDisplayName(review.getUser().getDisplayName());
        dto.setUserAvatar(review.getUser().getAvatarUrl());
        dto.setTmdbId(review.getMovie().getTmdbId());
        dto.setMovieTitle(review.getMovie().getTitle());
        dto.setMoviePoster(review.getMovie().getPosterPath());
        dto.setMovieReleaseDate(review.getMovie().getReleaseDate());
        dto.setRating(review.getRating());
        dto.setReviewText(review.getReviewText());
        dto.setSentimentScore(review.getSentimentScore());
        dto.setSentimentLabel(review.getSentimentLabel());
        dto.setLikesCount(likesCount);
        dto.setCommentsCount(commentsCount);
        dto.setLiked(isLiked);
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }

    public static CommentResponse toCommentResponse(ReviewComment comment) {
        CommentResponse dto = new CommentResponse();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setDisplayName(comment.getUser().getDisplayName());
        dto.setUserAvatar(comment.getUser().getAvatarUrl());
        dto.setCommentText(comment.getCommentText());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    public static RatingResponse toRatingResponse(Rating rating) {
        RatingResponse dto = new RatingResponse();
        dto.setId(rating.getId());
        dto.setUserId(rating.getUser().getId());
        dto.setUsername(rating.getUser().getUsername());
        dto.setTmdbId(rating.getMovie().getTmdbId());
        dto.setMovieTitle(rating.getMovie().getTitle());
        dto.setMoviePoster(rating.getMovie().getPosterPath());
        dto.setRatingValue(rating.getRatingValue());
        dto.setCreatedAt(rating.getCreatedAt());
        return dto;
    }

    public static MovieListResponse toMovieListResponse(MovieList list, long count, List<String> posters) {
        MovieListResponse dto = new MovieListResponse();
        dto.setId(list.getId());
        dto.setUserId(list.getUser().getId());
        dto.setUsername(list.getUser().getUsername());
        dto.setUserDisplayName(list.getUser().getDisplayName());
        dto.setUserAvatar(list.getUser().getAvatarUrl());
        dto.setTitle(list.getTitle());
        dto.setDescription(list.getDescription());
        dto.setIsPublic(list.getIsPublic());
        dto.setMoviesCount(count);
        dto.setPreviewPosters(posters != null ? posters : new ArrayList<>());
        dto.setCreatedAt(list.getCreatedAt());
        dto.setUpdatedAt(list.getUpdatedAt());
        return dto;
    }
}
