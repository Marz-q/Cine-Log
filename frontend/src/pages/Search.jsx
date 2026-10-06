import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { MovieGrid } from '../components/MovieGrid';
import { LoadingState } from '../components/LoadingState';
import { movieService } from '../services/movieService';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const data = await movieService.searchMovies(query);
        setResults(data);
      } catch (err) {
        console.error('Failed to search films:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleSearchSubmit = (newQuery) => {
    setSearchParams({ q: newQuery });
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--yellow-butter)', marginBottom: '1rem' }}>
          Film Search
        </h1>
        <div style={{ maxWidth: '600px' }}>
          <SearchBar initialQuery={query} onSearch={handleSearchSubmit} />
        </div>
      </div>

      {query ? (
        <div>
          <div className="section-header">
            <h2 className="section-title">
              Search Results for <span style={{ color: 'var(--text-primary)' }}>"{query}"</span>
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {results.length} {results.length === 1 ? 'film found' : 'films found'}
            </span>
          </div>

          {loading ? (
            <LoadingState message={`Searching catalog for "${query}"...`} />
          ) : (
            <MovieGrid movies={results} emptyMessage={`No films found matching "${query}"`} />
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-title">Search for Any Film</p>
          <p style={{ fontSize: '0.85rem' }}>
            Find movies by title, director, or genre across our catalog.
          </p>
        </div>
      )}
    </div>
  );
};
