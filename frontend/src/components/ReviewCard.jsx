import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Edit3, Trash2, Send } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { Rating } from './Rating';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';

export const ReviewCard = ({ review, onReviewUpdated, onReviewDeleted }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(review.isLiked || false);
  const [likesCount, setLikesCount] = useState(review.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(review.reviewText || '');
  const [editRating, setEditRating] = useState(review.rating || 0);

  const isOwner = user && (user.id === review.userId || user.username === review.username);

  const handleToggleLike = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reviewService.toggleLike(review.id);
      setLiked(res.liked);
      setLikesCount((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Failed to toggle review like:', err);
    }
  };

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await reviewService.getComments(review.id);
        setComments(data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    setSubmittingComment(true);
    try {
      const newComment = await reviewService.addComment(review.id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const updated = await reviewService.updateReview(review.id, {
        reviewText: editText.trim(),
        rating: editRating,
      });
      setIsEditing(false);
      if (onReviewUpdated) onReviewUpdated(updated);
    } catch (err) {
      console.error('Failed to update review:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(review.id);
      if (onReviewDeleted) onReviewDeleted(review.id);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-marine-surface)',
        border: '1px solid var(--border-marine)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1rem',
      }}
    >
      {/* Review Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to={`/profile/${review.username}`}>
            <UserAvatar username={review.username} avatarUrl={review.userAvatar} size="md" />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to={`/profile/${review.username}`}
                style={{ fontWeight: 700, color: 'var(--text-primary)' }}
              >
                {review.displayName || review.username}
              </Link>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                @{review.username}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {review.sentimentLabel && (
            <span
              className={`badge ${
                review.sentimentLabel === 'positive'
                  ? 'badge-yellow'
                  : review.sentimentLabel === 'negative'
                  ? 'badge-red'
                  : 'badge-marine'
              }`}
              style={{ fontSize: '0.7rem' }}
            >
              AI: {review.sentimentLabel}
            </span>
          )}

          {isOwner && !isEditing && (
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{ color: 'var(--text-muted)', padding: '4px' }}
                title="Edit review"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={handleDelete}
                style={{ color: 'var(--accent-red)', padding: '4px' }}
                title="Delete review"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      {isEditing ? (
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Update Rating:
          </p>
          <Rating value={editRating} interactive={true} onChange={setEditRating} size={20} />
        </div>
      ) : (
        review.rating > 0 && (
          <div style={{ marginBottom: '0.65rem' }}>
            <Rating value={review.rating} size={16} />
          </div>
        )
      )}

      {/* Review Body */}
      {isEditing ? (
        <div style={{ marginBottom: '0.75rem' }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="form-textarea"
            style={{ minHeight: '80px', marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSaveEdit}
              className="btn btn-primary btn-sm"
              disabled={!editText.trim()}
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '1rem',
            whiteSpace: 'pre-line',
          }}
        >
          {review.reviewText}
        </p>
      )}

      {/* Review Footer Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-marine)',
        }}
      >
        <button
          onClick={handleToggleLike}
          disabled={!isAuthenticated}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: liked ? 'var(--accent-red)' : 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: isAuthenticated ? 'pointer' : 'default',
          }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: showComments ? 'var(--yellow-butter)' : 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <MessageSquare size={16} />
          <span>{comments.length || review.commentsCount || 0}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px dashed var(--border-marine)',
          }}
        >
          {loadingComments ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                    backgroundColor: 'var(--bg-marine-card)',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <UserAvatar username={c.username} avatarUrl={c.userAvatar} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Link
                        to={`/profile/${c.username}`}
                        style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}
                      >
                        {c.displayName || c.username}
                      </Link>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {c.commentText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Leave a polite comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="form-input"
                style={{ height: '36px', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
              </button>
            </form>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Link to="/login" style={{ color: 'var(--yellow-butter)', textDecoration: 'underline' }}>
                Log in
              </Link>{' '}
              to join the discussion.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
