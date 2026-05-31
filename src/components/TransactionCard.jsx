import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, MinusCircle, RotateCcw, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

const icons = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  deposit: PlusCircle,
  withdraw: MinusCircle,
};

const REVERSAL_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function useReversalCountdown(createdAt) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      const remaining = REVERSAL_WINDOW_MS - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (timeLeft === null) return { expired: false, display: '' };
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  return {
    expired: timeLeft === 0,
    display: `${minutes}:${seconds.toString().padStart(2, '0')}`,
  };
}

export default function TransactionCard({ tx, currentUserId, onReverse }) {
  const isActuallySend     = tx.type === 'send' && tx.sender_id === currentUserId;
  const isActuallyReceive  = tx.type === 'send' && tx.receiver_id === currentUserId;
  const isReceiveType      = tx.type === 'receive' && tx.receiver_id === currentUserId;
  const isDeposit          = tx.type === 'deposit';
  const isWithdraw         = tx.type === 'withdraw';
  const isReversal         = tx.note === 'Reversal of transaction' || tx.note === 'Admin approved reversal';

  const isPositive  = isActuallyReceive || isDeposit || isReceiveType;
  const sign        = isPositive ? '+' : '-';
  const displayType = (isActuallyReceive || isReceiveType) ? 'receive' : tx.type;
  const Icon        = icons[displayType] || ArrowUpRight;

  const amount = isActuallySend
    ? tx.amount
    : isActuallyReceive
    ? tx.receive_amount
    : isReceiveType
    ? (tx.receive_amount || tx.amount)
    : tx.amount;

  const currency = isActuallySend
    ? tx.currency
    : isActuallyReceive
    ? tx.receive_currency
    : isReceiveType
    ? (tx.receive_currency || tx.currency)
    : tx.currency;

  const [dispute, setDispute] = useState(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [reason, setReason] = useState('');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { expired, display: countdownDisplay } = useReversalCountdown(tx.created_at);

  useEffect(() => {
    if (tx.type === 'send') fetchDispute();
  }, [tx.id]);

  // Close dispute form if window expires while it's open
  useEffect(() => {
    if (expired && showDisputeForm) setShowDisputeForm(false);
  }, [expired]);

  const fetchDispute = async () => {
    const { data } = await supabase
      .from('disputes')
      .select('*')
      .eq('transaction_id', tx.id)
      .maybeSingle();
    setDispute(data || null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getLabel = () => {
    if (isActuallySend)    return `To: ${tx.receiver?.full_name || 'Unknown'}`;
    if (isActuallyReceive) return `From: ${tx.sender?.full_name || 'Unknown'}`;
    if (isReceiveType)     return isReversal ? '↩ Reversal Received' : `From: ${tx.sender?.full_name || 'Unknown'}`;
    if (isDeposit)         return 'Deposit';
    if (isWithdraw)        return 'Withdrawal';
    return tx.type;
  };

  const handleRequestReversal = async () => {
    if (!reason.trim() || expired) return;
    setSubmitting(true);
    const { error } = await supabase.from('disputes').insert({
      transaction_id: tx.id,
      sender_id: tx.sender_id,
      receiver_id: tx.receiver_id,
      sender_reason: reason.trim(),
      status: 'pending',
    });
    if (error) {
      alert('Failed to submit dispute. Please try again.');
    } else {
      setShowDisputeForm(false);
      setReason('');
      fetchDispute();
    }
    setSubmitting(false);
  };

  const handleReceiverResponse = async () => {
    if (!response.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('disputes')
      .update({ receiver_response: response.trim() })
      .eq('id', dispute.id);
    if (error) {
      alert('Failed to submit response. Please try again.');
    } else {
      setShowResponseForm(false);
      setResponse('');
      fetchDispute();
    }
    setSubmitting(false);
  };

  const getDisputeStatusBadge = () => {
    if (!dispute) return null;
    const styles = {
      pending:           { bg: 'rgba(255,214,0,0.1)',  color: '#ffd600', border: 'rgba(255,214,0,0.3)',  label: '⏳ Pending Review' },
      resolved_reversed: { bg: 'rgba(0,230,118,0.1)',  color: '#00e676', border: 'rgba(0,230,118,0.3)',  label: '✅ Reversal Approved' },
      resolved_denied:   { bg: 'rgba(255,68,68,0.1)',  color: '#ff4444', border: 'rgba(255,68,68,0.3)',  label: '❌ Reversal Denied' },
    };
    const s = styles[dispute.status] || styles.pending;
    return (
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, color: s.color }}>
        {s.label}
        {dispute.admin_note && (
          <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, opacity: 0.8 }}>
            Admin: {dispute.admin_note}
          </div>
        )}
      </div>
    );
  };

  const canRequestReversal = isActuallySend && !tx.reversed && !dispute;
  const canRespond = isActuallyReceive && dispute && !dispute.receiver_response && dispute.status === 'pending';

  return (
    <div className="tx-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div className={`tx-icon ${displayType}`}>
          <Icon size={20} />
        </div>
        <div className="tx-info" style={{ flex: 1 }}>
          <div className="tx-name">
            {getLabel()}
            {tx.reversed && (
              <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--surface2)', color: 'var(--text-muted)', borderRadius: 6, padding: '2px 6px' }}>
                Reversed
              </span>
            )}
          </div>
          {tx.note && (
            <div className="tx-note" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.note}</div>
          )}
          <div className="tx-date">{formatDate(tx.created_at)}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className={`tx-amount ${isPositive ? 'positive' : 'negative'}`}>
            {sign} {currency ?? '?'}{' '}
            {Number(amount ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </div>
          {tx.charge > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Fee: {tx.currency} {Number(tx.charge).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {getDisputeStatusBadge()}

      {dispute && (
        <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 12 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>
            <strong style={{ color: 'var(--text)' }}>Sender's reason:</strong> {dispute.sender_reason}
          </div>
          {dispute.receiver_response && (
            <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
              <strong style={{ color: 'var(--text)' }}>Receiver's response:</strong> {dispute.receiver_response}
            </div>
          )}
        </div>
      )}

      {/* Reversal button with countdown */}
      {canRequestReversal && (
        <div style={{ marginTop: 8 }}>
          {!expired ? (
            <button
              onClick={() => setShowDisputeForm(v => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600, color: 'var(--green)',
                background: 'var(--green-glow)', border: '1px solid var(--green)',
                borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
              <RotateCcw size={11} />
              Request Reversal
              <span style={{
                marginLeft: 4, background: 'rgba(0,230,118,0.15)',
                border: '1px solid rgba(0,230,118,0.3)',
                borderRadius: 6, padding: '1px 6px',
                fontFamily: 'monospace', fontSize: 11, color: '#00e676',
                minWidth: 36, textAlign: 'center',
              }}>
                {countdownDisplay}
              </span>
            </button>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '4px 10px',
            }}>
              ⏱ Reversal window expired
            </div>
          )}
        </div>
      )}

      {canRespond && !showResponseForm && (
        <button onClick={() => setShowResponseForm(true)}
          style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', fontSize: 11, fontWeight: 600, color: '#ffd600', background: 'rgba(255,214,0,0.08)', border: '1px solid rgba(255,214,0,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <MessageSquare size={11} /> Respond to Reversal Request
        </button>
      )}

      {showDisputeForm && !expired && (
        <div style={{ marginTop: 8, padding: 12, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Why do you want to reverse this transaction?</div>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your reason..." rows={3}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setShowDisputeForm(false)}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleRequestReversal} disabled={submitting || !reason.trim()}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--green)', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: (!reason.trim() || submitting) ? 0.5 : 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {showResponseForm && (
        <div style={{ marginTop: 8, padding: 12, background: 'var(--surface2)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Your response to this reversal request:</div>
          <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Explain why you agree or disagree..." rows={3}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setShowResponseForm(false)}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleReceiverResponse} disabled={submitting || !response.trim()}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#ffd600', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: (!response.trim() || submitting) ? 0.5 : 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {submitting ? 'Submitting…' : 'Submit Response'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
