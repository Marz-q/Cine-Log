import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, PlusCircle, Film } from 'lucide-react';
import { listService } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { LoadingState } from '../components/LoadingState';

export const Lists = () => {
  const { isAuthenticated } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await listService.getPublicLists();
        setLists(data);
      } catch (err) {
        console.error('Failed to load lists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  if (loading) {
    return <LoadingState message="Loading community movie lists..." />;
  }

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <List size={22} color="var(--yellow-butter)" /> Community Movie Lists
        </h1>
        {isAuthenticated && (
          <Link to="/lists/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Create a List
          </Link>
        )}
      </div>

      {lists.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No Lists Created Yet</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Curate your favorite horror, sci-fi, or indie films and share them with the community.
          </p>
          {isAuthenticated && (
            <Link to="/lists/new" className="btn btn-primary btn-sm">
              Create the First List
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {lists.map((list) => (
            <Link
              key={list.id}
              to={`/lists/${list.id}`}
              style={{
                backgroundColor: 'var(--bg-marine-surface)',
                border: '1px solid var(--border-marine)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              className="list-card"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <UserAvatar username={list.username} avatarUrl={list.userAvatar} size="sm" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    by <strong style={{ color: 'var(--text-primary)' }}>@{list.username}</strong>
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    color: 'var(--yellow-butter)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {list.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {list.description || 'No description provided.'}
                </p>
              </div>

              {/* Poster Filmstrip Preview */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    height: '80px',
                    backgroundColor: 'var(--bg-marine-darkest)',
                    padding: '6px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  {list.previewPosters && list.previewPosters.length > 0 ? (
                    list.previewPosters.map((poster, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '45px',
                          height: '100%',
                          backgroundColor: 'var(--bg-marine-card)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={
                            poster.startsWith('http')
                              ? poster
                              : `https://image.tmdb.org/t/p/w200${poster}`
                          }
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        gap: '4px',
                      }}
                    >
                      <Film size={14} /> Empty List
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>{list.moviesCount} films</span>
                  <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
