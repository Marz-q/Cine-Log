import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Film } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const tmdbId = movie.tmdbId || movie.id;
  const title = movie.title || 'Untitled';
  const releaseYear = movie.releaseYear || (movie.releaseDate ? movie.releaseDate.substring(0, 4) : '');
  const rating = movie.voteAverage || movie.rating;

  const getPosterUrl = () => {
    if (!movie.posterPath) return null;
    if (movie.posterPath.startsWith('http')) return movie.posterPath;
    return `https://image.tmdb.org/t/p/w500${movie.posterPath}`;
  };

  const posterUrl = getPosterUrl();
  const primaryGenre = movie.genreList && movie.genreList.length > 0
    ? movie.genreList[0]
    : movie.genres ? movie.genres.split(',')[0].trim() : null;

  return (
    <Link to={`/movie/${tmdbId}`} className="movie-card">
      <div className="movie-poster-wrap">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="movie-poster-img"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="movie-poster-placeholder"
          style={{ display: posterUrl ? 'none' : 'flex' }}
        >
          <Film size={32} style={{ marginBottom: '8px', color: 'var(--yellow-butter)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{title}</span>
        </div>

        {primaryGenre && (
          <span
            className="badge badge-marine"
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(11, 23, 38, 0.85)',
              fontSize: '0.65rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            {primaryGenre}
          </span>
        )}
      </div>

      <div className="movie-card-info">
        <h4 className="movie-card-title" title={title}>
          {title}
        </h4>
        <div className="movie-card-meta">
          <span>{releaseYear || '—'}</span>
          {rating ? (
            <span className="movie-card-rating">
              <Star size={13} fill="currentColor" />
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
