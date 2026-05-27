import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Phone, Building2, CreditCard, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getWithdrawCharge, formatCharge } from '../lib/charges';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import PinModal from '../components/PinModal';

const CHIMONEY_API_KEY = import.meta.env.VITE_CHIMONEY_API_KEY;
const PRESETS = [500, 1000, 2000, 5000];

const METHODS = [
  { id: 'mobilemoney', label: 'Mobile Money', icon: <Phone size={18} />, desc: 'M-Pesa, Airtel, MTN' },
  { id: 'bank', label: 'Bank Transfer', icon: <Building2 size={18} />, desc: 'Local & international banks' },
  { id: 'card', label: 'Card Payout', icon: <CreditCard size={18} />, desc: 'Visa / Mastercard' },
];

const COUNTRY_CODES = [
  { code: '+93', flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+1268', flag: '🇦🇬', name: 'Antigua and Barbuda' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+1242', flag: '🇧🇸', name: 'Bahamas' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+1246', flag: '🇧🇧', name: 'Barbados' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+673', flag: '🇧🇳', name: 'Brunei' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+257', flag: '🇧🇮', name: 'Burundi' },
  { code: '+238', flag: '🇨🇻', name: 'Cabo Verde' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+236', flag: '🇨🇫', name: 'Central African Republic' },
  { code: '+235', flag: '🇹🇩', name: 'Chad' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+269', flag: '🇰🇲', name: 'Comoros' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', flag: '🇨🇩', name: 'Congo (DRC)' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+225', flag: '🇨🇮', name: "Cote d'Ivoire" },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+53', flag: '🇨🇺', name: 'Cuba' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+1767', flag: '🇩🇲', name: 'Dominica' },
  { code: '+1809', flag: '🇩🇴', name: 'Dominican Republic' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+1473', flag: '🇬🇩', name: 'Grenada' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
  { code: '+592', flag: '🇬🇾', name: 'Guyana' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+1876', flag: '🇯🇲', name: 'Jamaica' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+7', flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+686', flag: '🇰🇮', name: 'Kiribati' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: '+231', flag: '🇱🇷', name: 'Liberia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
  { code: '+230', flag: '🇲🇺', name: 'Mauritius' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+691', flag: '🇫🇲', name: 'Micronesia' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: '+674', flag: '🇳🇷', name: 'Nauru' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+680', flag: '🇵🇼', name: 'Palau' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+1869', flag: '🇰🇳', name: 'Saint Kitts and Nevis' },
  { code: '+1758', flag: '🇱🇨', name: 'Saint Lucia' },
  { code: '+1784', flag: '🇻🇨', name: 'Saint Vincent and the Grenadines' },
  { code: '+685', flag: '🇼🇸', name: 'Samoa' },
  { code: '+378', flag: '🇸🇲', name: 'San Marino' },
  { code: '+239', flag: '🇸🇹', name: 'Sao Tome and Principe' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+248', flag: '🇸🇨', name: 'Seychelles' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+211', flag: '🇸🇸', name: 'South Sudan' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+597', flag: '🇸🇷', name: 'Suriname' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+670', flag: '🇹🇱', name: 'Timor-Leste' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+676', flag: '🇹🇴', name: 'Tonga' },
  { code: '+1868', flag: '🇹🇹', name: 'Trinidad and Tobago' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+678', flag: '🇻🇺', name: 'Vanuatu' },
  { code: '+379', flag: '🇻🇦', name: 'Vatican City' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
];

function CountryCodePicker({ value, onChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];
  const filtered = search.length > 0
    ? COUNTRY_CODES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search))
    : COUNTRY_CODES;

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 10px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 90 }}>
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 999, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, width: 260, maxHeight: 300, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={14} color="var(--text-muted)" />
            <input autoFocus type="text" placeholder="Search country..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13 }} />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 240 }}>
            {filtered.length === 0 && <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>No results</div>}
            {filtered.map(c => (
              <button key={c.code + c.name} type="button" onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: value === c.code ? 'rgba(0,200,100,0.08)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{c.flag}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ color: 'var(--green)', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Withdraw() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState('mobilemoney');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [kesUsdRate, setKesUsdRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const amt = parseFloat(amount) || 0;
  const charge = getWithdrawCharge(amt);
  const total = amt + charge;
  const amtInUSD = kesUsdRate ? (amt / kesUsdRate).toFixed(2) : null;
  const fullPhone = phone ? `${countryCode}${phone.replace(/^0/, '')}` : '';

  useEffect(() => {
    fetchWalletBalance();
    fetchLiveRate();
  }, []);

  const fetchWalletBalance = async () => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('balance')
      .eq('user_id', profile.id)
      .eq('currency', 'KES')
      .single();
    setWalletBalance(data?.balance || 0);
  };

  const fetchLiveRate = async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      setKesUsdRate(data.rates.KES);
    } catch {
      setKesUsdRate(130);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amt || amt < 10) { setError('Minimum withdrawal is KES 10'); return; }
    if (amt > 1000000) { setError('Maximum withdrawal is KES 1,000,000'); return; }
    if (total > walletBalance) { setError(`Insufficient balance. You need KES ${total.toLocaleString()} (amount + fee)`); return; }
    if (method === 'mobilemoney' && !phone) { setError('Enter your mobile money phone number'); return; }
    if (method === 'bank' && (!bankCode || !accountNumber)) { setError('Enter bank code and account number'); return; }
    if (method === 'card' && !cardNumber) { setError('Enter your card number'); return; }
    setShowPin(true);
  };

  const handlePinConfirm = async (pin) => {
    setPinError('');

    const { data: freshProfile } = await supabase
      .from('profiles')
      .select('transaction_pin, pin_attempts, pin_locked_until')
      .eq('id', profile.id)
      .single();

    if (!freshProfile) { setPinError('Could not verify PIN. Please try again.'); return; }

    if (freshProfile.pin_locked_until) {
      const lockedUntil = new Date(freshProfile.pin_locked_until);
      if (new Date() < lockedUntil) {
        const remaining = Math.ceil((lockedUntil - new Date()) / 60000);
        setPinError(`PIN locked. Try again in ${remaining} minute${remaining > 1 ? 's' : ''}.`);
        return;
      }
      await supabase.from('profiles').update({ pin_attempts: 0, pin_locked_until: null }).eq('id', profile.id);
    }

    if (!freshProfile.transaction_pin) { setPinError('No PIN set. Please set a PIN in Settings.'); return; }

    const isCorrect = btoa(pin) === freshProfile.transaction_pin;
    if (!isCorrect) {
      const attempts = (freshProfile.pin_attempts || 0) + 1;
      const MAX_ATTEMPTS = 3;
      const LOCK_MINUTES = 30;
      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        await supabase.from('profiles').update({ pin_attempts: attempts, pin_locked_until: lockUntil.toISOString() }).eq('id', profile.id);
        setPinError(`Incorrect PIN. Account locked for ${LOCK_MINUTES} minutes.`);
      } else {
        await supabase.from('profiles').update({ pin_attempts: attempts }).eq('id', profile.id);
        const remaining = MAX_ATTEMPTS - attempts;
        setPinError(`Incorrect PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
      }
      return;
    }

    await supabase.from('profiles').update({ pin_attempts: 0, pin_locked_until: null }).eq('id', profile.id);
    setShowPin(false);
    setLoading(true);

    try {
      const usdValue = kesUsdRate ? (amt / kesUsdRate).toFixed(2) : (amt / 130).toFixed(2);
      let chimoneyPayload = { valueInUSD: usdValue };

      if (method === 'mobilemoney') {
        chimoneyPayload.phoneNumber = fullPhone;
        chimoneyPayload.countryToSend = countryCode === '+254' ? 'KE' : '';
      } else if (method === 'bank') {
        chimoneyPayload.bankCode = bankCode;
        chimoneyPayload.accountNumber = accountNumber;
      } else if (method === 'card') {
        chimoneyPayload.cardNumber = cardNumber;
      }

      const endpoint = method === 'mobilemoney'
        ? 'https://api.chimoney.io/v0.2/payouts/mobile-money'
        : method === 'bank'
        ? 'https://api.chimoney.io/v0.2/payouts/bank'
        : 'https://api.chimoney.io/v0.2/payouts/card';

      const chiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': CHIMONEY_API_KEY },
        body: JSON.stringify({ payouts: [chimoneyPayload] }),
      });

      const chiData = await chiRes.json();
      if (!chiRes.ok || chiData.status === 'error') {
        setError(chiData.error || 'Chimoney payout failed. Please try again.');
        setLoading(false);
        return;
      }

      await supabase.from('currency_wallets').update({ balance: walletBalance - total }).eq('user_id', profile.id).eq('currency', 'KES');
      await supabase.rpc('withdraw_money', { p_user_id: profile.id, p_amount: total });
      await supabase.from('currency_transactions').insert({
        sender_id: profile.id, receiver_id: profile.id,
        send_amount: total, send_currency: 'KES',
        receive_amount: amt, receive_currency: 'KES',
        exchange_rate: 1, type: 'withdraw',
        note: `${method} withdrawal via Chimoney`,
      });

      await refreshProfile();
      await fetchWalletBalance();
      setSuccess(true);
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--green)', marginBottom: 20 }}><CheckCircle size={72} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Withdrawal Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>KES {Number(amount).toLocaleString()} via {METHODS.find(m => m.id === method)?.label}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>Transaction fee: KES {charge.toLocaleString()}</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: 'var(--green)', margin: '20px 0 40px' }}>
            KES {Number(walletBalance - total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>Back to Home</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className="inner-page">
        <div className="page-header">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /></Link>
          <span className="page-title">Withdraw Cash</span>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Available</span>
          <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--green)', fontWeight: 700 }}>
            KES {Number(walletBalance).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {kesUsdRate && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'right' }}>
            Live rate: 1 USD = KES {kesUsdRate.toFixed(2)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Withdrawal Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {METHODS.map(m => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', background: method === m.id ? 'rgba(0,200,100,0.08)' : 'var(--surface2)', border: method === m.id ? '2px solid var(--green)' : '1.5px solid var(--border)', color: 'var(--text)', textAlign: 'left' }}>
                    <span style={{ color: method === m.id ? 'var(--green)' : 'var(--text-muted)' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {method === 'mobilemoney' && (
              <div className="input-group">
                <label>Phone Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <CountryCodePicker value={countryCode} onChange={setCountryCode} />
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <Phone size={16} />
                    <input type="tel" placeholder="712345678" value={phone}
                      onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
                {phone && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Full number: {fullPhone}
                  </div>
                )}
              </div>
            )}

            {method === 'bank' && (
              <>
                <div className="input-group">
                  <label>Bank Code</label>
                  <div className="input-wrapper">
                    <Building2 size={16} />
                    <input type="text" placeholder="e.g. 01 for KCB" value={bankCode}
                      onChange={e => setBankCode(e.target.value)} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Account Number</label>
                  <div className="input-wrapper">
                    <Building2 size={16} />
                    <input type="text" placeholder="Your bank account number" value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            {method === 'card' && (
              <div className="input-group">
                <label>Card Number</label>
                <div className="input-wrapper">
                  <CreditCard size={16} />
                  <input type="text" placeholder="16-digit card number" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)} maxLength={16} required />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Amount (KES)</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix">KES</span>
                <input className="amount-input" type="number" placeholder="0.00"
                  min="10" max="1000000" value={amount}
                  onChange={e => setAmount(e.target.value)} required style={{ paddingLeft: 64 }} />
              </div>
              {amtInUSD && amt > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  ≈ USD {amtInUSD} at live rate
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PRESETS.map(p => (
                <button key={p} type="button" className="btn-secondary"
                  style={{ padding: '10px 4px', fontSize: 13 }} onClick={() => setAmount(String(p))}>
                  {p.toLocaleString()}
                </button>
              ))}
            </div>

            {amt > 0 && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Withdrawal Amount</span>
                  <span>KES {amt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction Fee</span>
                  <span>{formatCharge(charge)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: 700 }}>Total Deducted</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--red)' }}>
                    KES {total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : `Withdraw KES ${amount || '0'} + KES ${charge} fee`}
            </button>
          </div>
        </form>
      </div>

      {showPin && (
        <PinModal
          title="Confirm Withdrawal"
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => { setShowPin(false); setPinError(''); }}
        />
      )}

      <BottomNav />
    </div>
  );
}
