import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Eye,
  Bookmark,
  Star,
  MessageSquare,
  Play,
  X,
  Clock,
  Calendar,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { reviewService } from '../services/reviewService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Rating } from '../components/Rating';
import { ReviewCard } from '../components/ReviewCard';
import { LoadingState } from '../components/LoadingState';

export const MovieDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User interaction states
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Review form state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5.0);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [details, reviewList] = await Promise.all([
          movieService.getMovieDetails(id),
          reviewService.getMovieReviews(id),
        ]);

        setMovie(details);
        setReviews(reviewList);
        setIsWatched(details.watched || false);
        setIsWatchlist(details.watchlist || false);
        if (details.userRating) {
          setUserRating(details.userRating);
          setReviewRating(details.userRating);
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
        setError('Could not load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const handleToggleWatched = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userService.toggleWatched({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
      });
      setIsWatched(res.watched);
    } catch (err) {
      console.error('Failed to toggle watched:', err);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userService.toggleWatchlist({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
      });
      setIsWatchlist(res.inWatchlist);
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handleRateSubmit = async (stars) => {
    if (!isAuthenticated) return;
    try {
      await reviewService.rateMovie({
        tmdbId: movie.tmdbId,
        movieTitle: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        ratingValue: stars,
      });
      setUserRating(stars);
      setIsWatched(true);
      setShowRatingModal(false);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !isAuthenticated) return;
    setSubmittingReview(true);
    try {
      const created = await reviewService.createReview({
        tmdbId: movie.tmdbId,
        movieTitle: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
        rating: reviewRating,
        reviewText: reviewText.trim(),
      });

      setReviews((prev) => [created, ...prev]);
      setIsWatched(true);
      setUserRating(reviewRating);
      setShowReviewModal(false);
      setReviewText('');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewUpdated = (updated) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleReviewDeleted = (deletedId) => {
    setReviews((prev) => prev.filter((r) => r.id !== deletedId));
  };

  if (loading) {
    return <LoadingState message="Fetching cinematic details..." />;
  }

  if (error || !movie) {
    return (
      <div className="main-content">
        <div className="error-banner">{error || 'Film not found.'}</div>
        <Link to="/" className="btn btn-secondary">
          Return to Discover
        </Link>
      </div>
    );
  }

  const posterUrl = movie.posterPath
    ? movie.posterPath.startsWith('http')
      ? movie.posterPath
      : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const backdropUrl = movie.backdropPath
    ? movie.backdropPath.startsWith('http')
      ? movie.backdropPath
      : `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  const releaseYear = movie.releaseYear || (movie.releaseDate ? movie.releaseDate.substring(0, 4) : '');

  return (
    <div>
      {/* Backdrop Header */}
      <div
        style={{
          position: 'relative',
          minHeight: '380px',
          backgroundColor: 'var(--bg-marine-darkest)',
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(11,23,38,0.4) 0%, rgba(11,23,38,0.92) 80%, var(--bg-marine-base) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto',
            padding: '2rem 1.5rem 1.5rem 1.5rem',
            display: 'flex',
            gap: '2rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {/* Main Poster */}
          <div
            style={{
              width: '180px',
              aspectRatio: '2 / 3',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--border-marine-light)',
              backgroundColor: 'var(--bg-marine-surface)',
              flexShrink: 0,
            }}
          >
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="movie-poster-placeholder">
                <span style={{ color: 'var(--yellow-butter)', fontWeight: 600 }}>{movie.title}</span>
              </div>
            )}
          </div>

          {/* Core Info */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1
                style={{
                  fontSize: '2.5rem',
                  color: 'var(--yellow-butter)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  display: 'inline',
                }}
              >
                {movie.title}
              </h1>
              {releaseYear && (
                <span
                  style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                  }}
                >
                  ({releaseYear})
                </span>
              )}
            </div>

            {movie.director && (
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <UserIcon size={15} color="var(--yellow-butter)" /> Directed by{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{movie.director}</strong>
              </p>
            )}

            {/* Badges / Metrics */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              {movie.runtime > 0 && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Clock size={15} /> {movie.runtime} min
                </span>
              )}
              {movie.releaseDate && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={15} /> {movie.releaseDate}
                </span>
              )}
              {movie.voteAverage > 0 && (
                <span
                  className="badge badge-yellow"
                  style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}
                >
                  <Star size={14} fill="currentColor" /> {Number(movie.voteAverage).toFixed(1)} / 10
                </span>
              )}
              {movie.trailerKey && (
                <button
                  onClick={() => setShowTrailerModal(true)}
                  className="btn btn-outline-red btn-sm"
                >
                  <Play size={14} fill="currentColor" /> Watch Trailer
                </button>
              )}
            </div>

            {/* Genre tags */}
            {movie.genreList && movie.genreList.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {movie.genreList.map((g) => (
                  <span key={g} className="badge badge-marine">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ paddingTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="details-layout">
          {/* Action Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              backgroundColor: 'var(--bg-marine-surface)',
              border: '1px solid var(--border-marine)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleToggleWatched}
                  className={`btn ${isWatched ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Eye size={16} /> {isWatched ? 'Watched' : 'Mark as Watched'}
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`btn ${isWatchlist ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Bookmark size={16} /> {isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>

                <button
                  onClick={() => setShowRatingModal(true)}
                  className="btn btn-secondary"
                >
                  <Star size={16} color="var(--yellow-butter)" fill={userRating > 0 ? 'var(--yellow-butter)' : 'none'} />
                  {userRating > 0 ? `Rated ${userRating} ★` : 'Rate Film'}
                </button>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-secondary"
                >
                  <MessageSquare size={16} /> Write Review
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Sign in to log, rate, or review this film:
                </span>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Log In
                </Link>
              </div>
            )}
          </div>

          {/* Synopsis & Cast */}
          <section>
            <h3 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              Synopsis
            </h3>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '900px',
              }}
            >
              {movie.overview || 'No synopsis available for this film.'}
            </p>

            {movie.cast && movie.cast.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                  Main Cast
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {movie.cast.map((actor) => (
                    <span
                      key={actor}
                      style={{
                        backgroundColor: 'var(--bg-marine-surface)',
                        border: '1px solid var(--border-marine)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Community Reviews */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Community Reviews ({reviews.length})</h2>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <MessageSquare size={14} /> Write a Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No reviews yet</p>
                <p style={{ fontSize: '0.85rem' }}>
                  Be the first cinephile to share your thoughts on {movie.title}!
                </p>
              </div>
            ) : (
              <div>
                {reviews.map((rev) => (
                  <ReviewCard
                    key={rev.id}
                    review={rev}
                    onReviewUpdated={handleReviewUpdated}
                    onReviewDeleted={handleReviewDeleted}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailerKey && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 15, 26, 0.9)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '860px',
              aspectRatio: '16 / 9',
              backgroundColor: '#000',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailerModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '6px',
                borderRadius: '50%',
                zIndex: 10,
              }}
            >
              <X size={20} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title={`${movie.title} Trailer`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Rating Quick Modal */}
      {showRatingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 15, 26, 0.8)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowRatingModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-marine-surface)',
              border: '1px solid var(--border-marine)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--yellow-butter)' }}>
              Rate {movie.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select a star rating from 1 to 5
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Rating
                value={userRating}
                interactive={true}
                onChange={handleRateSubmit}
                size={28}
              />
            </div>
            <button
              onClick={() => setShowRatingModal(false)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 15, 26, 0.85)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-marine-surface)',
              border: '1px solid var(--border-marine)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              maxWidth: '560px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ color: 'var(--yellow-butter)' }}>Review {movie.title}</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <Rating
                  value={reviewRating}
                  interactive={true}
                  onChange={setReviewRating}
                  size={24}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your perspective on the direction, performances, writing, cinematography..."
                  className="form-textarea"
                  style={{ minHeight: '130px' }}
                  required
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={14} color="var(--yellow-butter)" />
                <span>Our AI service will analyze your review sentiment automatically.</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewText.trim()}
                  className="btn btn-primary"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
