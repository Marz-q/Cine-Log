import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Flame, Calendar, Film } from 'lucide-react';
import { movieService } from '../services/movieService';
import { MovieGrid } from '../components/MovieGrid';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popData, trendData, recData, genreList] = await Promise.all([
          movieService.getPopular(),
          movieService.getTrending(),
          movieService.getRecent(),
          movieService.getGenres(),
        ]);

        setPopular(popData);
        setTrending(trendData);
        setRecent(recData);
        setGenres(genreList);

        if (isAuthenticated) {
          try {
            const recs = await movieService.getRecommendations();
            setRecommended(recs);
          } catch (e) {
            console.warn('Recommendations fetch non-critical failure:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleSelectGenre = async (genre) => {
    setSelectedGenre(genre);
    setGenreLoading(true);
    try {
      const data = await movieService.getByGenre(genre);
      setGenreMovies(data);
    } catch (err) {
      console.error('Failed to load genre movies:', err);
    } finally {
      setGenreLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading latest cinema releases..." />;
  }

  const featured = trending.length > 0 ? trending[0] : popular[0];

  return (
    <div className="main-content">
      {/* Cinematic Hero Section */}
      {featured && (
        <section
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '3rem',
            backgroundColor: 'var(--bg-marine-surface)',
            border: '1px solid var(--border-marine)',
            minHeight: '340px',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          {featured.backdropPath && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${
                  featured.backdropPath.startsWith('http')
                    ? featured.backdropPath
                    : `https://image.tmdb.org/t/p/original${featured.backdropPath}`
                })`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                filter: 'brightness(0.38)',
              }}
            />
          )}

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '2.5rem 2rem',
              maxWidth: '720px',
            }}
          >
            <span
              className="badge badge-yellow"
              style={{ marginBottom: '0.75rem', display: 'inline-flex' }}
            >
              <Flame size={13} /> Featured Film
            </span>
            <h1
              style={{
                fontSize: '2.4rem',
                color: 'var(--yellow-butter)',
                marginBottom: '0.75rem',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {featured.title}
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: '0 1px 4px rgba(0,0,0,0.7)',
              }}
            >
              {featured.overview}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to={`/movie/${featured.tmdbId || featured.id}`}
                className="btn btn-primary"
              >
                <Film size={16} /> View Film Details
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-secondary">
                  Join Cine-Log
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AI Personalized Recommendations (When available or logged in) */}
      {recommended.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--yellow-butter)" /> Tailored For Your Taste
            </h2>
            <span className="badge badge-yellow">AI Discovery</span>
          </div>
          <MovieGrid movies={recommended} />
        </section>
      )}

      {/* Trending Movies */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-red)" /> Trending This Week
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Community buzz</span>
        </div>
        <MovieGrid movies={trending} />
      </section>

      {/* Popular Movies */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-header">
          <h2 className="section-title">Popular Films</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All-time favorites</span>
        </div>
        <MovieGrid movies={popular} />
      </section>

      {/* Recently Released Movies */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--yellow-butter)" /> In Theaters & Recent
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest releases</span>
        </div>
        <MovieGrid movies={recent} />
      </section>

      {/* Genre Exploration Section */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">Browse By Genre</h2>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => handleSelectGenre(g)}
              className={`btn btn-sm ${
                selectedGenre === g ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {selectedGenre && (
          <div>
            <h3
              style={{
                fontSize: '1.1rem',
                color: 'var(--yellow-butter)',
                marginBottom: '1rem',
              }}
            >
              Showing {selectedGenre} Films
            </h3>
            {genreLoading ? (
              <LoadingState message={`Finding ${selectedGenre} films...`} />
            ) : (
              <MovieGrid movies={genreMovies} emptyMessage={`No films found for genre: ${selectedGenre}`} />
            )}
          </div>
        )}
      </section>
    </div>
  );
};
