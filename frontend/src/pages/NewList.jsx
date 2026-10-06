import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, PlusCircle } from 'lucide-react';
import { listService } from '../services/listService';

export const NewList = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');

    try {
      const created = await listService.createList({
        title: title.trim(),
        description: description.trim(),
        isPublic,
      });
      navigate(`/lists/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--yellow-butter)', marginBottom: '0.5rem' }}>
          New Film List
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Curate a collection like "Favorite Neo-Noirs", "Essential 90s Thrillers", or "Comfort Films"
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div
        style={{
          backgroundColor: 'var(--bg-marine-surface)',
          border: '1px solid var(--border-marine)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">List Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Masterpieces of Modern Sci-Fi"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the theme or criteria for the films in this collection..."
              className="form-textarea"
              style={{ minHeight: '110px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.75rem' }}>
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-red)', cursor: 'pointer' }}
            />
            <label htmlFor="isPublic" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Public list (visible to everyone in the Cine-Log community)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/lists')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
