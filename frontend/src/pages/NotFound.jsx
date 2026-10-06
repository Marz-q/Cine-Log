import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Film size={64} color="var(--yellow-butter)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
      <h1 style={{ fontSize: '3rem', color: 'var(--yellow-butter)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Scene Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '2rem' }}>
        The reel you are looking for has been cut from the final edit or never existed.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Discover
      </Link>
    </div>
  );
};
