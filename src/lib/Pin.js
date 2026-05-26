import { supabase } from './supabase';

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 30;

export async function verifyPin(userId, enteredPin) {
  // Always fetch fresh profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('transaction_pin, pin_attempts, pin_locked_until')
    .eq('id', userId)
    .single();

  if (!profile) return { success: false, message: 'User not found.' };

  // Check if locked
  if (profile.pin_locked_until) {
    const lockedUntil = new Date(profile.pin_locked_until);
    const now = new Date();
    if (now < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - now) / 60000);
      return { success: false, locked: true, message: `PIN locked. Try again in ${remaining} minute${remaining > 1 ? 's' : ''}.` };
    }
    await supabase.from('profiles').update({ pin_attempts: 0, pin_locked_until: null }).eq('id', userId);
  }

  if (!profile.transaction_pin) {
    return { success: false, message: 'No PIN set. Please set a PIN in Settings.' };
  }

  const isCorrect = btoa(enteredPin) === profile.transaction_pin;

  if (isCorrect) {
    await supabase.from('profiles').update({ pin_attempts: 0 }).eq('id', userId);
    return { success: true };
  } else {
    const attempts = (profile.pin_attempts || 0) + 1;
    const updateData = { pin_attempts: attempts };

    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      updateData.pin_locked_until = lockUntil.toISOString();
      await supabase.from('profiles').update(updateData).eq('id', userId);
      return { success: false, locked: true, message: `Incorrect PIN. Account locked for ${LOCK_MINUTES} minutes.` };
    }

    await supabase.from('profiles').update(updateData).eq('id', userId);
    const remaining = MAX_ATTEMPTS - attempts;
    return { success: false, message: `Incorrect PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` };
  }
}
