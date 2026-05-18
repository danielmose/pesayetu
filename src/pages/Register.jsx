import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: details, 2: set PIN
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const pinInputs = useRef([]);
  const confirmInputs = useRef([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePinChange = (index, value, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;
    const arr = isConfirm ? [...confirmPin] : [...pin];
    arr[index] = value.slice(-1);
    isConfirm ? setConfirmPin(arr) : setPin(arr);
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputs : pinInputs;
      refs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index, e, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const arr = isConfirm ? [...confirmPin] : [...pin];
      if (!arr[index] && index > 0) {
        const refs = isConfirm ? confirmInputs : pinInputs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    const phone = form.phone.replace(/\s/g, '');
    if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(phone)) {
      setError('Enter a valid Kenyan phone number (e.g. 0712345678)');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');

    const pinStr = pin.join('');
    const confirmStr = confirmPin.join('');

    if (pinStr.length !== 4) { setError('Enter a complete 4-digit PIN'); return; }
    if (pinStr !== confirmStr) { setError('PINs do not match'); return; }

    setLoading(true);

    const { error: regError, data } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone }
      }
    });

    if (regError) { setError(regError.message); setLoading(false); return; }

    // Save PIN to profile (hashed using btoa for basic encoding - use bcrypt in production)
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ transaction_pin: btoa(pinStr) })
        .eq('id', data.user.id);

      // Create default KES wallet
      await supabase
        .from('currency_wallets')
        .insert({ user_id: data.user.id, currency: 'KES', balance: 0 });
    }

    setSuccess('Account created! Check your email to confirm, then sign in.');
    setLoading(false);
  };

  const pinBoxStyle = (digit) => ({
    width: 56, height: 56, textAlign: 'center',
    fontSize: 24, fontWeight: 700,
    background: 'var(--surface2)',
    border: digit ? '2px solid var(--green)' : '2px solid var(--border)',
    borderRadius: 12, color: 'var(--text)',
    outline: 'none', fontFamily: 'Space Mono, monospace'
  });

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="logo-icon">PY</div>
        <div className="logo-text">Pesa<span>Yetu</span></div>
      </div>

      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--green)' }}></div>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: step === 2 ? 'var(--green)' : 'var(--border)' }}></div>
      </div>

      {step === 1 && (
        <>
          <div className="auth-heading">
            <h1>Create account 🚀</h1>
            <p>Step 1 of 2 — Your details</p>
          </div>

          <form className="auth-form" onSubmit={handleStep1}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User />
                <input type="text" name="fullName" placeholder="John Kamau" value={form.fullName} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Phone />
                <input type="tel" name="phone" placeholder="0712345678" value={form.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail />
                <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock />
                <input type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn-primary">Next →</button>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <div className="auth-heading">
            <h1>Set Your PIN 🔐</h1>
            <p>Step 2 of 2 — Create a 4-digit transaction PIN</p>
          </div>

          <form className="auth-form" onSubmit={handleStep2}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="input-group">
              <label>Create PIN</label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => pinInputs.current[i] = el}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    style={pinBoxStyle(digit)}
                  />
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Confirm PIN</label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {confirmPin.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => confirmInputs.current[i] = el}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value, true)}
                    onKeyDown={(e) => handlePinKeyDown(i, e, true)}
                    style={pinBoxStyle(digit)}
                  />
                ))}
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              🔒 Your PIN is used to authorize all transactions
            </p>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
          </form>
        </>
      )}
    </div>
  );
            }
          
