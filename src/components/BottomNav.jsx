import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Send, Download, Upload, Clock } from 'lucide-react';

const items = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/send', label: 'Send', icon: Send },
  { path: '/deposit', label: 'Deposit', icon: Download },
  { path: '/withdraw', label: 'Withdraw', icon: Upload },
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
