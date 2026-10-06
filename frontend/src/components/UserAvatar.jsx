import React from 'react';

export const UserAvatar = ({ username = 'User', avatarUrl, size = 'md' }) => {
  const sizeMap = {
    sm: '28px',
    md: '40px',
    lg: '64px',
    xl: '96px',
  };

  const dimension = sizeMap[size] || sizeMap.md;
  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  const style = {
    width: dimension,
    height: dimension,
    minWidth: dimension,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-marine-surface)',
    border: '2px solid var(--border-marine-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : size === 'xl' ? '2.25rem' : '1rem',
    color: 'var(--yellow-butter)',
  };

  if (avatarUrl) {
    return (
      <div style={style}>
        <img
          src={avatarUrl}
          alt={username}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return <div style={style}>{initial}</div>;
};
