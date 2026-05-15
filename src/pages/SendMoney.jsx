import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES, fetchExchangeRates, convertCurrency } from '../lib/currencies';
import { getSendCharge, formatCharge } from '../lib/charges';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function SendMoney() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [rates, setRates] = useState(null);
  const [form, setForm] = useState({ phone: '', amount: '', note: '', fromCurrency: 'KES', receiveCurrency: 'KES' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);

  useEffect(() => {
    fetchWallets();
    fetchExchangeRates().then(setRates);
  }, []);

  const fetchWallets = async () => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('user_id', profile.id);
    setWallets(data || []);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const amount = parseFloat(form.amount) || 0;
  const charge = getSendCharge(amount);
  const total = amount + charge;
  const receiverGets = rates && form.fromCurrency !== form.receiveCurrency
    ? convertCurrency(amount, form.fromCurrency, form.receiveCurrency, rates)
    : amount;
  const rate = rates && form.fromCurrency !== form.receiveCurrency
    ? convertCurrency(1, form.fromCurrency, form.receiveCurrency, rates)
    : 1;

  const fromWallet = wallets.find(w => w.currency === form.fromCurrency);
  const fromBalance = fromWallet ? fromWallet.balance : 0;

  const lookupReceiver = async (phone) => {
    if (phone.length >= 10) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('phone', phone)
        .single();
      setReceiverInfo(data || null);
    } else {
      setReceiverInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }
    if (amount < 10) { setError('Minimum send amount is KES 10'); return; }
    if (fromBalance < total) {
      setError(`Insufficient ${form.fromCurrency} balance. Need ${total.toLocaleString()}`);
      return;
    }

    setLoading(true);

    const { data: receiver } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('phone', form.phone)
      .single();

    if (!receiver) { setError('Recipient not found on PesaYetu'); setLoading(false); return; }

    // Deduct from sender wallet
    if (fromWallet) {
      await supabase
        .from('currency_wallets')
        .update({ balance: fromWallet.balance - total })
        .eq('user_id', profile.id)
        .eq('currency', form.fromCurrency);
    } else {
      await supabase
        .from('currency_wallets')
        .insert({ user_id: profile.id, currency: form.fromCurrency, balance: -total });
    }

    // Add to receiver wallet
    const { data: receiverWallet } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('user_id', receiver.id)
      .eq('currency', form.receiveCurrency)
      .single();

    if (receiverWallet) {
      await supabase
        .from('currency_wallets')
        .update({ balance: receiverWallet.balance + receiverGets })
        .eq('user_id', receiver.id)
        .eq('currency', form.receiveCurrency);
    } else {
      await supabase
        .from('currency_wallets')
        .insert({ user_id: receiver.id, currency: form.receiveCurrency, balance: receiverGets });
    }

    // Record transaction
    await supabase.from('currency_transactions').insert({
      sender_id: profile.id,
      receiver_id: receiver.id,
      send_amount: amount,
      send_currency: form.fromCurrency,
      receive_amount: receiverGets,
      receive_currency: form.receiveCurrency,
      exchange_rate: rate,
      type: 'send',
      note: form.note || null,
    });

    await fetchWallets();
    setSuccess({ receiverName: receiver.full_name, receiverGets, receiveCurrency: form.receiveCurrency });
    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--green)', marginBottom: 20 }}><CheckCircle size={72} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Money Sent! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
            {CURRENCIES[form.fromCurrency]?.symbol} {Number(form.amount).toLocaleString()} sent to
          </p>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{success.receiverName}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>They receive</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
            {CURRENCIES[success.receiveCurrency]?.symbol} {Number(success.receiverGets).toLocaleString('en', { minimumFractionDigits: 2 })} {success.receiveCurrency}
          </p>
          {charge > 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
              Fee: {formatCharge(charge)} {form.fromCurrency}
            </p>
          )}
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>Back to Home</button>
          <button className="btn-secondary" onClick={() => { setSuccess(null); setForm({ phone: '', amount: '', note: '', fromCurrency: 'KES', receiveCurrency: 'KES' }); }} style={{ width: '100%', marginTop: 12 }}>Send Again</button>
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

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Send From */}
            <div className="input-group">
              <label>Send From</label>
              <select
                name="fromCurrency"
                value={form.fromCurrency}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none' }}
              >
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCIES[code]?.flag} {code} — {CURRENCIES[code]?.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Balance: {CURRENCIES[form.fromCurrency]?.symbol} {Number(fromBalance).toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Recipient */}
            <div className="input-group">
              <label>Recipient Phone</label>
              <div className="input-wrapper">
                <Phone />
                <input
                  type="tel"
                  name="phone"
                  placeholder="0712345678"
                  value={form.phone}
                  onChange={(e) => { handleChange(e); lookupReceiver(e.target.value); }}
                  required
                />
              </div>
              {receiverInfo && (
                <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>
                  ✅ {receiverInfo.full_name}
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="input-group">
              <label>Amount ({form.fromCurrency})</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix" style={{ fontSize: 14 }}>{CURRENCIES[form.fromCurrency]?.symbol}</span>
                <input
                  className="amount-input"
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 64 }}
                />
              </div>
            </div>

            {/* Receiver Gets In */}
            <div className="input-group">
              <label>Receiver Gets In</label>
              <select
                name="receiveCurrency"
                value={form.receiveCurrency}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none' }}
              >
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>
                    {CURRENCIES[code]?.flag} {code} — {CURRENCIES[code]?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Breakdown */}
            {amount > 0 && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                  <span>{CURRENCIES[form.fromCurrency]?.symbol} {amount.toLocaleString()} {form.fromCurrency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fee</span>
                  <span style={{ color: charge === 0 ? 'var(--green)' : 'var(--text)' }}>{formatCharge(charge)}</span>
                </div>
                {form.fromCurrency !== form.receiveCurrency && rates && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Rate</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>1 {form.fromCurrency} = {rate.toFixed(4)} {form.receiveCurrency}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
                  <span style={{ fontWeight: 700 }}>Receiver Gets</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--green)' }}>
                    {CURRENCIES[form.receiveCurrency]?.symbol} {receiverGets.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {form.receiveCurrency}
                  </span>
                </div>
              </div>
            )}

            {/* Note */}
            <div className="input-group">
              <label>Note (Optional)</label>
              <div className="input-wrapper">
                <FileText />
                <input type="text" name="note" placeholder="What's this for?" value={form.note} onChange={handleChange} maxLength={100} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : `Send ${form.amount || '0'} ${form.fromCurrency} ${charge === 0 ? '(Free)' : `+ ${formatCharge(charge)} fee`}`}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
            }
