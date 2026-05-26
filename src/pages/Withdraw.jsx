import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Phone, Building2, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getWithdrawCharge, formatCharge } from '../lib/charges';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import PinModal from '../components/PinModal';

const CHIMONEY_API_KEY = import.meta.env.VITE_CHIMONEY_API_KEY;
const PRESETS = [500, 1000, 2000, 5000];

const METHODS = [
  { id: 'mobilemoney', label: 'Mobile Money', icon: <Phone size={18} />, desc: 'M-Pesa, Airtel, MTN' },
  { id: 'bank', label: 'Bank Transfer', icon: <Building2 size={18} />, desc: 'Local & international banks' },
  { id: 'card', label: 'Card Payout', icon: <CreditCard size={18} />, desc: 'Visa / Mastercard' },
];

export default function Withdraw() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState('mobilemoney');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [kesUsdRate, setKesUsdRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const amt = parseFloat(amount) || 0;
  const charge = getWithdrawCharge(amt);
  const total = amt + charge;
  const amtInUSD = kesUsdRate ? (amt / kesUsdRate).toFixed(2) : null;

  useEffect(() => {
    fetchWalletBalance();
    fetchLiveRate();
  }, []);

  const fetchWalletBalance = async () => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('balance')
      .eq('user_id', profile.id)
      .eq('currency', 'KES')
      .single();
    setWalletBalance(data?.balance || 0);
  };

  const fetchLiveRate = async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      setKesUsdRate(data.rates.KES);
    } catch {
      setKesUsdRate(130); // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amt || amt < 10) { setError('Minimum withdrawal is KES 10'); return; }
    if (amt > 1000000) { setError('Maximum withdrawal is KES 1,000,000'); return; }
    if (total > walletBalance) {
      setError(`Insufficient balance. You need KES ${total.toLocaleString()} (amount + fee)`);
      return;
    }
    if (method === 'mobilemoney' && !phone) { setError('Enter your mobile money phone number'); return; }
    if (method === 'bank' && (!bankCode || !accountNumber)) { setError('Enter bank code and account number'); return; }
    if (method === 'card' && !cardNumber) { setError('Enter your card number'); return; }

    setShowPin(true);
  };

  const handlePinConfirm = async (pin) => {
    setPinError('');

    const { data: profileData } = await supabase
      .from('profiles')
      .select('transaction_pin')
      .eq('id', profile.id)
      .single();

    if (!profileData?.transaction_pin) {
      setPinError('No PIN set. Please set a PIN in Settings.');
      return;
    }

    if (profileData.transaction_pin !== pin) {
      setPinError('Incorrect PIN. Try again.');
      return;
    }

    setShowPin(false);
    setLoading(true);

    try {
      const usdValue = kesUsdRate ? (amt / kesUsdRate).toFixed(2) : (amt / 130).toFixed(2);

      let chimoneyPayload = { valueInUSD: usdValue };

      if (method === 'mobilemoney') {
        chimoneyPayload.phoneNumber = phone.startsWith('+') ? phone : `+254${phone.replace(/^0/, '')}`;
        chimoneyPayload.countryToSend = 'KE';
      } else if (method === 'bank') {
        chimoneyPayload.bankCode = bankCode;
        chimoneyPayload.accountNumber = accountNumber;
        chimoneyPayload.countryToSend = 'KE';
      } else if (method === 'card') {
        chimoneyPayload.cardNumber = cardNumber;
      }

      const endpoint = method === 'mobilemoney'
        ? 'https://api.chimoney.io/v0.2/payouts/mobile-money'
        : method === 'bank'
        ? 'https://api.chimoney.io/v0.2/payouts/bank'
        : 'https://api.chimoney.io/v0.2/payouts/card';

      const chiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': CHIMONEY_API_KEY,
        },
        body: JSON.stringify({ payouts: [chimoneyPayload] }),
      });

      const chiData = await chiRes.json();

      if (!chiRes.ok || chiData.status === 'error') {
        setError(chiData.error || 'Chimoney payout failed. Please try again.');
        setLoading(false);
        return;
      }

      // Deduct from currency_wallets
      await supabase
        .from('currency_wallets')
        .update({ balance: walletBalance - total })
        .eq('user_id', profile.id)
        .eq('currency', 'KES');

      // Deduct from profiles.balance
      await supabase.rpc('withdraw_money', {
        p_user_id: profile.id,
        p_amount: total,
      });

      // Record transaction
      await supabase.from('currency_transactions').insert({
        sender_id: profile.id,
        receiver_id: profile.id,
        send_amount: total,
        send_currency: 'KES',
        receive_amount: amt,
        receive_currency: 'KES',
        exchange_rate: 1,
        type: 'withdraw',
        note: `${method} withdrawal via Chimoney`,
      });

      await refreshProfile();
      await fetchWalletBalance();
      setSuccess(true);

    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--green)', marginBottom: 20 }}><CheckCircle size={72} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Withdrawal Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
            KES {Number(amount).toLocaleString()} via {METHODS.find(m => m.id === method)?.label}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Transaction fee: KES {charge.toLocaleString()}
          </p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: 'var(--green)', margin: '20px 0 40px' }}>
            KES {Number(walletBalance - total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
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

        {/* Balance */}
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Available</span>
          <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--green)', fontWeight: 700 }}>
            KES {Number(walletBalance).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Live rate indicator */}
        {kesUsdRate && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'right' }}>
            Live rate: 1 USD = KES {kesUsdRate.toFixed(2)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Method selector */}
            <div className="input-group">
              <label>Withdrawal Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      background: method === m.id ? 'rgba(0,200,100,0.08)' : 'var(--surface2)',
                      border: method === m.id ? '2px solid var(--green)' : '1.5px solid var(--border)',
                      color: 'var(--text)', textAlign: 'left',
                    }}
                  >
                    <span style={{ color: method === m.id ? 'var(--green)' : 'var(--text-muted)' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Method-specific fields */}
            {method === 'mobilemoney' && (
              <div className="input-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={16} />
                  <input type="tel" placeholder="0712345678" value={phone}
                    onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>
            )}

            {method === 'bank' && (
              <>
                <div className="input-group">
                  <label>Bank Code</label>
                  <div className="input-wrapper">
                    <Building2 size={16} />
                    <input type="text" placeholder="e.g. 01 for KCB" value={bankCode}
                      onChange={e => setBankCode(e.target.value)} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Account Number</label>
                  <div className="input-wrapper">
                    <Building2 size={16} />
                    <input type="text" placeholder="Your bank account number" value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            {method === 'card' && (
              <div className="input-group">
                <label>Card Number</label>
                <div className="input-wrapper">
                  <CreditCard size={16} />
                  <input type="text" placeholder="16-digit card number" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)} maxLength={16} required />
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="input-group">
              <label>Amount (KES)</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix">KES</span>
                <input className="amount-input" type="number" placeholder="0.00"
                  min="10" max="1000000" value={amount}
                  onChange={e => setAmount(e.target.value)} required style={{ paddingLeft: 64 }} />
              </div>
              {amtInUSD && amt > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  ≈ USD {amtInUSD} at live rate
                </div>
              )}
            </div>

            {/* Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PRESETS.map(p => (
                <button key={p} type="button" className="btn-secondary"
                  style={{ padding: '10px 4px', fontSize: 13 }} onClick={() => setAmount(String(p))}>
                  {p.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Breakdown */}
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

      {showPin && (
        <PinModal
          title="Confirm Withdrawal"
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => { setShowPin(false); setPinError(''); }}
        />
      )}

      <BottomNav />
    </div>
  );
                     }
