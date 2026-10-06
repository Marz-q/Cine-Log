import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ initialQuery = '', placeholder = 'Search films, directors, genres...', onSearch }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      if (onSearch) {
        onSearch(trimmed);
      } else {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '480px',
      }}
    >
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '12px',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{
          paddingLeft: '38px',
          paddingRight: query ? '38px' : '14px',
          height: '40px',
          borderRadius: '20px',
          backgroundColor: 'var(--bg-marine-surface)',
          borderColor: 'var(--border-marine)',
        }}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
};
