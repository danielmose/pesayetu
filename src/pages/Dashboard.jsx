import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Download, Upload, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES } from '../lib/currencies';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import TransactionCard from '../components/TransactionCard';

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    fetchTransactions(profile.id);
    fetchWallets(profile.id);
  }, [profile?.id]);

  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        sender:sender_id(id, full_name, phone),
        receiver:receiver_id(id, full_name, phone)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error) setTransactions(data || []);
    setTxLoading(false);
  };

  const fetchWallets = async (userId) => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('user_id', userId);
    setWallets(data || []);
  };

  // ✅ Use profiles.balance as single source of truth (matches admin view)
  const displayBalance = profile?.balance || 0;
  const frozenBalance = profile?.frozen_balance || 0;
  const spendableBalance = Math.max(0, displayBalance - frozenBalance);

  const formatBalance = (bal) =>
    Number(bal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-label">Available Balance</div>
          <div className="balance-amount">
            <span className="balance-currency">{profile?.currency || 'KES'} </span>
            {formatBalance(spendableBalance)}
          </div>
          <div className="balance-phone">{profile?.phone}</div>

          {/* Frozen funds notice */}
          {frozenBalance > 0 && (
            <div style={{
              marginTop: 10,
              background: 'rgba(68,138,255,0.15)',
              border: '1px solid rgba(68,138,255,0.3)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              color: '#448aff',
              fontFamily: 'Space Mono, monospace',
            }}>
              🔒 {profile?.currency || 'KES'} {formatBalance(frozenBalance)} frozen
              {profile?.freeze_reason && (
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                  Reason: {profile.freeze_reason}
                </div>
              )}
            </div>
          )}

          {/* Other wallets */}
          {wallets.filter(w => w.currency !== (profile?.currency || 'KES') && w.balance > 0).length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {wallets
                .filter(w => w.currency !== (profile?.currency || 'KES') && w.balance > 0)
                .map(w => (
                  <div key={w.currency} style={{
                    background: 'rgba(255,255,255,0.15)', borderRadius: 8,
                    padding: '4px 10px', fontSize: 12, fontFamily: 'Space Mono, monospace',
                  }}>
                    {CURRENCIES[w.currency]?.flag} {w.currency} {Number(w.balance).toFixed(2)}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="section-header">
            <span className="section-title">Quick Actions</span>
          </div>
          <div className="quick-actions">
            <Link to="/send" className="quick-action" style={{ textDecoration: 'none' }}>
              <div className="quick-action-icon"><Send size={22} /></div>
              <span>Send</span>
            </Link>
            <Link to="/deposit" className="quick-action" style={{ textDecoration: 'none' }}>
              <div className="quick-action-icon"><Download size={22} /></div>
              <span>Deposit</span>
            </Link>
            <Link to="/withdraw" className="quick-action" style={{ textDecoration: 'none' }}>
              <div className="quick-action-icon"><Upload size={22} /></div>
              <span>Withdraw</span>
            </Link>
            <Link to="/history" className="quick-action" style={{ textDecoration: 'none' }}>
              <div className="quick-action-icon"><Clock size={22} /></div>
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="section-header">
            <span className="section-title">Recent Transactions</span>
            <Link to="/history" className="section-link">See all</Link>
          </div>

          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 16px' }}>
            {txLoading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <TrendingUp size={32} />
                <p>No transactions yet.<br />Send or deposit money to get started.</p>
              </div>
            ) : (
              transactions.map(tx => (
                <TransactionCard key={tx.id} tx={tx} currentUserId={profile?.id} />
              ))
            )}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
