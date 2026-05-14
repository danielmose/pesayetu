import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Send, Wallet, ArrowLeftRight, Clock } from 'lucide-react';

const items = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/send', label: 'Send', icon: Send },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/convert', label: 'Convert', icon: ArrowLeftRight },
  { path: '/history', label: 'History', icon: Clock },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="bottom-nav">
      {items.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={`bottom-nav-item ${location.pathname === path ? 'active' : ''}`}
        >
          <Icon />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
