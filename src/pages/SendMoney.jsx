import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function SendMoney() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      setLoading(false);
      return;
    }

    if (amount < 10) {
      setError('Minimum send amount is KES 10');
      setLoading(false);
      return;
    }

    const { data, error: fnError } = await supabase.rpc('send_money', {
      p_sender_id: profile.id,
      p_receiver_phone: form.phone,
      p_amount: amount,
      p_note: form.note || null,
    });

    if (fnError) {
      setError(fnError.message);
    } else if (!data.success) {
      setError(data.message);
    } else {
      setSuccess(data);
      await refreshProfile();
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--green)', marginBottom: 20 }}>
            <CheckCircle size={72} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Money Sent! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
            KES {Number(form.amount).toLocaleString()} sent to
          </p>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 32 }}>{success.receiver_name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>New balance</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: 'var(--green)', marginBottom: 40 }}>
            KES {Number(profile.balance).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
            Back to Home
          </button>
          <button className="btn-secondary" onClick={() => { setSuccess(null); setForm({ phone: '', amount: '', note: '' }); }} style={{ width: '100%', marginTop: 12 }}>
            Send Again
          </button>
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
          <span className="page-title">Send Money</span>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Your Balance</span>
          <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--green)', fontWeight: 700 }}>
            KES {Number(profile?.balance || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Recipient Phone Number</label>
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
              <label>Amount (KES)</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix">KES</span>
                <input
                  className="amount-input"
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  min="10"
                  step="1"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 64 }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Note (Optional)</label>
              <div className="input-wrapper">
                <FileText />
                <input
                  type="text"
                  name="note"
                  placeholder="What's this for?"
                  value={form.note}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : `Send KES ${form.amount || '0'}`}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
