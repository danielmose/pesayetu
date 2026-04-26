import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import TransactionCard from '../components/TransactionCard';

const FILTERS = ['All', 'Send', 'Receive', 'Deposit', 'Withdraw'];

export default function History() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, sender:sender_id(full_name), receiver:receiver_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setTransactions(data || []);
    setLoading(false);
  };

  const filtered = filter === 'All'
    ? transactions
    : transactions.filter(tx => tx.type === filter.toLowerCase());

  return (
    <div className="app-layout">
      <Navbar />
      <div className="inner-page">
        <div className="page-header">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /></Link>
          <span className="page-title">Transaction History</span>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1.5px solid',
                borderColor: filter === f ? 'var(--green)' : 'var(--border)',
                background: filter === f ? 'var(--green-glow)' : 'transparent',
                color: filter === f ? 'var(--green)' : 'var(--text-muted)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 16px' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={32} />
              <p>No {filter.toLowerCase()} transactions yet.</p>
            </div>
          ) : (
            filtered.map(tx => (
              <TransactionCard key={tx.id} tx={tx} currentUserId={profile?.id} />
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
