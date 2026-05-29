import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://pesayetu-ohy3.vercel.app/reset-password',
    });

    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-logo">
          <div className="logo-icon">PY</div>
          <div className="logo-text">Pesa<span>Yetu</span></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📧</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Check Your Email!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            We sent a password reset link to
          </p>
          <p style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 32 }}>{email}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
            Click the link in the email to reset your password. Check your spam folder if you don't see it.
          </p>
          <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="logo-icon">PY</div>
        <div className="logo-text">Pesa<span>Yetu</span></div>
      </div>

      <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 32, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="auth-heading">
        <h1>Forgot Password? 🔑</h1>
        <p>Enter your email and we'll send you a reset link</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="input-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
