import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Compass, List, Bookmark, Users, LogOut, Menu, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { SearchBar } from './SearchBar';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: isActive ? 'var(--yellow-butter)' : 'var(--text-secondary)',
    borderBottom: isActive ? '2px solid var(--accent-red)' : '2px solid transparent',
    padding: '0.5rem 0.25rem',
    transition: 'color 0.15s ease, border-color 0.15s ease',
  });

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-marine-surface)',
        borderBottom: '1px solid var(--border-marine)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--accent-red)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Film size={20} color="#ffffff" />
          </div>
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: 'var(--yellow-butter)',
              fontFamily: 'inherit',
            }}
          >
            CINE<span style={{ color: 'var(--accent-red)' }}>LOG</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          className="desktop-nav"
        >
          <NavLink to="/" style={navLinkStyle}>
            <Compass size={16} /> Discover
          </NavLink>
          <NavLink to="/lists" style={navLinkStyle}>
            <List size={16} /> Lists
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/watchlist" style={navLinkStyle}>
                <Bookmark size={16} /> Watchlist
              </NavLink>
              <NavLink to="/feed" style={navLinkStyle}>
                <Users size={16} /> Activity
              </NavLink>
            </>
          )}
        </nav>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '340px', display: 'none' }} className="desktop-search">
          <SearchBar />
        </div>

        {/* User / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/lists/new"
                className="btn btn-outline-red btn-sm"
                style={{ display: 'none' }}
                id="create-list-btn"
              >
                <PlusCircle size={14} /> New List
              </Link>
              <Link
                to={`/profile/${user.username}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-marine-card)',
                  border: '1px solid var(--border-marine)',
                }}
              >
                <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                style={{
                  color: 'var(--text-muted)',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            style={{
              color: 'var(--text-primary)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-marine-surface)',
            borderTop: '1px solid var(--border-marine)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <SearchBar onSearch={() => setMobileMenuOpen(false)} />
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
              <Compass size={16} /> Discover
            </NavLink>
            <NavLink to="/lists" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
              <List size={16} /> Lists
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/watchlist" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                  <Bookmark size={16} /> Watchlist
                </NavLink>
                <NavLink to="/feed" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                  <Users size={16} /> Activity
                </NavLink>
                <NavLink to={`/profile/${user.username}`} onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                  Profile (@{user.username})
                </NavLink>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--accent-red)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    padding: '0.5rem 0.25rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Embedded Responsive Media Queries for Navbar */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-search { display: block !important; }
          .mobile-menu-toggle { display: none !important; }
          #create-list-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};
