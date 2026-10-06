import React from 'react';

export const LoadingState = ({ message = 'Loading cinema data...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.02em' }}>{message}</p>
    </div>
  );
};
