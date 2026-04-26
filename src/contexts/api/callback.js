// api/callback.js - M-Pesa Payment Callback Handler

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Need service key for server-side
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const items = CallbackMetadata.Item;
      const amount = items.find(i => i.Name === 'Amount')?.Value;
      const phone = items.find(i => i.Name === 'PhoneNumber')?.Value?.toString();
      const mpesaCode = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

      // Format phone back to 07XXXXXXXX
      const formattedPhone = '0' + phone?.slice(3);

      // Find user by phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', formattedPhone)
        .single();

      if (profile) {
        // Update balance
        await supabase.rpc('deposit_money', {
          p_user_id: profile.id,
          p_amount: amount,
        });

        console.log(`Deposited KES ${amount} for ${formattedPhone} - ${mpesaCode}`);
      }
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}