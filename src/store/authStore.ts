import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from existing session
  supabase.auth.getSession().then(({ data }) => {
    set({
      user: data.session?.user ?? null,
      session: data.session ?? null,
      loading: false,
    });
  });

  // Single global listener — subscription intentionally kept alive for app lifetime
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    set({
      user: session?.user ?? null,
      session: session ?? null,
      loading: false,
    });
  });
  void subscription; // held in module scope; never unsubscribed intentionally

  return { user: null, session: null, loading: true };
});
