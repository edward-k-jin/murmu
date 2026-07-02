import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { isDemoMode, isSupabaseConfigured, requireSupabase, supabase } from '@/lib/supabase';

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  signInWithProvider: (provider: 'apple' | 'google') => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured && !isDemoMode);

  useEffect(() => {
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured || isDemoMode,
      loading,
      session,
      signInWithProvider: async (provider) => {
        if (isDemoMode) {
          setSession(createDemoSession(provider));
          return true;
        }
        const client = requireSupabase();
        const redirectTo = Linking.createURL('/');
        const { data, error } = await client.auth.signInWithOAuth({
          provider,
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) throw error;
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== 'success') return false;

        const callbackUrl = new URL(result.url.replace('#', '?'));
        const accessToken = callbackUrl.searchParams.get('access_token');
        const refreshToken = callbackUrl.searchParams.get('refresh_token');
        if (!accessToken || !refreshToken) throw new Error('AUTH_CALLBACK_INVALID');
        const { error: sessionError } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        return true;
      },
      signOut: async () => {
        if (isDemoMode) {
          setSession(null);
          return;
        }
        const { error } = await requireSupabase().auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function createDemoSession(provider: 'apple' | 'google'): Session {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 60 * 60,
    expires_at: now + 60 * 60,
    token_type: 'bearer',
    user: {
      id: DEMO_USER_ID,
      app_metadata: { provider, providers: [provider] },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: `demo-${provider}@murmu.local`,
      role: 'authenticated',
      updated_at: new Date().toISOString(),
      user_metadata: { name: '데모 사용자' },
    },
  } as Session;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
