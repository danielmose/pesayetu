import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, MinusCircle } from 'lucide-react';

const icons = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  deposit: PlusCircle,
  withdraw: MinusCircle,
};

const labels = {
  send: 'Sent',
  receive: 'Received',
  deposit: 'Deposit',
  withdraw: 'Withdrawal',
};

export default function TransactionCard({ tx, currentUserId }) {
  const Icon = icons[tx.type] || ArrowUpRight;
  const isPositive = tx.type === 'receive' || tx.type === 'deposit';
  const sign = isPositive ? '+' : '-';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getLabel = () => {
    if (tx.type === 'send') return `To: ${tx.receiver?.full_name || tx.receiver_phone || 'Unknown'}`;
    if (tx.type === 'receive') return `From: ${tx.sender?.full_name || 'Unknown'}`;
    return labels[tx.type];
  };

  return (
    <div className="tx-card">
      <div className={`tx-icon ${tx.type}`}>
        <Icon size={20} />
      </div>
      <div className="tx-info">
        <div className="tx-name">{getLabel()}</div>
        <div className="tx-date">{formatDate(tx.created_at)}</div>
      </div>
      <div>
        <div className={`tx-amount ${isPositive ? 'positive' : 'negative'}`}>
          {sign} KES {Number(tx.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
        <div className="tx-ref">{tx.reference}</div>
      </div>
    </div>
  );
}
