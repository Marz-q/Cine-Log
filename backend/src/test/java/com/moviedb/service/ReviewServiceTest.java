package com.moviedb.service;

import com.moviedb.dto.ReviewRequest;
import com.moviedb.dto.ReviewResponse;
import com.moviedb.entity.Movie;
import com.moviedb.entity.Review;
import com.moviedb.entity.User;
import com.moviedb.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewLikeRepository likeRepository;
    @Mock
    private ReviewCommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MovieRepository movieRepository;
    @Mock
    private TmdbService tmdbService;
    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private WatchedRepository watchedRepository;
    @Mock
    private AiService aiService;

    @InjectMocks
    private ReviewService reviewService;

    private User sampleUser;
    private Movie sampleMovie;

    @BeforeEach
    void setUp() {
        sampleUser = new User("filmbuff", "filmbuff@example.com", "pass", "Film Buff");
        sampleUser.setId(1L);

        sampleMovie = new Movie(693134L, "Dune: Part Two", "/poster.jpg", "/backdrop.jpg", "2024-03-01", "Overview", 8.3, 166, "Denis Villeneuve", "Sci-Fi");
        sampleMovie.setId(10L);
    }

    @Test
    void createReview_Success() {
        ReviewRequest req = new ReviewRequest();
        req.setTmdbId(693134L);
        req.setMovieTitle("Dune: Part Two");
        req.setReviewText("An absolute masterpiece of modern cinema!");
        req.setRating(5.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(tmdbService.findOrCreateMovie(eq(693134L), any(), any(), any(), any(), any())).thenReturn(sampleMovie);
        when(reviewRepository.findByUserIdAndMovieTmdbId(1L, 693134L)).thenReturn(Optional.empty());
        when(aiService.analyzeSentiment(anyString())).thenReturn(Map.of("score", 0.9, "label", "positive"));

        Review savedReview = new Review(sampleUser, sampleMovie, 5.0, req.getReviewText());
        savedReview.setId(100L);
        savedReview.setSentimentScore(0.9);
        savedReview.setSentimentLabel("positive");

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        ReviewResponse response = reviewService.createReview(1L, req);

        assertNotNull(response);
        assertEquals("An absolute masterpiece of modern cinema!", response.getReviewText());
        assertEquals("positive", response.getSentimentLabel());
        assertEquals(5.0, response.getRating());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void toggleLike_WhenNotLiked_AddsLike() {
        Review review = new Review(sampleUser, sampleMovie, 4.5, "Great film");
        review.setId(50L);

        when(reviewRepository.findById(50L)).thenReturn(Optional.of(review));
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(likeRepository.findByUserIdAndReviewId(1L, 50L)).thenReturn(Optional.empty());

        boolean liked = reviewService.toggleLike(1L, 50L);

        assertTrue(liked);
        verify(likeRepository).save(any());
    }
}
