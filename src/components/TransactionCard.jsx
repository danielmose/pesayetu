import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, MinusCircle } from 'lucide-react';

const icons = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  deposit: PlusCircle,
  withdraw: MinusCircle,
};

export default function TransactionCard({ tx, currentUserId }) {
  const isSend = tx.type === 'send';
  const isDeposit = tx.type === 'deposit';
  const isWithdraw = tx.type === 'withdraw';
  const isReceive = tx.type === 'receive';
  const isPositive = isReceive || isDeposit;
  const sign = isPositive ? '+' : '-';
  const Icon = icons[tx.type] || ArrowUpRight;

  const amount = isSend || isWithdraw
    ? tx.send_amount
    : tx.receive_amount;

  const currency = isSend || isWithdraw
    ? tx.send_currency
    : tx.receive_currency;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getLabel = () => {
    if (isSend) return `To: ${tx.receiver?.full_name || 'Unknown'}`;
    if (isReceive) return `From: ${tx.sender?.full_name || 'Unknown'}`;
    if (isDeposit) return 'Deposit';
    if (isWithdraw) return 'Withdrawal';
    return tx.type;
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
          {sign} {currency} {Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
