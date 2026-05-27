import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Custom eye SVG — iris + pupil + shine dot, green when visible
const EyeIcon = ({ visible }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={visible ? '#4ade80' : '#6b7280'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={visible ? 'rgba(74,222,128,0.08)' : 'transparent'}
      style={{ transition: 'all 0.25s ease' }}
    />
    <circle
      cx="12" cy="12" r="3.5"
      stroke={visible ? '#22c55e' : '#6b7280'}
      strokeWidth="1.6"
      fill={visible ? 'rgba(34,197,94,0.15)' : 'transparent'}
      style={{ transition: 'all 0.25s ease' }}
    />
    <circle
      cx="12" cy="12" r="1.4"
      fill={visible ? '#4ade80' : '#6b7280'}
      style={{ transition: 'all 0.25s ease' }}
    />
    {visible && <circle cx="13.5" cy="10.8" r="0.6" fill="white" opacity="0.85" />}
    {!visible && (
      <line x1="3" y1="3" x2="21" y2="21" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" />
    )}
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await login(form);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="logo-icon">PY</div>
        <div className="logo-text">Pesa<span>Yetu</span></div>
      </div>

      <div className="auth-heading">
        <h1>Welcome back 👋</h1>
        <p>Sign in to your PesaYetu account</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="input-group">
          <label>Email</label>
          <div className="input-wrapper">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          {/* position: relative here is the key fix */}
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Lock size={18} />
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{ paddingRight: 48 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                padding: 0,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              title={showPass ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={showPass} />
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: -8 }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}
          >
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </form>
    </div>
  );
}
