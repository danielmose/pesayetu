import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, Globe, ChevronDown, MapPin, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const pinInputs = useRef([]);
  const confirmInputs = useRef([]);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        if (match) { setSelectedCountry(match); setDropdownOpen(false); }
        else setLocationError(`Detected "${data.country_name}" — please select manually`);
      } else {
        setLocationError('Could not detect location. Please select manually.');
      }
    } catch {
      setLocationError('Detection failed. Please select manually.');
    }
    setDetectingLocation(false);
  };

  const handlePinChange = (index, value, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;
    const arr = isConfirm ? [...confirmPin] : [...pin];
    arr[index] = value.slice(-1);
    isConfirm ? setConfirmPin(arr) : setPin(arr);
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputs : pinInputs;
      refs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index, e, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const arr = isConfirm ? [...confirmPin] : [...pin];
      if (!arr[index] && index > 0) {
        const refs = isConfirm ? confirmInputs : pinInputs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCountry) { setError('Please select your country'); return; }
    const phone = form.phone.replace(/\s/g, '');
    const dialNoPlus = selectedCountry.dialCode.replace('+', '').replace(/-/g, '');
    const localPattern = new RegExp(`^(0\\d{7,11}|\\+${dialNoPlus}\\d{6,11}|${dialNoPlus}\\d{6,11})$`);
    if (!localPattern.test(phone)) {
      setError(`Enter a valid phone number for ${selectedCountry.name} (e.g. ${selectedCountry.dialCode}XXXXXXXXX)`);
      return;
    }
    setStep(3);
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setError('');
    const pinStr = pin.join('');
    const confirmStr = confirmPin.join('');
    if (pinStr.length !== 4) { setError('Enter a complete 4-digit PIN'); return; }
    if (pinStr !== confirmStr) { setError('PINs do not match'); return; }

    setLoading(true);

    const rawPhone = form.phone.replace(/\s/g, '');
    const dialClean = selectedCountry.dialCode.replace(/-/g, '');
    let normalizedPhone = rawPhone;
    if (rawPhone.startsWith('0')) {
      normalizedPhone = dialClean + rawPhone.slice(1);
    } else if (!rawPhone.startsWith('+')) {
      normalizedPhone = dialClean + rawPhone;
    }

    const { error: regError, data } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: normalizedPhone,
          country: selectedCountry.name,
          dial_code: selectedCountry.dialCode,
          currency: selectedCountry.currency,
          currency_symbol: selectedCountry.symbol,
          transaction_pin: btoa(pinStr),
        }
      }
    });

    if (regError) { setError(regError.message); setLoading(false); return; }

    if (data.user) {
      await new Promise(r => setTimeout(r, 1500));

      const { error: fnError } = await supabase.rpc('create_profile', {
        p_id: data.user.id,
        p_full_name: form.fullName,
        p_phone: normalizedPhone,
        p_email: form.email,
        p_country: selectedCountry.name,
        p_dial_code: selectedCountry.dialCode,
        p_currency: selectedCountry.currency,
        p_currency_symbol: selectedCountry.symbol,
        p_transaction_pin: btoa(pinStr),
      });

      if (fnError) {
        setError('Database error saving new user');
        setLoading(false);
        return;
      }

      await supabase.from('currency_wallets').upsert({
        user_id: data.user.id,
        currency: selectedCountry.currency,
        balance: 0,
      }, { onConflict: 'user_id,currency' });
    }

    setSuccess('Account created! Check your email to confirm, then sign in.');
    setLoading(false);
  };

  const pinBoxStyle = (digit) => ({
    width: 56, height: 56, textAlign: 'center',
    fontSize: 24, fontWeight: 700,
    background: 'var(--surface2)',
    border: digit ? '2px solid var(--green)' : '2px solid var(--border)',
    borderRadius: 12, color: 'var(--text)',
    outline: 'none', fontFamily: 'Space Mono, monospace',
  });

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="logo-icon">PY</div>
        <div className="logo-text">Pesa<span>Yetu</span></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? 'var(--green)' : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="auth-heading">
            <h1>Create account 🚀</h1>
            <p>Step 1 of 3 — Your details</p>
          </div>
          <form className="auth-form" onSubmit={handleStep1}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User />
                <input type="text" name="fullName" placeholder="John Kamau" value={form.fullName} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Phone />
                <input type="tel" name="phone" placeholder="e.g. 0712345678" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail />
                <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary">Next →</button>
            <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <div className="auth-heading">
            <h1>Where are you? 🌍</h1>
            <p>Step 2 of 3 — Select your country</p>
          </div>
          <form className="auth-form" onSubmit={handleStep2}>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="button" onClick={detectLocation} disabled={detectingLocation}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px 16px', marginBottom: 12, background: 'transparent', border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)', cursor: detectingLocation ? 'not-allowed' : 'pointer', fontSize: 14, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {detectingLocation ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Detecting location...</> : <><MapPin size={16} /> Auto-detect my country</>}
            </button>
            {locationError && <div style={{ fontSize: 12, color: '#f87171', marginBottom: 8, textAlign: 'center' }}>{locationError}</div>}
            <div className="input-group">
              <label>Country</label>
              <div onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', background: 'var(--surface2)', border: selectedCountry ? '2px solid var(--green)' : '2px solid var(--border)', borderRadius: 12, color: 'var(--text)' }}>
                {selectedCountry ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                    <span style={{ fontSize: 22 }}>{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selectedCountry.dialCode} · {selectedCountry.currency}</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
                    <Globe size={18} /> Select your country
                  </span>
                )}
                <ChevronDown size={18} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </div>
              {dropdownOpen && (
                <div style={{ marginTop: 6, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface2)', maxHeight: 300, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', position: 'relative', zIndex: 10 }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface2)' }}>
                    <input type="text" placeholder="Search country, code or currency..." value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      autoFocus />
                  </div>
                  {filteredCountries.length === 0 ? (
                    <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>No results</div>
                  ) : (
                    filteredCountries.map(country => (
                      <div key={country.name}
                        onClick={() => { setSelectedCountry(country); setDropdownOpen(false); setCountrySearch(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', background: selectedCountry?.name === country.name ? 'rgba(0,200,100,0.08)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = selectedCountry?.name === country.name ? 'rgba(0,200,100,0.08)' : 'transparent'}>
                        <span style={{ fontSize: 20 }}>{country.flag}</span>
                        <span style={{ flex: 1, fontSize: 14, color: 'var(--text)' }}>{country.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 6 }}>{country.dialCode}</span>
                        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, fontWeight: 600, background: 'var(--surface)', color: 'var(--green)', border: '1px solid var(--border)' }}>{country.currency}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedCountry && (
              <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(0,200,100,0.07)', border: '1px solid rgba(0,200,100,0.25)', display: 'flex', gap: 0 }}>
                {[{ label: 'DIAL CODE', value: selectedCountry.dialCode }, { label: 'CURRENCY', value: selectedCountry.currency }, { label: 'SYMBOL', value: selectedCountry.symbol }].map((item, i, arr) => (
                  <React.Fragment key={item.label}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--green)', fontFamily: 'Space Mono, monospace' }}>{item.value}</div>
                    </div>
                    {i < arr.length - 1 && <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />}
                  </React.Fragment>
                ))}
              </div>
            )}
            <button type="submit" className="btn-primary">Next →</button>
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <div className="auth-heading">
            <h1>Set Your PIN 🔐</h1>
            <p>Step 3 of 3 — Create a 4-digit transaction PIN</p>
          </div>
          <form className="auth-form" onSubmit={handleStep3}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="input-group">
              <label>Create PIN</label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {pin.map((digit, i) => (
                  <input key={i} ref={el => pinInputs.current[i] = el}
                    type="password" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    style={pinBoxStyle(digit)} />
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Confirm PIN</label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {confirmPin.map((digit, i) => (
                  <input key={i} ref={el => confirmInputs.current[i] = el}
                    type="password" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value, true)}
                    onKeyDown={(e) => handlePinKeyDown(i, e, true)}
                    style={pinBoxStyle(digit)} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              🔒 Your PIN is used to authorize all transactions
            </p>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
          </form>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
