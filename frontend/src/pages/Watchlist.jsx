import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { MovieGrid } from '../components/MovieGrid';
import { LoadingState } from '../components/LoadingState';

export const Watchlist = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWatchlist = async () => {
      try {
        const data = await userService.getUserWatchlist(user.username);
        setMovies(data);
      } catch (err) {
        console.error('Failed to load watchlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  if (loading) {
    return <LoadingState message="Loading your watchlist..." />;
  }

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bookmark size={22} color="var(--accent-red)" /> Your Watchlist
        </h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--yellow-butter)', fontWeight: 700 }}>
          {movies.length} {movies.length === 1 ? 'Film' : 'Films'}
        </span>
      </div>

      <MovieGrid
        movies={movies}
        emptyMessage="Your watchlist is currently empty. Browse films and click 'Add to Watchlist'!"
      />
    </div>
  );
};
