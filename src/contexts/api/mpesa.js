// api/mpesa.js - Vercel Serverless Function for M-Pesa STK Push

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORT_CODE = '174379';
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const BASE_URL = 'https://sandbox.safaricom.co.ke';

// Get OAuth token
async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await response.json();
  return data.access_token;
}

// Generate password
function generatePassword(timestamp) {
  const str = `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`;
  return Buffer.from(str).toString('base64');
}

// Format phone number to 254XXXXXXXXX
function formatPhone(phone) {
  phone = phone.replace(/\s/g, '');
  if (phone.startsWith('0')) return '254' + phone.slice(1);
  if (phone.startsWith('+254')) return phone.slice(1);
  if (phone.startsWith('254')) return phone;
  return '254' + phone;
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount, userId } = req.body;

  if (!phone || !amount || !userId) {
    return res.status(400).json({ error: 'Missing phone, amount or userId' });
  }

  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = generatePassword(timestamp);
    const formattedPhone = formatPhone(phone);
    const callbackUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://pesayetu-ohy3.vercel.app'}/api/callback`;

    const stkPayload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `PesaYetu-${userId.slice(0, 8)}`,
      TransactionDesc: 'PesaYetu Deposit',
    };

    const stkResponse = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkResponse.json();

    if (stkData.ResponseCode === '0') {
      return res.status(200).json({
        success: true,
        checkoutRequestId: stkData.CheckoutRequestID,
        message: 'STK Push sent! Check your phone.',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: stkData.errorMessage || 'STK Push failed',
      });
    }
  } catch (error) {
    console.error('M-Pesa error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}