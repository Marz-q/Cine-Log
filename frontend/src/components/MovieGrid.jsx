import React from 'react';
import { MovieCard } from './MovieCard';

export const MovieGrid = ({ movies = [], emptyMessage = 'No films found.' }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">{emptyMessage}</p>
        <p style={{ fontSize: '0.85rem' }}>Try searching for a different title or explore popular releases.</p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => {
        const key = movie.tmdbId || movie.id;
        return <MovieCard key={key} movie={movie} />;
      })}
    </div>
  );
};
