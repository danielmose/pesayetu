import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { profile, logout } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PY';

  return (
    <nav className="top-navbar">
      <div className="navbar-logo">
        Pesa<span>Yetu</span>
      </div>
      <div className="navbar-actions">
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Bell size={20} />
        </button>
        <div className="avatar" title={profile?.full_name}>
          {initials}
        </div>
        <button
          onClick={logout}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
