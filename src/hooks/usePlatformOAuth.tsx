import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformConnection {
  platform: string;
  isConnected: boolean;
  username: string | null;
  accessToken: string | null;
  expiresAt: Date | null;
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

export const usePlatformOAuth = (): UsePlatformOAuthReturn => {
  const { toast } = useToast();
  const [twitchConnection, setTwitchConnection] = useState<PlatformConnection | null>(null);
  const [youtubeConnection, setYoutubeConnection] = useState<PlatformConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      if (twitch) {
        setTwitchConnection({
          platform: 'twitch',
          isConnected: true,
          username: twitch.platform_username,
          accessToken: twitch.access_token,
          expiresAt: twitch.token_expires_at ? new Date(twitch.token_expires_at) : null,
        });
      } else {
        setTwitchConnection(null);
      }

      if (youtube) {
        setYoutubeConnection({
          platform: 'youtube',
          isConnected: true,
          username: youtube.platform_username,
          accessToken: youtube.access_token,
          expiresAt: youtube.token_expires_at ? new Date(youtube.token_expires_at) : null,
        });
      } else {
        setYoutubeConnection(null);
      }
    } catch (error) {
      console.error('Error refreshing connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectTwitch = useCallback(async () => {
    try {
      const redirectUrl = `${window.location.origin}/studio`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitch',
        options: {
          redirectTo: redirectUrl,
          scopes: 'user:read:email channel:read:stream_key analytics:read:extensions analytics:read:games channel:read:subscriptions',
        },
      });

      if (error) throw error;
      
      toast({
        title: "Redirecting to Twitch",
        description: "Please authorize Hyvo.ai to access your Twitch account",
      });
    } catch (error) {
      console.error('Twitch OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Twitch. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const connectYouTube = useCallback(async () => {
    try {
      const redirectUrl = `${window.location.origin}/studio`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Redirecting to Google",
        description: "Please authorize Hyvo.ai to access your YouTube account",
      });
    } catch (error) {
      console.error('YouTube OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to YouTube. Please try again.",
        variant: "destructive",
      });
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

      if (platform === 'twitch') {
        setTwitchConnection(null);
      } else {
        setYoutubeConnection(null);
      }

      toast({
        title: "Disconnected",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected`,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error",
        description: "Could not disconnect account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  return {
    twitchConnection,
    youtubeConnection,
    isLoading,
    connectTwitch,
    connectYouTube,
    disconnectPlatform,
    refreshConnections,
  };
};
