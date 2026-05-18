import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

function PinInput({ value, onChange, onKeyDown, refs }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          style={{
            width: 56, height: 56, textAlign: 'center',
            fontSize: 24, fontWeight: 700,
            background: 'var(--surface2)',
            border: digit ? '2px solid var(--green)' : '2px solid var(--border)',
            borderRadius: 12, color: 'var(--text)',
            outline: 'none', fontFamily: 'Space Mono, monospace'
          }}
        />
      ))}
    </div>
  );
}

export default function Settings() {
  const { profile, logout } = useAuth();
  const [section, setSection] = useState(null); // null, 'setPin', 'changePin', 'forgotPin'
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set PIN state
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const newPinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  // Change PIN state
  const [oldPin, setOldPin] = useState(['', '', '', '']);
  const [changedPin, setChangedPin] = useState(['', '', '', '']);
  const [confirmChangedPin, setConfirmChangedPin] = useState(['', '', '', '']);
  const oldPinRefs = useRef([]);
  const changedPinRefs = useRef([]);
  const confirmChangedRefs = useRef([]);

  const handlePinInput = (arr, setArr, refs) => (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...arr];
    updated[index] = value.slice(-1);
    setArr(updated);
    if (value && index < 3) refs.current[index + 1]?.focus();
  };

  const handlePinKey = (arr, refs) => (index, e) => {
    if (e.key === 'Backspace' && !arr[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    setError('');
    const pinStr = newPin.join('');
    const confirmStr = confirmPin.join('');
    if (pinStr.length !== 4) { setError('Enter a complete 4-digit PIN'); return; }
    if (pinStr !== confirmStr) { setError('PINs do not match'); return; }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ transaction_pin: btoa(pinStr) })
      .eq('id', profile.id);
    if (error) setError(error.message);
    else { setSuccess('PIN set successfully!'); setSection(null); setNewPin(['','','','']); setConfirmPin(['','','','']); }
    setLoading(false);
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setError('');
    const oldStr = oldPin.join('');
    const newStr = changedPin.join('');
    const confirmStr = confirmChangedPin.join('');

    if (btoa(oldStr) !== profile.transaction_pin) { setError('Current PIN is incorrect'); return; }
    if (newStr.length !== 4) { setError('Enter a complete new PIN'); return; }
    if (newStr !== confirmStr) { setError('New PINs do not match'); return; }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ transaction_pin: btoa(newStr), pin_attempts: 0, pin_locked_until: null })
      .eq('id', profile.id);
    if (error) setError(error.message);
    else { setSuccess('PIN changed successfully!'); setSection(null); }
    setLoading(false);
  };

  const handleForgotPin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email || '', {
      redirectTo: 'https://pesayetu-ohy3.vercel.app/reset-pin',
    });
    if (error) setError(error.message);
    else setSuccess('PIN reset link sent to your email!');
    setLoading(false);
    setSection(null);
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="inner-page">
        <div className="page-header">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /></Link>
          <span className="page-title">Settings</span>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        {/* Profile info */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
            {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{profile?.full_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{profile?.phone}</div>
          </div>
        </div>

        {/* PIN Manager */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={18} color="var(--green)" />
            <span style={{ fontWeight: 700 }}>PIN Manager</span>
          </div>

          {!profile?.transaction_pin ? (
            <button
              onClick={() => { setSection('setPin'); setError(''); }}
              style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Set Transaction PIN</span>
              <span style={{ color: 'var(--green)' }}>→</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => { setSection('changePin'); setError(''); }}
                style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Change PIN</span>
                <span style={{ color: 'var(--green)' }}>→</span>
              </button>
              <button
                onClick={() => { setSection('forgotPin'); setError(''); }}
                style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', color: 'var(--red)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Forgot PIN</span>
                <span>→</span>
              </button>
            </>
          )}
        </div>

        {/* Set PIN form */}
        {section === 'setPin' && (
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Set Transaction PIN</h3>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSetPin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>New PIN</label>
                <PinInput value={newPin} onChange={handlePinInput(newPin, setNewPin, newPinRefs)} onKeyDown={handlePinKey(newPin, newPinRefs)} refs={newPinRefs} />
              </div>
              <div className="input-group">
                <label>Confirm PIN</label>
                <PinInput value={confirmPin} onChange={handlePinInput(confirmPin, setConfirmPin, confirmPinRefs)} onKeyDown={handlePinKey(confirmPin, confirmPinRefs)} refs={confirmPinRefs} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Set PIN'}</button>
              <button type="button" className="btn-secondary" onClick={() => setSection(null)}>Cancel</button>
            </form>
          </div>
        )}

        {/* Change PIN form */}
        {section === 'changePin' && (
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Change PIN</h3>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Current PIN</label>
                <PinInput value={oldPin} onChange={handlePinInput(oldPin, setOldPin, oldPinRefs)} onKeyDown={handlePinKey(oldPin, oldPinRefs)} refs={oldPinRefs} />
              </div>
              <div className="input-group">
                <label>New PIN</label>
                <PinInput value={changedPin} onChange={handlePinInput(changedPin, setChangedPin, changedPinRefs)} onKeyDown={handlePinKey(changedPin, changedPinRefs)} refs={changedPinRefs} />
              </div>
              <div className="input-group">
                <label>Confirm New PIN</label>
                <PinInput value={confirmChangedPin} onChange={handlePinInput(confirmChangedPin, setConfirmChangedPin, confirmChangedRefs)} onKeyDown={handlePinKey(confirmChangedPin, confirmChangedRefs)} refs={confirmChangedRefs} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Change PIN'}</button>
              <button type="button" className="btn-secondary" onClick={() => setSection(null)}>Cancel</button>
            </form>
          </div>
        )}

        {/* Forgot PIN */}
        {section === 'forgotPin' && (
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' }}>
            <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>Forgot PIN?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              We'll send a PIN reset link to your registered email address.
            </p>
            <button className="btn-primary" onClick={handleForgotPin} disabled={loading} style={{ width: '100%', marginBottom: 12 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button className="btn-secondary" onClick={() => setSection(null)} style={{ width: '100%' }}>Cancel</button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          style={{ width: '100%', padding: '16px', background: 'var(--red-light)', border: '1.5px solid var(--red)', borderRadius: 12, color: 'var(--red)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>
      <BottomNav />
    </div>
  );
          }
      
