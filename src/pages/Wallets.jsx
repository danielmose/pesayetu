import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES, fetchExchangeRates, formatAmount, POPULAR_CURRENCIES } from '../lib/currencies';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function Wallets() {
  const { profile } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWallets();
    loadRates();
  }, []);

  const fetchWallets = async () => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('user_id', profile.id)
      .order('balance', { ascending: false });
    setWallets(data || []);
    setLoading(false);
  };

  const loadRates = async () => {
    const r = await fetchExchangeRates();
    setRates(r);
  };

  const addWallet = async () => {
    if (!selectedCurrency) return;
    // Check if wallet already exists to avoid silent insert failure
    const { data: existing } = await supabase
      .from('currency_wallets')
      .select('id')
      .eq('user_id', profile.id)
      .eq('currency', selectedCurrency)
      .maybeSingle();

    if (existing) {
      setAdding(false);
      setSelectedCurrency('');
      return;
    }

    const { error } = await supabase
      .from('currency_wallets')
      .insert({ user_id: profile.id, currency: selectedCurrency, balance: 0 });
    if (!error) {
      setAdding(false);
      setSelectedCurrency('');
      fetchWallets();
    }
  };

  const existingCurrencies = wallets.map(w => w.currency);
  const availableCurrencies = Object.keys(CURRENCIES).filter(c => !existingCurrencies.includes(c));
  const filteredCurrencies = availableCurrencies.filter(c =>
    c.toLowerCase().includes(search.toLowerCase()) ||
    CURRENCIES[c].name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: popular first
  const sortedCurrencies = [
    ...filteredCurrencies.filter(c => POPULAR_CURRENCIES.includes(c)),
    ...filteredCurrencies.filter(c => !POPULAR_CURRENCIES.includes(c)),
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>My Wallets</h2>
          <button
            onClick={() => setAdding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green)', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            <Plus size={16} /> Add Currency
          </button>
        </div>

        {/* Rates loading */}
        {!rates && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <RefreshCw size={14} className="spinner" /> Loading live rates...
          </div>
        )}

        {/* Wallets list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : wallets.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={32} />
            <p>No wallets yet. Add a currency to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {wallets.map(wallet => {
              const curr = CURRENCIES[wallet.currency];
              return (
                <div
                  key={wallet.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 32 }}>{curr?.flag || '💰'}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{wallet.currency}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{curr?.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 16, color: 'var(--green)' }}>
                      {curr?.symbol} {Number(wallet.balance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {rates && wallet.currency !== 'USD' && (
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        ≈ $ {(wallet.balance / rates[wallet.currency]).toFixed(2)} USD
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add wallet modal */}
        {adding && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200
          }}>
            <div style={{
              background: 'var(--surface)', borderRadius: '20px 20px 0 0',
              padding: '24px 20px', width: '100%', maxWidth: 480, maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Add Currency Wallet</h3>
                <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
              </div>

              <input
                type="text"
                placeholder="Search currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '12px 16px', background: 'var(--surface2)',
                  border: '1.5px solid var(--border)', borderRadius: 10,
                  color: 'var(--text)', fontSize: 14, outline: 'none',
                  fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}
              />

              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedCurrencies.map(code => {
                  const curr = CURRENCIES[code];
                  return (
                    <div
                      key={code}
                      onClick={() => setSelectedCurrency(code)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                        background: selectedCurrency === code ? 'var(--green-glow)' : 'var(--surface2)',
                        border: selectedCurrency === code ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{curr.flag}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{code}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{curr.name}</div>
                      </div>
                      {rates && (
                        <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                          1 USD = {rates[code]?.toFixed(2)} {code}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addWallet}
                disabled={!selectedCurrency}
                className="btn-primary"
              >
                {selectedCurrency ? `Add ${selectedCurrency} Wallet` : 'Select a Currency'}
              </button>
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
