import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getWithdrawCharge, formatCharge } from '../lib/charges';
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

  const amt = parseFloat(amount) || 0;
  const charge = getWithdrawCharge(amt);
  const total = amt + charge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amt || amt < 10) { setError('Minimum withdrawal is KES 10'); return; }
    if (amt > 1000000) { setError('Maximum withdrawal is KES 1,000,000'); return; }
    if (total > profile.balance) { setError(`Insufficient balance. You need KES ${total.toLocaleString()} (amount + charge)`); return; }

    setLoading(true);

    // Withdraw amount + charge
    const { data, error: fnError } = await supabase.rpc('withdraw_money', {
      p_user_id: profile.id,
      p_amount: total, // deduct total including charge
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
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
            KES {Number(amount).toLocaleString()} withdrawn
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Transaction fee: KES {charge.toLocaleString()}
          </p>
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
                  max="1000000"
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

            {/* Charge breakdown */}
            {amt > 0 && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Withdrawal Amount</span>
                  <span>KES {amt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction Fee</span>
                  <span>{formatCharge(charge)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: 700 }}>Total Deducted</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--red)' }}>
                    KES {total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : `Withdraw KES ${amount || '0'} + KES ${charge} fee`}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
