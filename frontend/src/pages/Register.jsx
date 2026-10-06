import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim() || username.trim(),
      });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
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
          maxWidth: '440px',
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
            Create Your Cine-Log
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Join a social platform designed for cinema lovers
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="e.g. kubrick_fan"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input"
              placeholder="e.g. Stanley K."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@example.com"
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
              placeholder="At least 6 characters"
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
                <UserPlus size={16} /> Register
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--yellow-butter)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
