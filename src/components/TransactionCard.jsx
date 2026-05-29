import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, MinusCircle, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const icons = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  deposit: PlusCircle,
  withdraw: MinusCircle,
};

export default function TransactionCard({ tx, currentUserId, onReverse }) {
  const isActuallySend = tx.type === 'send' && tx.sender_id === currentUserId;
  const isActuallyReceive = tx.type === 'send' && tx.receiver_id === currentUserId;
  const isDeposit = tx.type === 'deposit';
  const isWithdraw = tx.type === 'withdraw';

  const isPositive = isActuallyReceive || isDeposit;
  const sign = isPositive ? '+' : '-';

  const displayType = isActuallyReceive ? 'receive' : tx.type;
  const Icon = icons[displayType] || ArrowUpRight;

  const amount = isActuallySend
    ? tx.amount
    : isActuallyReceive
    ? tx.receive_amount
    : tx.amount;

  const currency = isActuallySend
    ? tx.currency
    : isActuallyReceive
    ? tx.receive_currency
    : tx.currency;

  const [timeLeft, setTimeLeft] = useState(null);
  const [reversing, setReversing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Check if within 5-minute reversal window
  const getRemainingSeconds = () => {
    const created = new Date(tx.created_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - created) / 1000);
    return Math.max(0, 300 - elapsed); // 300s = 5 mins
  };

  useEffect(() => {
    if (!isActuallySend || tx.reversed) return;

    const remaining = getRemainingSeconds();
    if (remaining <= 0) return;

    setTimeLeft(remaining);
    const interval = setInterval(() => {
      const left = getRemainingSeconds();
      setTimeLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [tx.id]);

  const handleReverse = async () => {
    setReversing(true);
    const { data, error } = await supabase.rpc('reverse_transaction', {
      p_transaction_id: tx.id,
      p_user_id: currentUserId,
    });

    if (error || !data?.success) {
      alert(data?.message || 'Reversal failed. Please try again.');
    } else {
      onReverse?.();
    }
    setConfirmOpen(false);
    setReversing(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getLabel = () => {
    if (isActuallySend) return `To: ${tx.receiver?.full_name || 'Unknown'}`;
    if (isActuallyReceive) return `From: ${tx.sender?.full_name || 'Unknown'}`;
    if (isDeposit) return 'Deposit';
    if (isWithdraw) return 'Withdrawal';
    return tx.type;
  };

  const formatTimeLeft = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const canReverse = isActuallySend && !tx.reversed && timeLeft > 0;

  return (
    <>
      <div className="tx-card">
        <div className={`tx-icon ${displayType}`}>
          <Icon size={20} />
        </div>
        <div className="tx-info">
          <div className="tx-name">
            {getLabel()}
            {tx.reversed && (
              <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '2px 6px' }}>
                Reversed
              </span>
            )}
          </div>
          {tx.note && (
            <div className="tx-note" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.note}</div>
          )}
          <div className="tx-date">{formatDate(tx.created_at)}</div>
          {canReverse && (
            <button
              onClick={() => setConfirmOpen(true)}
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--green)',
                background: 'var(--green-glow)',
                border: '1px solid var(--green)',
                borderRadius: 8,
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              <RotateCcw size={11} />
              Reverse · {formatTimeLeft(timeLeft)}
            </button>
          )}
        </div>
        <div>
          <div className={`tx-amount ${isPositive ? 'positive' : 'negative'}`}>
            {sign} {currency ?? '?'}{' '}
            {Number(amount ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </div>
          {tx.charge > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
              Fee: {tx.currency} {Number(tx.charge).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 16, padding: 24, width: '100%', maxWidth: 340,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Reverse Transaction?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>
              This will refund <strong>{currency} {Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</strong> back to your wallet.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              The amount will be deducted from <strong>{tx.receiver?.full_name || 'the recipient'}</strong>.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)',
                  background: 'transparent', color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReverse}
                disabled={reversing}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: 'var(--green)', color: '#000', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                {reversing ? 'Reversing...' : 'Yes, Reverse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
