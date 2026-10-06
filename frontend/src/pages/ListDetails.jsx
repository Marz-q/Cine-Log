import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { List as ListIcon, Plus, Trash2, Calendar, User as UserIcon, X } from 'lucide-react';
import { listService } from '../services/listService';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from '../components/MovieCard';
import { LoadingState } from '../components/LoadingState';

export const ListDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add film modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const isOwner = user && list && user.id === list.userId;

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await listService.getListById(id);
      setList(data);
    } catch (err) {
      console.error('Failed to load list:', err);
      setError('Could not load movie list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchMovies = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await movieService.searchMovies(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMovie = async (movie) => {
    try {
      await listService.addMovieToList(id, {
        tmdbId: movie.tmdbId || movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate,
        genres: movie.genres,
      });
      fetchList();
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add movie to list');
    }
  };

  const handleRemoveMovie = async (tmdbId) => {
    if (!window.confirm('Remove this movie from the list?')) return;
    try {
      await listService.removeMovieFromList(id, tmdbId);
      setList((prev) => ({
        ...prev,
        movies: prev.movies.filter((m) => m.tmdbId !== tmdbId && m.id !== tmdbId),
        moviesCount: prev.moviesCount - 1,
      }));
    } catch (err) {
      console.error('Failed to remove movie:', err);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this entire list?')) return;
    try {
      await listService.deleteList(id);
      navigate('/lists');
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading list details..." />;
  }

  if (error || !list) {
    return (
      <div className="main-content">
        <div className="error-banner">{error || 'List not found.'}</div>
        <Link to="/lists" className="btn btn-secondary">
          Back to Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* List Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-marine-surface)',
          border: '1px solid var(--border-marine)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: '0.75rem' }}>
              Custom List
            </span>
            <h1 style={{ fontSize: '2rem', color: 'var(--yellow-butter)', marginBottom: '0.5rem' }}>
              {list.title}
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '720px',
                marginBottom: '1.25rem',
              }}
            >
              {list.description || 'No description provided.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Link
                to={`/profile/${list.username}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}
              >
                <UserIcon size={15} color="var(--yellow-butter)" /> @{list.username}
              </Link>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} /> Created {new Date(list.createdAt).toLocaleDateString()}
              </span>
              <span>
                <strong style={{ color: 'var(--yellow-butter)' }}>{list.movies?.length || 0}</strong> films
              </span>
            </div>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
                <Plus size={15} /> Add Films
              </button>
              <button onClick={handleDeleteList} className="btn btn-outline-red btn-sm">
                <Trash2 size={15} /> Delete List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Movies in List */}
      <div>
        <div className="section-header">
          <h2 className="section-title">Films in this List</h2>
        </div>

        {list.movies && list.movies.length > 0 ? (
          <div className="movie-grid">
            {list.movies.map((movie) => {
              const tmdbId = movie.tmdbId || movie.id;
              return (
                <div key={tmdbId} style={{ position: 'relative' }}>
                  <MovieCard movie={movie} />
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveMovie(tmdbId);
                      }}
                      title="Remove from list"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(7, 15, 26, 0.85)',
                        color: 'var(--accent-red)',
                        border: '1px solid var(--accent-red)',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-state-title">This list has no films yet</p>
            {isOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem' }}
              >
                <Plus size={15} /> Add Films Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Movie Search Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-marine-surface)',
              border: '1px solid var(--border-marine)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--yellow-butter)' }}>Add Film to List</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchMovies} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search film title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                required
              />
              <button type="submit" disabled={searching} className="btn btn-primary">
                {searching ? '...' : 'Search'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {searchResults.map((m) => (
                <div
                  key={m.tmdbId || m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-marine-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-marine)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {m.posterPath && (
                      <img
                        src={
                          m.posterPath.startsWith('http')
                            ? m.posterPath
                            : `https://image.tmdb.org/t/p/w200${m.posterPath}`
                        }
                        alt=""
                        style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '2px' }}
                      />
                    )}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{m.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {m.releaseYear || (m.releaseDate ? m.releaseDate.substring(0, 4) : '')}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleAddMovie(m)} className="btn btn-primary btn-sm">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
