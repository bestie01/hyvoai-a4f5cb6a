import { useState, useCallback, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRedirectUrl, POST_AUTH_PATH } from '@/lib/routes';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithTwitch: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithDiscord: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: getRedirectUrl('/') }
    });
    if (error) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sign Up Successful", description: "Please check your email to confirm your account" });
    }
    return { error };
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "Successfully signed in" });
    }
    return { error };
  }, [toast]);

  const oauth = useCallback(async (
    provider: 'twitch' | 'google' | 'discord',
    label: string,
    queryParams?: Record<string, string>,
  ) => {
    const api = (window as any).electronAPI;
    const desktop = typeof api?.startOAuth === 'function';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getRedirectUrl(POST_AUTH_PATH), queryParams, skipBrowserRedirect: desktop },
    });
    if (!error && desktop && data?.url) await api.startOAuth(data.url);
    if (error) toast({ title: `${label} Sign In Failed`, description: error.message, variant: "destructive" });
    return { error };
  }, [toast]);

  const signInWithTwitch = useCallback(
    () => oauth('twitch', 'Twitch', { access_type: 'offline', prompt: 'consent' }), [oauth]);
  const signInWithGoogle = useCallback(() => oauth('google', 'Google'), [oauth]);
  const signInWithDiscord = useCallback(() => oauth('discord', 'Discord'), [oauth]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign Out Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed Out", description: "Successfully signed out" });
    }
  }, [toast]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl('/'),
    });
    if (error) {
      toast({ title: "Password Reset Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password Reset Sent", description: "Check your email for reset instructions" });
    }
    return { error };
  }, [toast]);

  return { user, session, loading, signUp, signIn, signInWithTwitch, signInWithGoogle, signInWithDiscord, signOut, resetPassword };
};
