import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const PRESETS = [500, 1000, 2000, 5000];

export default function Withdraw() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt < 10) { setError('Minimum withdrawal is KES 10'); return; }
    if (amt > profile.balance) { setError('Insufficient balance'); return; }

    setLoading(true);
    const { data, error: fnError } = await supabase.rpc('withdraw_money', {
      p_user_id: profile.id,
      p_amount: amt,
    });
    if (fnError) setError(fnError.message);
    else if (!data.success) setError(data.message);
    else { await refreshProfile(); setSuccess(true); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--red)', marginBottom: 20 }}><CheckCircle size={72} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Withdrawal Successful!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>KES {Number(amount).toLocaleString()} withdrawn</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: 'var(--green)', margin: '20px 0 40px' }}>
            KES {Number(profile.balance).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>Back to Home</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className="inner-page">
        <div className="page-header">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /></Link>
          <span className="page-title">Withdraw Cash</span>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Available</span>
          <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--green)', fontWeight: 700 }}>
            KES {Number(profile?.balance || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Amount (KES)</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix">KES</span>
                <input
                  className="amount-input"
                  type="number"
                  placeholder="0.00"
                  min="10"
                  max={profile?.balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ paddingLeft: 64 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '10px 4px', fontSize: 13 }}
                  onClick={() => setAmount(String(p))}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : `Withdraw KES ${amount || '0'}`}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
