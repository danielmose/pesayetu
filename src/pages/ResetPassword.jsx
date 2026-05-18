import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Password Reset!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Your password has been updated successfully.</p>
        <button className="btn-primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="logo-icon">PY</div>
        <div className="logo-text">Pesa<span>Yetu</span></div>
      </div>

      <div className="auth-heading">
        <h1>Reset Password 🔐</h1>
        <p>Enter your new password below</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="input-group">
          <label>New Password</label>
          <div className="input-wrapper">
            <Lock />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <div className="input-wrapper">
            <Lock />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
                      }

