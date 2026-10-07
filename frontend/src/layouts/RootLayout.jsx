import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { CineBotModal } from '../components/CineBotModal';
import { Film } from 'lucide-react';

export const RootLayout = () => {
  return (
    <div className="app-container">
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <CineBotModal />

      <footer
        style={{
          backgroundColor: 'var(--bg-marine-darkest)',
          borderTop: '1px solid var(--border-marine)',
          padding: '2.5rem 1.5rem',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                backgroundColor: 'var(--accent-red)',
                padding: '5px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Film size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--yellow-butter)', fontSize: '1.05rem' }}>
              CINE<span style={{ color: 'var(--accent-red)' }}>LOG</span>
            </span>
            <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>
              A social film journal for true cinephiles.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>
              Discover
            </Link>
            <Link to="/lists" style={{ color: 'var(--text-secondary)' }}>
              Lists
            </Link>
            <Link to="/search" style={{ color: 'var(--text-secondary)' }}>
              Search
            </Link>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
            <p>Movie data & media powered by TMDB API.</p>
            <p>Crafted for Software Engineering Portfolio.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
