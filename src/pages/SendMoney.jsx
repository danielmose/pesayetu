import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, FileText, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CURRENCIES, fetchExchangeRates, convertCurrency } from '../lib/currencies';
import { getSendCharge, formatCharge } from '../lib/charges';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import PinModal from '../components/PinModal';

const COUNTRY_CODES = [
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
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
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
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
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+670', flag: '🇹🇱', name: 'Timor-Leste' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+676', flag: '🇹🇴', name: 'Tonga' },
  { code: '+1868', flag: '🇹🇹', name: 'Trinidad and Tobago' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
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

export default function SendMoney() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [rates, setRates] = useState(null);
  const [form, setForm] = useState({
    phone: '',
    amount: '',
    note: '',
    fromCurrency: profile?.currency || 'KES',
    receiveCurrency: profile?.currency || 'KES',
  });
  const [countryCode, setCountryCode] = useState(profile?.dial_code || '+254');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    refreshProfile();
    fetchWallets();
    fetchExchangeRates().then(setRates);
    detectLocation();
  }, []);

  useEffect(() => {
    if (profile?.currency) {
      setForm(f => ({ ...f, fromCurrency: profile.currency, receiveCurrency: profile.currency }));
    }
    if (profile?.dial_code) {
      setCountryCode(profile.dial_code);
    }
  }, [profile]);

  const fetchWallets = async () => {
    const { data } = await supabase
      .from('currency_wallets')
      .select('*')
      .eq('user_id', profile.id);
    setWallets(data || []);
  };

  const detectLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (!profile?.dial_code) {
        const detected = COUNTRY_CODES.find(c => c.name === data.country_name);
        if (detected) setCountryCode(detected.code);
      }
      if (!profile?.currency && CURRENCIES[data.currency]) {
        setForm(f => ({ ...f, fromCurrency: data.currency, receiveCurrency: data.currency }));
      }
    } catch {
      // keep profile/defaults
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const amount = parseFloat(form.amount) || 0;
  const charge = getSendCharge(amount);
  const total = amount + charge;
  const receiverGets = rates && form.fromCurrency !== form.receiveCurrency
    ? convertCurrency(amount, form.fromCurrency, form.receiveCurrency, rates)
    : amount;
  const rate = rates && form.fromCurrency !== form.receiveCurrency
    ? convertCurrency(1, form.fromCurrency, form.receiveCurrency, rates)
    : 1;

  const fromWallet = wallets.find(w => w.currency === form.fromCurrency);
  const fromBalance = fromWallet ? fromWallet.balance : 0;

  // Build all possible phone formats for lookup
  const buildPhoneVariants = (phone, dialCode) => {
    const stripped = phone.replace(/^0/, '');
    return [
      `${dialCode}${stripped}`,  // +254712345678
      `0${stripped}`,             // 0712345678
      phone,                      // whatever was typed
    ];
  };

  const lookupReceiver = async (phone) => {
    if (phone.length >= 9) {
      const variants = buildPhoneVariants(phone, countryCode);
      const orQuery = variants.map(v => `phone.eq.${v}`).join(',');
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .or(orQuery)
        .single();
      setReceiverInfo(data || null);
    } else {
      setReceiverInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }
    if (amount < 10) { setError('Minimum send amount is KES 10'); return; }
    if (fromBalance < total) {
      setError(`Insufficient ${form.fromCurrency} balance. Need ${total.toLocaleString()}`);
      return;
    }
    setShowPin(true);
  };

  const handlePinConfirm = async (pin) => {
    setPinError('');

    const { data: freshProfile, error: profileError } = await supabase
      .from('profiles')
      .select('transaction_pin, pin_attempts, pin_locked_until')
      .eq('id', profile.id)
      .single();

    if (profileError || !freshProfile) { setPinError('Could not verify PIN. Please try again.'); return; }

    if (freshProfile.pin_locked_until) {
      const lockedUntil = new Date(freshProfile.pin_locked_until);
      const now = new Date();
      if (now < lockedUntil) {
        const remaining = Math.ceil((lockedUntil - now) / 60000);
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

    // Find receiver using all phone variants
    const variants = buildPhoneVariants(form.phone, countryCode);
    const orQuery = variants.map(v => `phone.eq.${v}`).join(',');
    const { data: receiver } = await supabase
      .from('profiles')
      .select('id, full_name, balance')
      .or(orQuery)
      .single();

    if (!receiver) { setError('Recipient not found on PesaYetu'); setLoading(false); return; }

    // Atomic transfer via RPC
    const { data: transferResult, error: transferError } = await supabase.rpc('transfer_currency', {
      p_sender_id: profile.id,
      p_receiver_id: receiver.id,
      p_send_amount: total,
      p_send_currency: form.fromCurrency,
      p_receive_amount: receiverGets,
      p_receive_currency: form.receiveCurrency,
      p_exchange_rate: rate,
      p_charge: charge,
      p_note: form.note || null,
    });

    if (transferError || !transferResult?.success) {
      setError('Transfer failed. Please try again.');
      setLoading(false);
      return;
    }

    // Update profiles.balance for both
    await supabase.from('profiles')
      .update({ balance: (profile.balance || 0) - total })
      .eq('id', profile.id);
    await supabase.from('profiles')
      .update({ balance: (receiver.balance || 0) + receiverGets })
      .eq('id', receiver.id);

    await refreshProfile();
    await fetchWallets();
    setSuccess({ receiverName: receiver.full_name, receiverGets, receiveCurrency: form.receiveCurrency });
    setLoading(false);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--green)', marginBottom: 20 }}><CheckCircle size={72} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Money Sent! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{CURRENCIES[form.fromCurrency]?.symbol} {Number(form.amount).toLocaleString()} sent to</p>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{success.receiverName}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>They receive</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
            {CURRENCIES[success.receiveCurrency]?.symbol} {Number(success.receiverGets).toLocaleString('en', { minimumFractionDigits: 2 })} {success.receiveCurrency}
          </p>
          {charge > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Fee: {formatCharge(charge)} {form.fromCurrency}</p>}
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>Back to Home</button>
          <button className="btn-secondary" onClick={() => {
            setSuccess(null);
            setForm({ phone: '', amount: '', note: '', fromCurrency: profile?.currency || 'KES', receiveCurrency: profile?.currency || 'KES' });
          }} style={{ width: '100%', marginTop: 12 }}>Send Again</button>
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
          <span className="page-title">Send Money</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Send From</label>
              <select name="fromCurrency" value={form.fromCurrency} onChange={handleChange}
                style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none' }}>
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>{CURRENCIES[code]?.flag} {code} — {CURRENCIES[code]?.name}</option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Balance: {CURRENCIES[form.fromCurrency]?.symbol} {Number(fromBalance).toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="input-group">
              <label>Recipient Phone</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <select
                    value={countryCode}
                    onChange={(e) => { setCountryCode(e.target.value); if (form.phone.length >= 9) lookupReceiver(form.phone); }}
                    style={{ appearance: 'none', WebkitAppearance: 'none', padding: '12px 32px 12px 12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none', cursor: 'pointer', minWidth: 90 }}>
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code + c.name} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <Phone size={16} />
                  <input type="tel" name="phone" placeholder="712345678" value={form.phone}
                    onChange={(e) => { handleChange(e); lookupReceiver(e.target.value); }} required />
                </div>
              </div>
              {form.phone && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Full number: {countryCode}{form.phone.replace(/^0/, '')}
                </div>
              )}
              {receiverInfo && (
                <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>
                  ✅ {receiverInfo.full_name}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Amount ({form.fromCurrency})</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix" style={{ fontSize: 14 }}>{CURRENCIES[form.fromCurrency]?.symbol}</span>
                <input className="amount-input" type="number" name="amount" placeholder="0.00"
                  min="0" step="any" value={form.amount} onChange={handleChange} required style={{ paddingLeft: 64 }} />
              </div>
            </div>

            <div className="input-group">
              <label>Receiver Gets In</label>
              <select name="receiveCurrency" value={form.receiveCurrency} onChange={handleChange}
                style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, outline: 'none' }}>
                {Object.keys(CURRENCIES).map(code => (
                  <option key={code} value={code}>{CURRENCIES[code]?.flag} {code} — {CURRENCIES[code]?.name}</option>
                ))}
              </select>
            </div>

            {amount > 0 && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                  <span>{CURRENCIES[form.fromCurrency]?.symbol} {amount.toLocaleString()} {form.fromCurrency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fee</span>
                  <span style={{ color: charge === 0 ? 'var(--green)' : 'var(--text)' }}>{formatCharge(charge)}</span>
                </div>
                {form.fromCurrency !== form.receiveCurrency && rates && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Rate</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>1 {form.fromCurrency} = {rate.toFixed(4)} {form.receiveCurrency}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
                  <span style={{ fontWeight: 700 }}>Receiver Gets</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--green)' }}>
                    {CURRENCIES[form.receiveCurrency]?.symbol} {receiverGets.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {form.receiveCurrency}
                  </span>
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Note (Optional)</label>
              <div className="input-wrapper">
                <FileText />
                <input type="text" name="note" placeholder="What's this for?" value={form.note} onChange={handleChange} maxLength={100} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : `Send ${form.amount || '0'} ${form.fromCurrency} ${charge === 0 ? '(Free)' : `+ ${formatCharge(charge)} fee`}`}
            </button>
          </div>
        </form>
      </div>

      {showPin && (
        <PinModal
          title="Confirm Send"
          error={pinError}
          onConfirm={handlePinConfirm}
          onCancel={() => { setShowPin(false); setPinError(''); }}
        />
      )}

      <BottomNav />
    </div>
  );
}
