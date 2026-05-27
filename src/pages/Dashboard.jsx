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
    const init = async () => {
      await refreshProfile();
      fetchTransactions();
    };
    init();
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    fetchWallets(profile.id);
  }, [profile?.id]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('currency_transactions')
      .select(`
        *,
        sender:sender_id(full_name),
        receiver:receiver_id(full_name)
      `)
      .or(`sender_id.eq.${profile?.id},receiver_id.eq.${profile?.id}`)
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

  // Get total balance in KES (main wallet)
  const kesWallet = wallets.find(w => w.currency === 'KES');
  const displayBalance = kesWallet ? kesWallet.balance : (profile?.balance || 0);

  const formatBalance = (bal) => {
    return Number(bal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-label">Available Balance</div>
          <div className="balance-amount">
            <span className="balance-currency">KES </span>
            {formatBalance(displayBalance)}
          </div>
          <div className="balance-phone">{profile?.phone}</div>

          {/* Other wallets */}
          {wallets.filter(w => w.currency !== 'KES' && w.balance > 0).length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {wallets.filter(w => w.currency !== 'KES' && w.balance > 0).map(w => (
                <div key={w.currency} style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: 8,
                  padding: '4px 10px', fontSize: 12, fontFamily: 'Space Mono, monospace'
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
