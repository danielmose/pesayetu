import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic phone validation (Kenyan format)
    const phone = form.phone.replace(/\s/g, '');
    if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(phone)) {
      setError('Enter a valid Kenyan phone number (e.g. 0712345678)');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await register({ ...form, phone });
    if (error) setError(error.message);
    else setSuccess('Account created! Check your email to confirm, then sign in.');
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="logo-icon">PY</div>
        <div className="logo-text">Pesa<span>Yetu</span></div>
      </div>

      <div className="auth-heading">
        <h1>Create account 🚀</h1>
        <p>Join PesaYetu — send money instantly</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="input-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <User />
            <input
              type="text"
              name="fullName"
              placeholder="John Kamau"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <div className="input-wrapper">
            <Phone />
            <input
              type="tel"
              name="phone"
              placeholder="0712345678"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Email</label>
          <div className="input-wrapper">
            <Mail />
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
          <div className="input-wrapper">
            <Lock />
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
