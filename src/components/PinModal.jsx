import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

export default function PinModal({ onConfirm, onCancel, title = 'Enter PIN', error = '' }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
    if (newPin.every(d => d !== '') && newPin.join('').length === 4) {
      onConfirm(newPin.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: 20
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 20,
        padding: '32px 24px', width: '100%', maxWidth: 340,
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={20} color="var(--green)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
          Enter your 4-digit transaction PIN
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 56, height: 56, textAlign: 'center',
                fontSize: 24, fontWeight: 700,
                background: 'var(--surface2)',
                border: digit ? '2px solid var(--green)' : '2px solid var(--border)',
                borderRadius: 12, color: 'var(--text)',
                outline: 'none', fontFamily: 'Space Mono, monospace'
              }}
            />
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <button onClick={onCancel} className="btn-secondary" style={{ width: '100%' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
