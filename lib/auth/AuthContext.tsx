import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { TierKey } from '@/constants/config';

interface Profile {
  id: string;
  membership: string | null;
  display_name: string | null;
  user_type: string | null;
  is_owner: boolean;
  onboarding_completed: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  tier: TierKey;
  isLoading: boolean;
  isLoggedIn: boolean;
  isPro: boolean;
  isMember: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function computeTier(profile: Profile | null): TierKey {
  if (!profile) return 'free';
  if (profile.is_owner || profile.user_type === 'admin') return 'pro';
  const m = profile.membership;
  if (m === 'pro' || m === 'elite') return 'pro';
  if (m === 'garden' || m === 'standard' || m === 'member') return 'member';
  return 'free';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, membership, display_name, user_type, is_owner, onboarding_completed')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user?.id) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const tier = computeTier(profile);
  const isPro = tier === 'pro';
  const isMember = tier === 'member' || tier === 'pro';

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    tier,
    isLoading,
    isLoggedIn: !!session,
    isPro,
    isMember,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
