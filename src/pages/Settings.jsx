import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, Globe, ChevronDown, MapPin, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const COUNTRIES = [
  { name: 'Afghanistan', flag: '🇦🇫', dialCode: '+93', currency: 'AFN', symbol: '؋' },
  { name: 'Albania', flag: '🇦🇱', dialCode: '+355', currency: 'ALL', symbol: 'L' },
  { name: 'Algeria', flag: '🇩🇿', dialCode: '+213', currency: 'DZD', symbol: 'دج' },
  { name: 'Andorra', flag: '🇦🇩', dialCode: '+376', currency: 'EUR', symbol: '€' },
  { name: 'Angola', flag: '🇦🇴', dialCode: '+244', currency: 'AOA', symbol: 'Kz' },
  { name: 'Antigua and Barbuda', flag: '🇦🇬', dialCode: '+1-268', currency: 'XCD', symbol: '$' },
  { name: 'Argentina', flag: '🇦🇷', dialCode: '+54', currency: 'ARS', symbol: '$' },
  { name: 'Armenia', flag: '🇦🇲', dialCode: '+374', currency: 'AMD', symbol: '֏' },
  { name: 'Australia', flag: '🇦🇺', dialCode: '+61', currency: 'AUD', symbol: 'A$' },
  { name: 'Austria', flag: '🇦🇹', dialCode: '+43', currency: 'EUR', symbol: '€' },
  { name: 'Azerbaijan', flag: '🇦🇿', dialCode: '+994', currency: 'AZN', symbol: '₼' },
  { name: 'Bahamas', flag: '🇧🇸', dialCode: '+1-242', currency: 'BSD', symbol: '$' },
  { name: 'Bahrain', flag: '🇧🇭', dialCode: '+973', currency: 'BHD', symbol: '.د.ب' },
  { name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', currency: 'BDT', symbol: '৳' },
  { name: 'Barbados', flag: '🇧🇧', dialCode: '+1-246', currency: 'BBD', symbol: '$' },
  { name: 'Belarus', flag: '🇧🇾', dialCode: '+375', currency: 'BYN', symbol: 'Br' },
  { name: 'Belgium', flag: '🇧🇪', dialCode: '+32', currency: 'EUR', symbol: '€' },
  { name: 'Belize', flag: '🇧🇿', dialCode: '+501', currency: 'BZD', symbol: '$' },
  { name: 'Benin', flag: '🇧🇯', dialCode: '+229', currency: 'XOF', symbol: 'CFA' },
  { name: 'Bhutan', flag: '🇧🇹', dialCode: '+975', currency: 'BTN', symbol: 'Nu' },
  { name: 'Bolivia', flag: '🇧🇴', dialCode: '+591', currency: 'BOB', symbol: 'Bs.' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦', dialCode: '+387', currency: 'BAM', symbol: 'KM' },
  { name: 'Botswana', flag: '🇧🇼', dialCode: '+267', currency: 'BWP', symbol: 'P' },
  { name: 'Brazil', flag: '🇧🇷', dialCode: '+55', currency: 'BRL', symbol: 'R$' },
  { name: 'Brunei', flag: '🇧🇳', dialCode: '+673', currency: 'BND', symbol: '$' },
  { name: 'Bulgaria', flag: '🇧🇬', dialCode: '+359', currency: 'BGN', symbol: 'лв' },
  { name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', currency: 'XOF', symbol: 'CFA' },
  { name: 'Burundi', flag: '🇧🇮', dialCode: '+257', currency: 'BIF', symbol: 'Fr' },
  { name: 'Cambodia', flag: '🇰🇭', dialCode: '+855', currency: 'KHR', symbol: '៛' },
  { name: 'Cameroon', flag: '🇨🇲', dialCode: '+237', currency: 'XAF', symbol: 'FCFA' },
  { name: 'Canada', flag: '🇨🇦', dialCode: '+1', currency: 'CAD', symbol: 'CA$' },
  { name: 'Cape Verde', flag: '🇨🇻', dialCode: '+238', currency: 'CVE', symbol: '$' },
  { name: 'Central African Republic', flag: '🇨🇫', dialCode: '+236', currency: 'XAF', symbol: 'FCFA' },
  { name: 'Chad', flag: '🇹🇩', dialCode: '+235', currency: 'XAF', symbol: 'FCFA' },
  { name: 'Chile', flag: '🇨🇱', dialCode: '+56', currency: 'CLP', symbol: '$' },
  { name: 'China', flag: '🇨🇳', dialCode: '+86', currency: 'CNY', symbol: '¥' },
  { name: 'Colombia', flag: '🇨🇴', dialCode: '+57', currency: 'COP', symbol: '$' },
  { name: 'Comoros', flag: '🇰🇲', dialCode: '+269', currency: 'KMF', symbol: 'Fr' },
  { name: 'Congo (DRC)', flag: '🇨🇩', dialCode: '+243', currency: 'CDF', symbol: 'Fr' },
  { name: 'Congo (Republic)', flag: '🇨🇬', dialCode: '+242', currency: 'XAF', symbol: 'FCFA' },
  { name: 'Costa Rica', flag: '🇨🇷', dialCode: '+506', currency: 'CRC', symbol: '₡' },
  { name: 'Croatia', flag: '🇭🇷', dialCode: '+385', currency: 'EUR', symbol: '€' },
  { name: 'Cuba', flag: '🇨🇺', dialCode: '+53', currency: 'CUP', symbol: '$' },
  { name: 'Cyprus', flag: '🇨🇾', dialCode: '+357', currency: 'EUR', symbol: '€' },
  { name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', currency: 'CZK', symbol: 'Kč' },
  { name: 'Denmark', flag: '🇩🇰', dialCode: '+45', currency: 'DKK', symbol: 'kr' },
  { name: 'Djibouti', flag: '🇩🇯', dialCode: '+253', currency: 'DJF', symbol: 'Fr' },
  { name: 'Dominica', flag: '🇩🇲', dialCode: '+1-767', currency: 'XCD', symbol: '$' },
  { name: 'Dominican Republic', flag: '🇩🇴', dialCode: '+1-809', currency: 'DOP', symbol: '$' },
  { name: 'Ecuador', flag: '🇪🇨', dialCode: '+593', currency: 'USD', symbol: '$' },
  { name: 'Egypt', flag: '🇪🇬', dialCode: '+20', currency: 'EGP', symbol: 'E£' },
  { name: 'El Salvador', flag: '🇸🇻', dialCode: '+503', currency: 'USD', symbol: '$' },
  { name: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '+240', currency: 'XAF', symbol: 'FCFA' },
  { name: 'Eritrea', flag: '🇪🇷', dialCode: '+291', currency: 'ERN', symbol: 'Nfk' },
  { name: 'Estonia', flag: '🇪🇪', dialCode: '+372', currency: 'EUR', symbol: '€' },
  { name: 'Eswatini', flag: '🇸🇿', dialCode: '+268', currency: 'SZL', symbol: 'L' },
  { name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251', currency: 'ETB', symbol: 'Br' },
  { name: 'Fiji', flag: '🇫🇯', dialCode: '+679', currency: 'FJD', symbol: '$' },
  { name: 'Finland', flag: '🇫🇮', dialCode: '+358', currency: 'EUR', symbol: '€' },
  { name: 'France', flag: '🇫🇷', dialCode: '+33', currency: 'EUR', symbol: '€' },
  { name: 'Gabon', flag: '🇬🇦', dialCode: '+241', currency: 'XAF', symbol: 'FCFA' },
  { name: 'Gambia', flag: '🇬🇲', dialCode: '+220', currency: 'GMD', symbol: 'D' },
  { name: 'Georgia', flag: '🇬🇪', dialCode: '+995', currency: 'GEL', symbol: '₾' },
  { name: 'Germany', flag: '🇩🇪', dialCode: '+49', currency: 'EUR', symbol: '€' },
  { name: 'Ghana', flag: '🇬🇭', dialCode: '+233', currency: 'GHS', symbol: 'GH₵' },
  { name: 'Greece', flag: '🇬🇷', dialCode: '+30', currency: 'EUR', symbol: '€' },
  { name: 'Grenada', flag: '🇬🇩', dialCode: '+1-473', currency: 'XCD', symbol: '$' },
  { name: 'Guatemala', flag: '🇬🇹', dialCode: '+502', currency: 'GTQ', symbol: 'Q' },
  { name: 'Guinea', flag: '🇬🇳', dialCode: '+224', currency: 'GNF', symbol: 'Fr' },
  { name: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '+245', currency: 'XOF', symbol: 'CFA' },
  { name: 'Guyana', flag: '🇬🇾', dialCode: '+592', currency: 'GYD', symbol: '$' },
  { name: 'Haiti', flag: '🇭🇹', dialCode: '+509', currency: 'HTG', symbol: 'G' },
  { name: 'Honduras', flag: '🇭🇳', dialCode: '+504', currency: 'HNL', symbol: 'L' },
  { name: 'Hungary', flag: '🇭🇺', dialCode: '+36', currency: 'HUF', symbol: 'Ft' },
  { name: 'Iceland', flag: '🇮🇸', dialCode: '+354', currency: 'ISK', symbol: 'kr' },
  { name: 'India', flag: '🇮🇳', dialCode: '+91', currency: 'INR', symbol: '₹' },
  { name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', currency: 'IDR', symbol: 'Rp' },
  { name: 'Iran', flag: '🇮🇷', dialCode: '+98', currency: 'IRR', symbol: '﷼' },
  { name: 'Iraq', flag: '🇮🇶', dialCode: '+964', currency: 'IQD', symbol: 'ع.د' },
  { name: 'Ireland', flag: '🇮🇪', dialCode: '+353', currency: 'EUR', symbol: '€' },
  { name: 'Israel', flag: '🇮🇱', dialCode: '+972', currency: 'ILS', symbol: '₪' },
  { name: 'Italy', flag: '🇮🇹', dialCode: '+39', currency: 'EUR', symbol: '€' },
  { name: 'Ivory Coast', flag: '🇨🇮', dialCode: '+225', currency: 'XOF', symbol: 'CFA' },
  { name: 'Jamaica', flag: '🇯🇲', dialCode: '+1-876', currency: 'JMD', symbol: '$' },
  { name: 'Japan', flag: '🇯🇵', dialCode: '+81', currency: 'JPY', symbol: '¥' },
  { name: 'Jordan', flag: '🇯🇴', dialCode: '+962', currency: 'JOD', symbol: 'د.ا' },
  { name: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7', currency: 'KZT', symbol: '₸' },
  { name: 'Kenya', flag: '🇰🇪', dialCode: '+254', currency: 'KES', symbol: 'KSh' },
  { name: 'Kiribati', flag: '🇰🇮', dialCode: '+686', currency: 'AUD', symbol: 'A$' },
  { name: 'Kuwait', flag: '🇰🇼', dialCode: '+965', currency: 'KWD', symbol: 'د.ك' },
  { name: 'Kyrgyzstan', flag: '🇰🇬', dialCode: '+996', currency: 'KGS', symbol: 'лв' },
  { name: 'Laos', flag: '🇱🇦', dialCode: '+856', currency: 'LAK', symbol: '₭' },
  { name: 'Latvia', flag: '🇱🇻', dialCode: '+371', currency: 'EUR', symbol: '€' },
  { name: 'Lebanon', flag: '🇱🇧', dialCode: '+961', currency: 'LBP', symbol: 'ل.ل' },
  { name: 'Lesotho', flag: '🇱🇸', dialCode: '+266', currency: 'LSL', symbol: 'L' },
  { name: 'Liberia', flag: '🇱🇷', dialCode: '+231', currency: 'LRD', symbol: '$' },
  { name: 'Libya', flag: '🇱🇾', dialCode: '+218', currency: 'LYD', symbol: 'ل.د' },
  { name: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423', currency: 'CHF', symbol: 'Fr' },
  { name: 'Lithuania', flag: '🇱🇹', dialCode: '+370', currency: 'EUR', symbol: '€' },
  { name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352', currency: 'EUR', symbol: '€' },
  { name: 'Madagascar', flag: '🇲🇬', dialCode: '+261', currency: 'MGA', symbol: 'Ar' },
  { name: 'Malawi', flag: '🇲🇼', dialCode: '+265', currency: 'MWK', symbol: 'MK' },
  { name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', currency: 'MYR', symbol: 'RM' },
  { name: 'Maldives', flag: '🇲🇻', dialCode: '+960', currency: 'MVR', symbol: 'Rf' },
  { name: 'Mali', flag: '🇲🇱', dialCode: '+223', currency: 'XOF', symbol: 'CFA' },
  { name: 'Malta', flag: '🇲🇹', dialCode: '+356', currency: 'EUR', symbol: '€' },
  { name: 'Marshall Islands', flag: '🇲🇭', dialCode: '+692', currency: 'USD', symbol: '$' },
  { name: 'Mauritania', flag: '🇲🇷', dialCode: '+222', currency: 'MRU', symbol: 'UM' },
  { name: 'Mauritius', flag: '🇲🇺', dialCode: '+230', currency: 'MUR', symbol: '₨' },
  { name: 'Mexico', flag: '🇲🇽', dialCode: '+52', currency: 'MXN', symbol: '$' },
  { name: 'Micronesia', flag: '🇫🇲', dialCode: '+691', currency: 'USD', symbol: '$' },
  { name: 'Moldova', flag: '🇲🇩', dialCode: '+373', currency: 'MDL', symbol: 'L' },
  { name: 'Monaco', flag: '🇲🇨', dialCode: '+377', currency: 'EUR', symbol: '€' },
  { name: 'Mongolia', flag: '🇲🇳', dialCode: '+976', currency: 'MNT', symbol: '₮' },
  { name: 'Montenegro', flag: '🇲🇪', dialCode: '+382', currency: 'EUR', symbol: '€' },
  { name: 'Morocco', flag: '🇲🇦', dialCode: '+212', currency: 'MAD', symbol: 'MAD' },
  { name: 'Mozambique', flag: '🇲🇿', dialCode: '+258', currency: 'MZN', symbol: 'MT' },
  { name: 'Myanmar', flag: '🇲🇲', dialCode: '+95', currency: 'MMK', symbol: 'K' },
  { name: 'Namibia', flag: '🇳🇦', dialCode: '+264', currency: 'NAD', symbol: 'N$' },
  { name: 'Nauru', flag: '🇳🇷', dialCode: '+674', currency: 'AUD', symbol: 'A$' },
  { name: 'Nepal', flag: '🇳🇵', dialCode: '+977', currency: 'NPR', symbol: '₨' },
  { name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', currency: 'EUR', symbol: '€' },
  { name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', currency: 'NZD', symbol: 'NZ$' },
  { name: 'Nicaragua', flag: '🇳🇮', dialCode: '+505', currency: 'NIO', symbol: 'C$' },
  { name: 'Niger', flag: '🇳🇪', dialCode: '+227', currency: 'XOF', symbol: 'CFA' },
  { name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', currency: 'NGN', symbol: '₦' },
  { name: 'North Korea', flag: '🇰🇵', dialCode: '+850', currency: 'KPW', symbol: '₩' },
  { name: 'North Macedonia', flag: '🇲🇰', dialCode: '+389', currency: 'MKD', symbol: 'ден' },
  { name: 'Norway', flag: '🇳🇴', dialCode: '+47', currency: 'NOK', symbol: 'kr' },
  { name: 'Oman', flag: '🇴🇲', dialCode: '+968', currency: 'OMR', symbol: '﷼' },
  { name: 'Pakistan', flag: '🇵🇰', dialCode: '+92', currency: 'PKR', symbol: '₨' },
  { name: 'Palau', flag: '🇵🇼', dialCode: '+680', currency: 'USD', symbol: '$' },
  { name: 'Palestine', flag: '🇵🇸', dialCode: '+970', currency: 'ILS', symbol: '₪' },
  { name: 'Panama', flag: '🇵🇦', dialCode: '+507', currency: 'PAB', symbol: 'B/.' },
  { name: 'Papua New Guinea', flag: '🇵🇬', dialCode: '+675', currency: 'PGK', symbol: 'K' },
  { name: 'Paraguay', flag: '🇵🇾', dialCode: '+595', currency: 'PYG', symbol: '₲' },
  { name: 'Peru', flag: '🇵🇪', dialCode: '+51', currency: 'PEN', symbol: 'S/.' },
  { name: 'Philippines', flag: '🇵🇭', dialCode: '+63', currency: 'PHP', symbol: '₱' },
  { name: 'Poland', flag: '🇵🇱', dialCode: '+48', currency: 'PLN', symbol: 'zł' },
  { name: 'Portugal', flag: '🇵🇹', dialCode: '+351', currency: 'EUR', symbol: '€' },
  { name: 'Qatar', flag: '🇶🇦', dialCode: '+974', currency: 'QAR', symbol: '﷼' },
  { name: 'Romania', flag: '🇷🇴', dialCode: '+40', currency: 'RON', symbol: 'lei' },
  { name: 'Russia', flag: '🇷🇺', dialCode: '+7', currency: 'RUB', symbol: '₽' },
  { name: 'Rwanda', flag: '🇷🇼', dialCode: '+250', currency: 'RWF', symbol: 'Fr' },
  { name: 'Saint Kitts and Nevis', flag: '🇰🇳', dialCode: '+1-869', currency: 'XCD', symbol: '$' },
  { name: 'Saint Lucia', flag: '🇱🇨', dialCode: '+1-758', currency: 'XCD', symbol: '$' },
  { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', dialCode: '+1-784', currency: 'XCD', symbol: '$' },
  { name: 'Samoa', flag: '🇼🇸', dialCode: '+685', currency: 'WST', symbol: 'T' },
  { name: 'San Marino', flag: '🇸🇲', dialCode: '+378', currency: 'EUR', symbol: '€' },
  { name: 'Sao Tome and Principe', flag: '🇸🇹', dialCode: '+239', currency: 'STN', symbol: 'Db' },
  { name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', currency: 'SAR', symbol: '﷼' },
  { name: 'Senegal', flag: '🇸🇳', dialCode: '+221', currency: 'XOF', symbol: 'CFA' },
  { name: 'Serbia', flag: '🇷🇸', dialCode: '+381', currency: 'RSD', symbol: 'din' },
  { name: 'Seychelles', flag: '🇸🇨', dialCode: '+248', currency: 'SCR', symbol: '₨' },
  { name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232', currency: 'SLL', symbol: 'Le' },
  { name: 'Singapore', flag: '🇸🇬', dialCode: '+65', currency: 'SGD', symbol: 'S$' },
  { name: 'Slovakia', flag: '🇸🇰', dialCode: '+421', currency: 'EUR', symbol: '€' },
  { name: 'Slovenia', flag: '🇸🇮', dialCode: '+386', currency: 'EUR', symbol: '€' },
  { name: 'Solomon Islands', flag: '🇸🇧', dialCode: '+677', currency: 'SBD', symbol: '$' },
  { name: 'Somalia', flag: '🇸🇴', dialCode: '+252', currency: 'SOS', symbol: 'Sh' },
  { name: 'South Africa', flag: '🇿🇦', dialCode: '+27', currency: 'ZAR', symbol: 'R' },
  { name: 'South Korea', flag: '🇰🇷', dialCode: '+82', currency: 'KRW', symbol: '₩' },
  { name: 'South Sudan', flag: '🇸🇸', dialCode: '+211', currency: 'SSP', symbol: '£' },
  { name: 'Spain', flag: '🇪🇸', dialCode: '+34', currency: 'EUR', symbol: '€' },
  { name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', currency: 'LKR', symbol: '₨' },
  { name: 'Sudan', flag: '🇸🇩', dialCode: '+249', currency: 'SDG', symbol: 'ج.س.' },
  { name: 'Suriname', flag: '🇸🇷', dialCode: '+597', currency: 'SRD', symbol: '$' },
  { name: 'Sweden', flag: '🇸🇪', dialCode: '+46', currency: 'SEK', symbol: 'kr' },
  { name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', currency: 'CHF', symbol: 'Fr' },
  { name: 'Syria', flag: '🇸🇾', dialCode: '+963', currency: 'SYP', symbol: '£' },
  { name: 'Taiwan', flag: '🇹🇼', dialCode: '+886', currency: 'TWD', symbol: 'NT$' },
  { name: 'Tajikistan', flag: '🇹🇯', dialCode: '+992', currency: 'TJS', symbol: 'SM' },
  { name: 'Tanzania', flag: '🇹🇿', dialCode: '+255', currency: 'TZS', symbol: 'TSh' },
  { name: 'Thailand', flag: '🇹🇭', dialCode: '+66', currency: 'THB', symbol: '฿' },
  { name: 'Timor-Leste', flag: '🇹🇱', dialCode: '+670', currency: 'USD', symbol: '$' },
  { name: 'Togo', flag: '🇹🇬', dialCode: '+228', currency: 'XOF', symbol: 'CFA' },
  { name: 'Tonga', flag: '🇹🇴', dialCode: '+676', currency: 'TOP', symbol: 'T$' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹', dialCode: '+1-868', currency: 'TTD', symbol: '$' },
  { name: 'Tunisia', flag: '🇹🇳', dialCode: '+216', currency: 'TND', symbol: 'د.ت' },
  { name: 'Turkey', flag: '🇹🇷', dialCode: '+90', currency: 'TRY', symbol: '₺' },
  { name: 'Turkmenistan', flag: '🇹🇲', dialCode: '+993', currency: 'TMT', symbol: 'T' },
  { name: 'Tuvalu', flag: '🇹🇻', dialCode: '+688', currency: 'AUD', symbol: 'A$' },
  { name: 'Uganda', flag: '🇺🇬', dialCode: '+256', currency: 'UGX', symbol: 'USh' },
  { name: 'Ukraine', flag: '🇺🇦', dialCode: '+380', currency: 'UAH', symbol: '₴' },
  { name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', currency: 'AED', symbol: 'د.إ' },
  { name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', currency: 'GBP', symbol: '£' },
  { name: 'United States', flag: '🇺🇸', dialCode: '+1', currency: 'USD', symbol: '$' },
  { name: 'Uruguay', flag: '🇺🇾', dialCode: '+598', currency: 'UYU', symbol: '$' },
  { name: 'Uzbekistan', flag: '🇺🇿', dialCode: '+998', currency: 'UZS', symbol: 'лв' },
  { name: 'Vanuatu', flag: '🇻🇺', dialCode: '+678', currency: 'VUV', symbol: 'Vt' },
  { name: 'Vatican City', flag: '🇻🇦', dialCode: '+379', currency: 'EUR', symbol: '€' },
  { name: 'Venezuela', flag: '🇻🇪', dialCode: '+58', currency: 'VES', symbol: 'Bs.' },
  { name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', currency: 'VND', symbol: '₫' },
  { name: 'Yemen', flag: '🇾🇪', dialCode: '+967', currency: 'YER', symbol: '﷼' },
  { name: 'Zambia', flag: '🇿🇲', dialCode: '+260', currency: 'ZMW', symbol: 'ZK' },
  { name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', currency: 'ZWL', symbol: 'Z$' },
];

function PinInput({ value, onChange, onKeyDown, refs }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
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
  );
}

export default function Settings() {
  const { profile, logout } = useAuth();
  const [section, setSection] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Country state
  const [selectedCountry, setSelectedCountry] = useState(
    profile?.country ? COUNTRIES.find(c => c.name === profile.country) || null : null
  );
  const [countrySearch, setCountrySearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // PIN state
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const newPinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const [oldPin, setOldPin] = useState(['', '', '', '']);
  const [changedPin, setChangedPin] = useState(['', '', '', '']);
  const [confirmChangedPin, setConfirmChangedPin] = useState(['', '', '', '']);
  const oldPinRefs = useRef([]);
  const changedPinRefs = useRef([]);
  const confirmChangedRefs = useRef([]);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const detectLocation = async () => {
    setDetectingLocation(true);
    setLocationError('');
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.country_name) {
        const match = COUNTRIES.find(c =>
          c.name.toLowerCase() === data.country_name.toLowerCase()
        ) || COUNTRIES.find(c =>
          c.name.toLowerCase().includes(data.country_name.toLowerCase()) ||
          data.country_name.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          setSelectedCountry(match);
          setDropdownOpen(false);
        } else {
          setLocationError(`Detected "${data.country_name}" — please select manually`);
        }
      } else {
        setLocationError('Could not detect location. Please select manually.');
      }
    } catch {
      setLocationError('Detection failed. Please select manually.');
    }
    setDetectingLocation(false);
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCountry) { setError('Please select a country'); return; }
    setLoading(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({
        country: selectedCountry.name,
        dial_code: selectedCountry.dialCode,
        currency: selectedCountry.currency,
        currency_symbol: selectedCountry.symbol,
      })
      .eq('id', profile.id);

    if (err) setError(err.message);
    else {
      setSuccess('Country updated successfully!');
      setSection(null);
    }
    setLoading(false);
  };

  const handlePinInput = (arr, setArr, refs) => (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...arr];
    updated[index] = value.slice(-1);
    setArr(updated);
    if (value && index < 3) refs.current[index + 1]?.focus();
  };

  const handlePinKey = (arr, refs) => (index, e) => {
    if (e.key === 'Backspace' && !arr[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    setError('');
    const pinStr = newPin.join('');
    const confirmStr = confirmPin.join('');
    if (pinStr.length !== 4) { setError('Enter a complete 4-digit PIN'); return; }
    if (pinStr !== confirmStr) { setError('PINs do not match'); return; }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ transaction_pin: btoa(pinStr) })
      .eq('id', profile.id);
    if (error) setError(error.message);
    else {
      setSuccess('PIN set successfully!');
      setSection(null);
      setNewPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
    }
    setLoading(false);
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setError('');
    const oldStr = oldPin.join('');
    const newStr = changedPin.join('');
    const confirmStr = confirmChangedPin.join('');
    if (btoa(oldStr) !== profile.transaction_pin) { setError('Current PIN is incorrect'); return; }
    if (newStr.length !== 4) { setError('Enter a complete new PIN'); return; }
    if (newStr !== confirmStr) { setError('New PINs do not match'); return; }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ transaction_pin: btoa(newStr), pin_attempts: 0, pin_locked_until: null })
      .eq('id', profile.id);
    if (error) setError(error.message);
    else {
      setSuccess('PIN changed successfully!');
      setSection(null);
      setOldPin(['', '', '', '']);
      setChangedPin(['', '', '', '']);
      setConfirmChangedPin(['', '', '', '']);
    }
    setLoading(false);
  };

  const handleForgotPin = async () => {
    setError('');
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) {
        setError('Could not get your email. Please try logging out and in again.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'https://pesayetu-ohy3.vercel.app/reset-password',
      });
      if (error) setError(error.message);
      else setSuccess(`PIN reset link sent to ${user.email}!`);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
    setSection(null);
  };

  const cardStyle = {
    background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 16, overflow: 'hidden', marginBottom: 20
  };

  const sectionHeaderStyle = {
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10
  };

  const rowBtnStyle = {
    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
    borderBottom: '1px solid var(--border)', color: 'var(--text)',
    fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14,
    textAlign: 'left', cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="inner-page">
        <div className="page-header">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /></Link>
          <span className="page-title">Settings</span>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}
        {error && !section && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Profile info */}
        <div style={{ ...cardStyle, overflow: 'visible', padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--green)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{profile?.full_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{profile?.phone}</div>
            {profile?.country && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {COUNTRIES.find(c => c.name === profile.country)?.flag} {profile.country} · {profile.currency}
              </div>
            )}
          </div>
        </div>

        {/* ── Country & Currency ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <Globe size={18} color="var(--green)" />
            <span style={{ fontWeight: 700 }}>Country & Currency</span>
          </div>

          {profile?.country && section !== 'country' ? (
            /* Already set — show current + edit button */
            <div style={{ padding: '14px 20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{COUNTRIES.find(c => c.name === profile.country)?.flag}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.country}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {profile.dial_code} · {profile.currency} ({profile.currency_symbol})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setSection('country'); setError(''); setSuccess(''); }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'transparent', border: '1.5px solid var(--green)',
                    color: 'var(--green)', cursor: 'pointer'
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          ) : section !== 'country' ? (
            /* Not set yet */
            <button
              onClick={() => { setSection('country'); setError(''); setSuccess(''); }}
              style={{ ...rowBtnStyle, borderBottom: 'none' }}
            >
              <span>Set your country</span>
              <span style={{ color: 'var(--green)' }}>→</span>
            </button>
          ) : null}

          {/* Country selector form */}
          {section === 'country' && (
            <div style={{ padding: 20 }}>
              {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

              {/* Auto-detect */}
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '10px 16px', marginBottom: 12,
                  background: 'transparent', border: '2px dashed var(--border)',
                  borderRadius: 12, color: 'var(--text-muted)',
                  cursor: detectingLocation ? 'not-allowed' : 'pointer',
                  fontSize: 14, transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {detectingLocation
                  ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Detecting...</>
                  : <><MapPin size={15} /> Auto-detect my country</>
                }
              </button>

              {locationError && (
                <div style={{ fontSize: 12, color: '#f87171', marginBottom: 8, textAlign: 'center' }}>{locationError}</div>
              )}

              {/* Dropdown trigger */}
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', cursor: 'pointer', marginBottom: 8,
                  background: 'var(--surface2)',
                  border: selectedCountry ? '2px solid var(--green)' : '2px solid var(--border)',
                  borderRadius: 12, color: 'var(--text)',
                }}
              >
                {selectedCountry ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <span style={{ fontSize: 20 }}>{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {selectedCountry.dialCode} · {selectedCountry.currency}
                    </span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14 }}>
                    <Globe size={16} /> Select country
                  </span>
                )}
                <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </div>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div style={{
                  borderRadius: 12, border: '1px solid var(--border)',
                  background: 'var(--surface2)', maxHeight: 260, overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)', marginBottom: 12,
                }}>
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface2)' }}>
                    <input
                      type="text"
                      placeholder="Search country, code or currency..."
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      style={{
                        width: '100%', padding: '7px 10px',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 8, color: 'var(--text)', fontSize: 13,
                        outline: 'none', boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                  </div>
                  {filteredCountries.length === 0 ? (
                    <div style={{ padding: 14, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No results</div>
                  ) : filteredCountries.map(country => (
                    <div
                      key={country.name}
                      onClick={() => { setSelectedCountry(country); setDropdownOpen(false); setCountrySearch(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', cursor: 'pointer',
                        background: selectedCountry?.name === country.name ? 'rgba(0,200,100,0.08)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedCountry?.name === country.name ? 'rgba(0,200,100,0.08)' : 'transparent'}
                    >
                      <span style={{ fontSize: 18 }}>{country.flag}</span>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{country.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 6 }}>{country.dialCode}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 6px', borderRadius: 6, fontWeight: 600,
                        background: 'var(--surface)', color: 'var(--green)', border: '1px solid var(--border)'
                      }}>{country.currency}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info card */}
              {selectedCountry && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12, marginBottom: 14,
                  background: 'rgba(0,200,100,0.07)', border: '1px solid rgba(0,200,100,0.25)',
                  display: 'flex',
                }}>
                  {[
                    { label: 'DIAL CODE', value: selectedCountry.dialCode },
                    { label: 'CURRENCY', value: selectedCountry.currency },
                    { label: 'SYMBOL', value: selectedCountry.symbol },
                  ].map((item, i, arr) => (
                    <React.Fragment key={item.label}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)', fontFamily: 'Space Mono, monospace' }}>{item.value}</div>
                      </div>
                      {i < arr.length - 1 && <div style={{ width: 1, background: 'var(--border)' }} />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <button onClick={handleSaveCountry} className="btn-primary" disabled={loading} style={{ width: '100%', marginBottom: 10 }}>
                {loading ? 'Saving...' : 'Save Country'}
              </button>
              <button className="btn-secondary" onClick={() => { setSection(null); setDropdownOpen(false); }} style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── PIN Manager ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <Key size={18} color="var(--green)" />
            <span style={{ fontWeight: 700 }}>PIN Manager</span>
          </div>

          {!profile?.transaction_pin ? (
            <button onClick={() => { setSection('setPin'); setError(''); setSuccess(''); }} style={{ ...rowBtnStyle, borderBottom: 'none' }}>
              <span>Set Transaction PIN</span>
              <span style={{ color: 'var(--green)' }}>→</span>
            </button>
          ) : (
            <>
              <button onClick={() => { setSection('changePin'); setError(''); setSuccess(''); }} style={rowBtnStyle}>
                <span>Change PIN</span>
                <span style={{ color: 'var(--green)' }}>→</span>
              </button>
              <button onClick={() => { setSection('forgotPin'); setError(''); setSuccess(''); }} style={{ ...rowBtnStyle, borderBottom: 'none', color: 'var(--red)' }}>
                <span>Forgot PIN</span>
                <span>→</span>
              </button>
            </>
          )}
        </div>

        {/* Set PIN form */}
        {section === 'setPin' && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Set Transaction PIN</h3>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSetPin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>New PIN</label>
                <PinInput value={newPin} onChange={handlePinInput(newPin, setNewPin, newPinRefs)} onKeyDown={handlePinKey(newPin, newPinRefs)} refs={newPinRefs} />
              </div>
              <div className="input-group">
                <label>Confirm PIN</label>
                <PinInput value={confirmPin} onChange={handlePinInput(confirmPin, setConfirmPin, confirmPinRefs)} onKeyDown={handlePinKey(confirmPin, confirmPinRefs)} refs={confirmPinRefs} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Set PIN'}</button>
              <button type="button" className="btn-secondary" onClick={() => setSection(null)}>Cancel</button>
            </form>
          </div>
        )}

        {/* Change PIN form */}
        {section === 'changePin' && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Change PIN</h3>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Current PIN</label>
                <PinInput value={oldPin} onChange={handlePinInput(oldPin, setOldPin, oldPinRefs)} onKeyDown={handlePinKey(oldPin, oldPinRefs)} refs={oldPinRefs} />
              </div>
              <div className="input-group">
                <label>New PIN</label>
                <PinInput value={changedPin} onChange={handlePinInput(changedPin, setChangedPin, changedPinRefs)} onKeyDown={handlePinKey(changedPin, changedPinRefs)} refs={changedPinRefs} />
              </div>
              <div className="input-group">
                <label>Confirm New PIN</label>
                <PinInput value={confirmChangedPin} onChange={handlePinInput(confirmChangedPin, setConfirmChangedPin, confirmChangedRefs)} onKeyDown={handlePinKey(confirmChangedPin, confirmChangedRefs)} refs={confirmChangedRefs} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Change PIN'}</button>
              <button type="button" className="btn-secondary" onClick={() => setSection(null)}>Cancel</button>
            </form>
          </div>
        )}

        {/* Forgot PIN */}
        {section === 'forgotPin' && (
          <div style={{ ...cardStyle, padding: 20, textAlign: 'center' }}>
            <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>Forgot PIN?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              We'll send a reset link to your registered email address. Use it to reset your PIN.
            </p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <button className="btn-primary" onClick={handleForgotPin} disabled={loading} style={{ width: '100%', marginBottom: 12 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button className="btn-secondary" onClick={() => setSection(null)} style={{ width: '100%' }}>Cancel</button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '16px',
            background: 'var(--red-light)', border: '1.5px solid var(--red)',
            borderRadius: 12, color: 'var(--red)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 15, fontWeight: 700, cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>
      <BottomNav />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
