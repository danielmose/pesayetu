// src/lib/currencies.js

// All world currencies
export const CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  RWF: { name: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼' },
  ETB: { name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  MAD: { name: 'Moroccan Dirham', symbol: 'MAD', flag: '🇲🇦' },
  XOF: { name: 'West African CFA', symbol: 'CFA', flag: '🌍' },
  XAF: { name: 'Central African CFA', symbol: 'CFA', flag: '🌍' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  MXN: { name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  ARS: { name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  CLP: { name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  COP: { name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  PHP: { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  ZMW: { name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  MWK: { name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼' },
  MZN: { name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
  AOA: { name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴' },
  CDF: { name: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩' },
  TND: { name: 'Tunisian Dinar', symbol: 'DT', flag: '🇹🇳' },
  LYD: { name: 'Libyan Dinar', symbol: 'LD', flag: '🇱🇾' },
  SDG: { name: 'Sudanese Pound', symbol: 'SDG', flag: '🇸🇩' },
  SOS: { name: 'Somali Shilling', symbol: 'Sh', flag: '🇸🇴' },
  DJF: { name: 'Djiboutian Franc', symbol: 'Fdj', flag: '🇩🇯' },
  ERN: { name: 'Eritrean Nakfa', symbol: 'Nfk', flag: '🇪🇷' },
  BIF: { name: 'Burundian Franc', symbol: 'Fr', flag: '🇧🇮' },
  KMF: { name: 'Comorian Franc', symbol: 'Fr', flag: '🇰🇲' },
  MUR: { name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺' },
  SCR: { name: 'Seychellois Rupee', symbol: '₨', flag: '🇸🇨' },
  MGA: { name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬' },
  BWP: { name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼' },
  NAD: { name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦' },
  SZL: { name: 'Swazi Lilangeni', symbol: 'L', flag: '🇸🇿' },
  LSL: { name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸' },
};

// Fetch real-time exchange rates (base: USD)
export async function fetchExchangeRates() {
  try {
    const apiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      console.error('Missing VITE_EXCHANGE_RATE_API_KEY env variable');
      return null;
    }
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    );
    const data = await response.json();
    return data.conversion_rates;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
    return null;
  }
}

// Convert amount between currencies
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (fromCurrency === toCurrency) return amount;
  // Convert to USD first, then to target
  const inUSD = amount / rates[fromCurrency];
  return inUSD * rates[toCurrency];
}

// Format amount with currency symbol
export function formatAmount(amount, currency) {
  const curr = CURRENCIES[currency];
  if (!curr) return `${amount.toFixed(2)} ${currency}`;
  return `${curr.symbol} ${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Get currency display name
export function getCurrencyDisplay(code) {
  const curr = CURRENCIES[code];
  if (!curr) return code;
  return `${curr.flag} ${code} - ${curr.name}`;
}

// Popular currencies to show first
export const POPULAR_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS', 'NGN', 'ZAR', 'AED', 'GHS', 'RWF', 'ETB'];
