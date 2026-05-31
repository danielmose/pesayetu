import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); setSuspended(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time suspension: kicks user out immediately when admin suspends them
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('suspension_watch_' + user.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new.suspended) {
          setSuspended(true);
          supabase.auth.signOut();
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      // Block suspended users on session restore
      if (data.suspended) {
        setSuspended(true);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const metaPin = authData?.user?.user_metadata?.transaction_pin;

      if (!data.transaction_pin && metaPin) {
        await supabase
          .from('profiles')
          .update({ transaction_pin: metaPin })
          .eq('id', userId);
        data.transaction_pin = metaPin;
      }

      setProfile(data);
      setSuspended(false);
    }

    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const register = async ({ fullName, phone, email, password, selectedCountry, pinStr }) => {
    const { error: regError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          country: selectedCountry.name,
          dial_code: selectedCountry.dialCode,
          currency: selectedCountry.currency,
          currency_symbol: selectedCountry.symbol,
          transaction_pin: btoa(pinStr),
        }
      }
    });
    return { error: regError, data };
  };

  const login = async ({ email, password }) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    // Check suspension immediately after login
    const { data: profileData } = await supabase
      .from('profiles')
      .select('suspended')
      .eq('id', data.user.id)
      .single();

    if (profileData?.suspended) {
      await supabase.auth.signOut();
      setSuspended(true);
      return { error: { message: 'Your account has been suspended. Please contact support.' } };
    }

    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, suspended, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
