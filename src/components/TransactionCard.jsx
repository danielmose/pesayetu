import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, MinusCircle } from 'lucide-react';

const icons = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  deposit: PlusCircle,
  withdraw: MinusCircle,
};

export default function TransactionCard({ tx, currentUserId }) {
  // If this is a send tx but current user is the RECEIVER, treat it as receive
  const isActuallySend = tx.type === 'send' && tx.sender_id === currentUserId;
  const isActuallyReceive = tx.type === 'send' && tx.receiver_id === currentUserId;
  const isDeposit = tx.type === 'deposit';
  const isWithdraw = tx.type === 'withdraw';

  const isPositive = isActuallyReceive || isDeposit;
  const sign = isPositive ? '+' : '-';

  const displayType = isActuallyReceive ? 'receive' : tx.type;
  const Icon = icons[displayType] || ArrowUpRight;

  // Use correct amount and currency based on perspective
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

  return (
    <div className="tx-card">
      <div className={`tx-icon ${displayType}`}>
        <Icon size={20} />
      </div>
      <div className="tx-info">
        <div className="tx-name">{getLabel()}</div>
        {tx.note && <div className="tx-note" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.note}</div>}
        <div className="tx-date">{formatDate(tx.created_at)}</div>
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
  );
}
