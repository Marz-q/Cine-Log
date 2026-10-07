import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles } from 'lucide-react';
import { userService } from '../services/userService';
import { movieService } from '../services/movieService';
import { UserAvatar } from '../components/UserAvatar';
import { LoadingState } from '../components/LoadingState';

export const Feed = () => {
  const [activities, setActivities] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [feedData, tasteData] = await Promise.all([
          userService.getSocialFeed(),
          movieService.getTasteProfile().catch(() => null),
        ]);
        setActivities(feedData);
        setTasteProfile(tasteData);
      } catch (err) {
        console.error('Failed to load social feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return <LoadingState message="Loading community activity..." />;
  }

  return (
    <div className="main-content">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="feed-layout">
        {/* Left Column: Activity Feed */}
        <div>
          <div className="section-header">
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={22} color="var(--accent-red)" /> Friend & Community Activity
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest updates</span>
          </div>

          {activities.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No Activity Yet</p>
              <p style={{ fontSize: '0.85rem' }}>
                Follow other cinephiles or log your own films to see activity here!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    backgroundColor: 'var(--bg-marine-surface)',
                    border: '1px solid var(--border-marine)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '1rem',
                  }}
                >
                  <Link to={`/profile/${act.username}`}>
                    <UserAvatar username={act.username} avatarUrl={act.userAvatar} size="md" />
                  </Link>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Link
                          to={`/profile/${act.username}`}
                          style={{ fontWeight: 700, color: 'var(--text-primary)' }}
                        >
                          {act.displayName || act.username}
                        </Link>{' '}
                        {act.type === 'REVIEWED' ? 'reviewed' : act.type === 'RATED' ? 'rated' : 'watched'}{' '}
                        <Link
                          to={`/movie/${act.tmdbId}`}
                          style={{ fontWeight: 700, color: 'var(--yellow-butter)' }}
                        >
                          {act.movieTitle}
                        </Link>
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {act.rating && (
                      <div style={{ marginBottom: '0.4rem', color: 'var(--yellow-butter)', fontSize: '0.85rem', fontWeight: 700 }}>
                        ★ {act.rating}
                      </div>
                    )}

                    {act.detail && (
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          backgroundColor: 'var(--bg-marine-card)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--accent-red)',
                        }}
                      >
                        {act.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Taste Profile Card */}
        {tasteProfile && (
          <aside
            style={{
              backgroundColor: 'var(--bg-marine-surface)',
              border: '1px solid var(--border-marine)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              height: 'fit-content',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--yellow-butter)" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--yellow-butter)' }}>Your AI Taste Profile</h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Dominant Tone
              </span>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {tasteProfile.dominantTone}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Top Preferred Genres
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '4px' }}>
                {tasteProfile.topGenres?.map((g) => (
                  <span key={g} className="badge badge-yellow">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Taste Synthesis
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                {tasteProfile.tasteSummary}
              </p>
            </div>
          </aside>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .feed-layout {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
