import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRedirectUrl } from '@/lib/routes';

interface PlatformConnection {
  platform: string;
  isConnected: boolean;
  username: string | null;
  accessToken: string | null;
  expiresAt: Date | null;
  needsReconnect: boolean;
}

interface UsePlatformOAuthReturn {
  twitchConnection: PlatformConnection | null;
  youtubeConnection: PlatformConnection | null;
  isLoading: boolean;
  connectTwitch: () => Promise<void>;
  connectYouTube: () => Promise<void>;
  disconnectPlatform: (platform: 'twitch' | 'youtube') => Promise<void>;
  refreshConnections: () => Promise<void>;
}

function makeConnection(platform: string, row: any): PlatformConnection {
  const expiresAt = row.token_expires_at ? new Date(row.token_expires_at) : null;
  const needsReconnect = expiresAt ? expiresAt < new Date() : false;
  return {
    platform,
    isConnected: true,
    username: row.platform_username,
    accessToken: row.access_token,
    expiresAt,
    needsReconnect,
  };
}

export const usePlatformOAuth = (): UsePlatformOAuthReturn => {
  const { toast } = useToast();
  const [twitchConnection, setTwitchConnection] = useState<PlatformConnection | null>(null);
  const [youtubeConnection, setYoutubeConnection] = useState<PlatformConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Persist provider tokens into social_connections after OAuth sign-in
  const persistProviderTokens = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const provider = session.user.app_metadata?.provider;
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;

      if (!providerToken || !provider) return;

      let platform: string;
      if (provider === 'twitch') platform = 'twitch';
      else if (provider === 'google') platform = 'youtube';
      else return;

      const identity = session.user.identities?.find(i => i.provider === provider);
      const platformUsername = identity?.identity_data?.name || 
                               identity?.identity_data?.preferred_username ||
                               identity?.identity_data?.full_name ||
                               session.user.email;
      const platformUserId = identity?.identity_data?.provider_id || identity?.id;

      // Upsert into social_connections
      const { error } = await supabase
        .from('social_connections')
        .upsert({
          user_id: session.user.id,
          platform,
          access_token: providerToken,
          refresh_token: providerRefreshToken || null,
          platform_username: platformUsername,
          platform_user_id: platformUserId || null,
          is_active: true,
          token_expires_at: session.expires_at 
            ? new Date(session.expires_at * 1000).toISOString() 
            : null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform',
          ignoreDuplicates: false,
        });

      if (error) {
        // If upsert on conflict fails (no unique constraint), try insert/update manually
        console.warn('Upsert failed, trying manual approach:', error.message);
        
        const { data: existing } = await supabase
          .from('social_connections')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('platform', platform)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('social_connections')
            .update({
              access_token: providerToken,
              refresh_token: providerRefreshToken || null,
              platform_username: platformUsername,
              platform_user_id: platformUserId || null,
              is_active: true,
              token_expires_at: session.expires_at
                ? new Date(session.expires_at * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('social_connections')
            .insert({
              user_id: session.user.id,
              platform,
              access_token: providerToken,
              refresh_token: providerRefreshToken || null,
              platform_username: platformUsername,
              platform_user_id: platformUserId || null,
              is_active: true,
              token_expires_at: session.expires_at
                ? new Date(session.expires_at * 1000).toISOString()
                : null,
            });
        }
      }
    } catch (err) {
      console.error('Error persisting provider tokens:', err);
    }
  }, []);

  const refreshConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connections, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const twitch = connections?.find(c => c.platform === 'twitch');
      const youtube = connections?.find(c => c.platform === 'youtube');

      setTwitchConnection(twitch ? makeConnection('twitch', twitch) : null);
      setYoutubeConnection(youtube ? makeConnection('youtube', youtube) : null);
    } catch (error) {
      console.error('Error refreshing connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectTwitch = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
          redirectTo: getRedirectUrl('/studio'),
          scopes: 'user:read:email channel:read:stream_key analytics:read:extensions analytics:read:games channel:read:subscriptions',
        },
      });
      if (error) throw error;
      toast({ title: "Redirecting to Twitch", description: "Please authorize Hyvo.ai to access your Twitch account" });
    } catch (error) {
      console.error('Twitch OAuth error:', error);
      toast({ title: "Connection Failed", description: "Could not connect to Twitch. Please try again.", variant: "destructive" });
    }
  }, [toast]);

  const connectYouTube = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/studio'),
          scopes: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      toast({ title: "Redirecting to Google", description: "Please authorize Hyvo.ai to access your YouTube account" });
    } catch (error) {
      console.error('YouTube OAuth error:', error);
      toast({ title: "Connection Failed", description: "Could not connect to YouTube. Please try again.", variant: "destructive" });
    }
  }, [toast]);

  const disconnectPlatform = useCallback(async (platform: 'twitch' | 'youtube') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('social_connections')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      if (platform === 'twitch') setTwitchConnection(null);
      else setYoutubeConnection(null);

      toast({
        title: "Disconnected",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected`,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({ title: "Error", description: "Could not disconnect account", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // On mount: persist tokens if returning from OAuth, then refresh
  useEffect(() => {
    persistProviderTokens().then(() => refreshConnections());
  }, [persistProviderTokens, refreshConnections]);

  return { twitchConnection, youtubeConnection, isLoading, connectTwitch, connectYouTube, disconnectPlatform, refreshConnections };
};
