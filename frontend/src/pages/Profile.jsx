import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Eye,
  Bookmark,
  MessageSquare,
  Star,
  List as ListIcon,
  Users,
  Edit2,
  Calendar,
  UserPlus,
  UserMinus,
  X,
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { MovieGrid } from '../components/MovieGrid';
import { ReviewCard } from '../components/ReviewCard';
import { LoadingState } from '../components/LoadingState';

export const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('watched'); // watched, watchlist, reviews, ratings, lists, activity
  const [loading, setLoading] = useState(true);

  // Tab content states
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getProfile(username);
        setProfile(data);
        setEditDisplayName(data.displayName || '');
        setEditBio(data.bio || '');
        setEditAvatarUrl(data.avatarUrl || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Fetch active tab data
  useEffect(() => {
    if (!profile) return;

    const loadTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === 'watched') {
          const data = await userService.getUserWatched(username);
          setWatchedMovies(data);
        } else if (activeTab === 'watchlist') {
          const data = await userService.getUserWatchlist(username);
          setWatchlistMovies(data);
        } else if (activeTab === 'reviews') {
          const data = await userService.getUserReviews(username);
          setReviews(data);
        } else if (activeTab === 'ratings') {
          const data = await userService.getUserRatings(username);
          setRatings(data);
        } else if (activeTab === 'lists') {
          const data = await userService.getUserLists(username);
          setUserLists(data);
        } else if (activeTab === 'activity') {
          const data = await userService.getUserActivity(username);
          setActivity(data);
        }
      } catch (err) {
        console.error('Failed to load tab data:', err);
      } finally {
        setTabLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, username, profile]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userService.toggleFollow(username);
      setProfile((prev) => ({
        ...prev,
        following: res.following,
        followersCount: res.following ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
      }));
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await userService.updateProfile({
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatarUrl.trim(),
      });
      setProfile(updated);
      updateUser(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading cinephile profile..." />;
  }

  if (!profile) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <p className="empty-state-title">User Not Found</p>
          <p style={{ fontSize: '0.85rem' }}>No member exists with username @{username}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Profile Header Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-marine-surface)',
          border: '1px solid var(--border-marine)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2rem',
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
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <UserAvatar username={profile.username} avatarUrl={profile.avatarUrl} size="xl" />
            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--yellow-butter)', marginBottom: '0.25rem' }}>
                {profile.displayName || profile.username}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                @{profile.username}
              </p>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '520px',
                  marginBottom: '0.75rem',
                }}
              >
                {profile.bio || 'Film enthusiast exploring cinema on Cine-Log.'}
              </p>
              {profile.createdAt && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={13} /> Member since {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : isAuthenticated ? (
              <button
                onClick={handleToggleFollow}
                className={`btn btn-sm ${profile.following ? 'btn-secondary' : 'btn-primary'}`}
              >
                {profile.following ? (
                  <>
                    <UserMinus size={14} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Follow
                  </>
                )}
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Follow
              </Link>
            )}
          </div>
        </div>

        {/* Profile Metric Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-marine)',
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yellow-butter)' }}>
              {profile.watchedCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Watched
            </p>
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.watchlistCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Watchlist
            </p>
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.reviewsCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Reviews
            </p>
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.ratingsCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ratings
            </p>
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.listsCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Lists
            </p>
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.followersCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Followers
            </p>
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.followingCount}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Following
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-marine)',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'watched', label: 'Watched', icon: Eye, count: profile.watchedCount },
          { key: 'watchlist', label: 'Watchlist', icon: Bookmark, count: profile.watchlistCount },
          { key: 'reviews', label: 'Reviews', icon: MessageSquare, count: profile.reviewsCount },
          { key: 'ratings', label: 'Ratings', icon: Star, count: profile.ratingsCount },
          { key: 'lists', label: 'Lists', icon: ListIcon, count: profile.listsCount },
          { key: 'activity', label: 'Activity', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive ? 'var(--yellow-butter)' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid var(--accent-red)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: isActive ? 'var(--accent-red)' : 'var(--bg-marine-card)',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    marginLeft: '2px',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {tabLoading ? (
        <LoadingState message="Loading profile collection..." />
      ) : (
        <div>
          {/* Watched Tab */}
          {activeTab === 'watched' && (
            <MovieGrid
              movies={watchedMovies}
              emptyMessage={`@${profile.username} hasn't logged any watched films yet.`}
            />
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <MovieGrid
              movies={watchlistMovies}
              emptyMessage={`@${profile.username}'s watchlist is currently empty.`}
            />
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No Reviews Written</p>
                  <p style={{ fontSize: '0.85rem' }}>This user hasn't written any film reviews yet.</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <Link
                        to={`/movie/${r.tmdbId}`}
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: 'var(--yellow-butter)',
                        }}
                      >
                        {r.movieTitle} {r.movieReleaseDate ? `(${r.movieReleaseDate.substring(0, 4)})` : ''}
                      </Link>
                    </div>
                    <ReviewCard review={r} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div>
              {ratings.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No Ratings Given</p>
                  <p style={{ fontSize: '0.85rem' }}>This user hasn't rated any films yet.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {ratings.map((rt) => (
                    <div
                      key={rt.id}
                      style={{
                        backgroundColor: 'var(--bg-marine-surface)',
                        border: '1px solid var(--border-marine)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <Link
                          to={`/movie/${rt.tmdbId}`}
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {rt.movieTitle}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(rt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="badge badge-yellow" style={{ fontSize: '0.85rem' }}>
                        ★ {rt.ratingValue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lists Tab */}
          {activeTab === 'lists' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                {isOwnProfile && (
                  <Link to="/lists/new" className="btn btn-primary btn-sm">
                    + Create New List
                  </Link>
                )}
              </div>
              {userLists.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No Movie Lists</p>
                  <p style={{ fontSize: '0.85rem' }}>This user hasn't created any custom lists yet.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {userLists.map((list) => (
                    <Link
                      key={list.id}
                      to={`/lists/${list.id}`}
                      style={{
                        backgroundColor: 'var(--bg-marine-surface)',
                        border: '1px solid var(--border-marine)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.15rem', color: 'var(--yellow-butter)', marginBottom: '0.35rem' }}>
                          {list.title}
                        </h3>
                        <p
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            marginBottom: '1rem',
                          }}
                        >
                          {list.description || 'No description provided.'}
                        </p>
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Stream Tab */}
          {activeTab === 'activity' && (
            <div>
              {activity.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No Recent Activity</p>
                  <p style={{ fontSize: '0.85rem' }}>User logs and reviews will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activity.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        backgroundColor: 'var(--bg-marine-surface)',
                        border: '1px solid var(--border-marine)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${act.type === 'REVIEWED' ? 'badge-yellow' : 'badge-red'}`}>
                            {act.type}
                          </span>
                          <Link
                            to={`/movie/${act.tmdbId}`}
                            style={{ fontWeight: 700, color: 'var(--text-primary)' }}
                          >
                            {act.movieTitle}
                          </Link>
                        </div>
                        {act.detail && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {act.detail}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
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
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-marine-surface)',
              border: '1px solid var(--border-marine)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ color: 'var(--yellow-butter)' }}>Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '90px' }}
                  placeholder="Tell other cinephiles about your favorite genres, directors, and cinema memories..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="btn btn-primary">
                  {updating ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
