import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  platform: 'twitch' | 'youtube';
  username: string;
  displayName: string;
  message: string;
  timestamp: string;
  badges?: string[];
  color?: string;
  isSubscriber?: boolean;
  isModerator?: boolean;
}

interface UseLiveChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  liveChatId: string | null;
  connectChat: (platforms: ('twitch' | 'youtube')[]) => Promise<void>;
  disconnectChat: () => void;
  clearMessages: () => void;
}

export const useLiveChat = (): UseLiveChatReturn => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveChatId, setLiveChatId] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const youtubeLiveChatIdRef = useRef<string | null>(null);
  const youtubePageTokenRef = useRef<string | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  const fetchYouTubeChat = useCallback(async () => {
    try {
      if (!youtubeLiveChatIdRef.current) {
        const { data: chatIdData, error: chatIdError } = await supabase.functions.invoke('live-chat', {
          body: { action: 'get_live_chat_id', platform: 'youtube' },
        });

        if (chatIdError) {
          console.error('Error getting YouTube live chat ID:', chatIdError);
          return;
        }

        if (chatIdData?.liveChatId) {
          youtubeLiveChatIdRef.current = chatIdData.liveChatId;
          setLiveChatId(chatIdData.liveChatId);
          console.log('[useLiveChat] Got YouTube live chat ID:', chatIdData.liveChatId);
        } else {
          console.log('[useLiveChat] No active YouTube broadcast');
          return;
        }
      }

      const { data, error: fetchError } = await supabase.functions.invoke('live-chat', {
        body: { 
          action: 'get_messages',
          platform: 'youtube',
          liveChatId: youtubeLiveChatIdRef.current,
          pageToken: youtubePageTokenRef.current,
        },
      });

      if (fetchError) {
        console.error('Error fetching YouTube chat:', fetchError);
        return;
      }

      if (data?.messages?.length > 0) {
        const newMessages = data.messages.filter(
          (msg: ChatMessage) => !seenMessageIdsRef.current.has(msg.id)
        );

        if (newMessages.length > 0) {
          newMessages.forEach((msg: ChatMessage) => seenMessageIdsRef.current.add(msg.id));
          setMessages(prev => [...prev, ...newMessages].slice(-100));
        }
      }

      if (data?.nextPageToken) {
        youtubePageTokenRef.current = data.nextPageToken;
      }
    } catch (err) {
      console.error('YouTube chat error:', err);
    }
  }, []);

  const fetchTwitchChat = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('live-chat', {
        body: { action: 'get_messages', platform: 'twitch' },
      });

      if (fetchError) {
        console.error('Error fetching Twitch chat:', fetchError);
        return;
      }

      if (data?.channelInfo) {
        console.log('[useLiveChat] Twitch channel connected:', data.channelInfo.displayName);
      }
    } catch (err) {
      console.error('Twitch chat error:', err);
    }
  }, []);

  const connectChat = useCallback(async (platforms: ('twitch' | 'youtube')[]) => {
    setIsLoading(true);
    setError(null);

    try {
      youtubeLiveChatIdRef.current = null;
      youtubePageTokenRef.current = null;
      seenMessageIdsRef.current.clear();
      setLiveChatId(null);

      if (platforms.includes('youtube')) await fetchYouTubeChat();
      if (platforms.includes('twitch')) await fetchTwitchChat();

      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      pollingIntervalRef.current = setInterval(async () => {
        if (platforms.includes('youtube')) await fetchYouTubeChat();
        if (platforms.includes('twitch')) await fetchTwitchChat();
      }, 5000);

      setIsConnected(true);
      toast({ title: "Chat Connected", description: `Connected to ${platforms.join(' & ')} chat` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to chat';
      setError(errorMessage);
      toast({ title: "Chat Connection Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [fetchYouTubeChat, fetchTwitchChat, toast]);

  const disconnectChat = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    youtubeLiveChatIdRef.current = null;
    youtubePageTokenRef.current = null;
    setIsConnected(false);
    setLiveChatId(null);
    toast({ title: "Chat Disconnected", description: "Live chat has been disconnected" });
  }, [toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    seenMessageIdsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  return { messages, isConnected, isLoading, error, liveChatId, connectChat, disconnectChat, clearMessages };
};
