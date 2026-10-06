import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ usernameOrEmail, password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-marine-surface)',
          border: '1px solid var(--border-marine)',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--accent-red)',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.75rem',
            }}
          >
            <Film size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--yellow-butter)', marginBottom: '0.25rem' }}>
            Welcome to Cine-Log
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Log in to track your films, write reviews, and share lists
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="form-input"
              placeholder="e.g. filmbuff"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: '42px' }}
          >
            {loading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '1.5rem',
          }}
        >
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--yellow-butter)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
