import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES, fetchExchangeRates, convertCurrency } from '../lib/currencies';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function Convert() {
  const { profile } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [rates, setRates] = useState(null);
  const [fromCurrency, setFromCurrency] = useState('KES');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWallets();
    loadRates();
  }, []);

  const fetchWallets = async () => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('user_id', profile.id);
    setWallets(data || []);
  };

  const loadRates = async () => {
    const r = await fetchExchangeRates();
    setRates(r);
  };

  const fromWallet = wallets.find(w => w.currency === fromCurrency);
  const fromBalance = fromWallet ? fromWallet.balance : 0;
  const amt = parseFloat(amount) || 0;
  const convertedAmount = rates ? convertCurrency(amt, fromCurrency, toCurrency, rates) : 0;
  const rate = rates ? convertCurrency(1, fromCurrency, toCurrency, rates) : 0;

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');

    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    if (fromBalance < amt) { setError('Insufficient balance'); return; }
    if (fromCurrency === toCurrency) { setError('Select different currencies'); return; }

    setLoading(true);

    // Deduct from source wallet
    if (fromWallet) {
      await supabase
        .from('currency_wallets')
        .update({ balance: fromWallet.balance - amt })
        .eq('user_id', profile.id)
        .eq('currency', fromCurrency);
    } else {
      await supabase
        .from('currency_wallets')
        .insert({ user_id: profile.id, currency: fromCurrency, balance: -amt });
    }

    // Add to target wallet
    const toWallet = wallets.find(w => w.currency === toCurrency);
    if (toWallet) {
      await supabase
        .from('currency_wallets')
        .update({ balance: toWallet.balance + convertedAmount })
        .eq('user_id', profile.id)
        .eq('currency', toCurrency);
    } else {
      await supabase
        .from('currency_wallets')
        .insert({ user_id: profile.id, currency: toCurrency, balance: convertedAmount });
    }

    // Record transaction
    await supabase.from('currency_transactions').insert({
      sender_id: profile.id,
      receiver_id: profile.id,
      send_amount: amt,
      send_currency: fromCurrency,
      receive_amount: convertedAmount,
      receive_currency: toCurrency,
      exchange_rate: rate,
      type: 'convert',
    });

    await fetchWallets();
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--green)', marginBottom: 20 }}><CheckCircle size={72} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Converted! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>You converted</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {CURRENCIES[fromCurrency]?.symbol} {Number(amount).toLocaleString()} {fromCurrency}
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>to</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--green)', marginBottom: 40 }}>
            {CURRENCIES[toCurrency]?.symbol} {convertedAmount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
          </p>
          <button className="btn-primary" onClick={() => { setSuccess(false); setAmount(''); }} style={{ width: '100%' }}>
            Convert Again
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
          <span className="page-title">Convert Currency</span>
        </div>

        {!rates && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
            Loading live exchange rates...
          </div>
        )}

        <form onSubmit={handleConvert}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            {/* From currency */}
            <div className="input-group">
              <label>From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none' }}
              >
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCIES[code]?.flag} {code} — {CURRENCIES[code]?.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Balance: {CURRENCIES[fromCurrency]?.symbol} {Number(fromBalance).toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Amount */}
            <div className="input-group">
              <label>Amount</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix" style={{ fontSize: 14 }}>{CURRENCIES[fromCurrency]?.symbol}</span>
                <input
                  className="amount-input"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ paddingLeft: 64 }}
                />
              </div>
            </div>

            {/* Swap button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={swap}
                style={{
                  background: 'var(--surface2)', border: '1.5px solid var(--border)',
                  borderRadius: '50%', width: 44, height: 44, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--green)', transition: 'all 0.2s'
                }}
              >
                <ArrowLeftRight size={18} />
              </button>
            </div>

            {/* To currency */}
            <div className="input-group">
              <label>To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none' }}
              >
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCIES[code]?.flag} {code} — {CURRENCIES[code]?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rate preview */}
            {rates && amt > 0 && (
              <div style={{ background: 'var(--green-glow)', border: '1px solid var(--green)', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Exchange Rate</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12 }}>
                    1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>You Receive</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>
                    {CURRENCIES[toCurrency]?.symbol} {convertedAmount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading || !rates}>
              {loading ? 'Converting...' : `Convert to ${toCurrency}`}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
                 }
        
