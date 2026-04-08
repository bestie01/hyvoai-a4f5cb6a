import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TwitchMessage {
  id: string;
  platform: 'twitch';
  username: string;
  displayName: string;
  message: string;
  timestamp: string;
  badges: string[];
  color?: string;
  isSubscriber: boolean;
  isModerator: boolean;
}

interface UseTwitchIRCReturn {
  messages: TwitchMessage[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  channelName: string | null;
  connect: (channel: string, accessToken?: string) => void;
  disconnect: () => void;
  clearMessages: () => void;
  sendMessage: (message: string, broadcasterId: string, senderId: string) => Promise<boolean>;
}

export const useTwitchIRC = (): UseTwitchIRCReturn => {
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const channelRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const seenIdsRef = useRef(new Set<string>());
  const maxReconnectAttempts = 10;

  const parseIRCMessage = useCallback((raw: string): TwitchMessage | null => {
    try {
      const tagMatch = raw.match(/^@([^ ]+) /);
      const userMatch = raw.match(/:([^!]+)!/);
      const msgMatch = raw.match(/PRIVMSG #[^ ]+ :(.+)$/);
      
      if (!userMatch || !msgMatch) return null;

      const tags: Record<string, string> = {};
      if (tagMatch) {
        tagMatch[1].split(';').forEach(tag => {
          const [key, value] = tag.split('=');
          tags[key] = value || '';
        });
      }

      const badges = tags['badges']?.split(',').filter(Boolean) || [];
      const id = tags['id'] || `twitch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Deduplication
      if (seenIdsRef.current.has(id)) return null;
      seenIdsRef.current.add(id);
      if (seenIdsRef.current.size > 500) {
        const arr = Array.from(seenIdsRef.current);
        seenIdsRef.current = new Set(arr.slice(-300));
      }

      return {
        id,
        platform: 'twitch',
        username: userMatch[1],
        displayName: tags['display-name'] || userMatch[1],
        message: msgMatch[1],
        timestamp: new Date().toISOString(),
        badges,
        color: tags['color'] || undefined,
        isSubscriber: badges.some(b => b.startsWith('subscriber')),
        isModerator: badges.some(b => b.startsWith('moderator')) || tags['mod'] === '1',
      };
    } catch (e) {
      console.error('[TwitchIRC] Failed to parse message:', e);
      return null;
    }
  }, []);

  const connect = useCallback((channel: string, accessToken?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    setError(null);
    const ch = channel.toLowerCase().replace('#', '');
    channelRef.current = ch;
    setChannelName(ch);

    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    wsRef.current = ws;

    ws.onopen = () => {
      if (accessToken) {
        ws.send(`PASS oauth:${accessToken}`);
        ws.send(`NICK ${ch}`);
      } else {
        ws.send('PASS SCHMOOPIIE');
        ws.send(`NICK justinfan${Math.floor(Math.random() * 100000)}`);
      }
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
      ws.send(`JOIN #${ch}`);
    };

    ws.onmessage = (event) => {
      const lines = event.data.split('\r\n');
      for (const line of lines) {
        if (!line) continue;
        if (line.startsWith('PING')) { ws.send('PONG :tmi.twitch.tv'); continue; }
        if (line.includes('366') || line.includes('End of /NAMES list')) {
          setIsConnected(true);
          setIsConnecting(false);
          reconnectAttemptsRef.current = 0;
          continue;
        }
        if (line.includes('PRIVMSG')) {
          const parsed = parseIRCMessage(line);
          if (parsed) {
            setMessages(prev => [...prev, parsed].slice(-200));
          }
        }
      }
    };

    ws.onerror = () => { setError('Connection error'); setIsConnecting(false); };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      if (channelRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(channelRef.current!, accessToken);
        }, delay);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setError('Max reconnection attempts reached.');
      }
    };
  }, [parseIRCMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
    channelRef.current = null;
    setChannelName(null);
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const clearMessages = useCallback(() => { setMessages([]); seenIdsRef.current.clear(); }, []);

  const sendMessage = useCallback(async (message: string, broadcasterId: string, senderId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('twitch-chat-send', {
        body: { broadcaster_id: broadcasterId, sender_id: senderId, message },
      });
      if (error) { console.error('[TwitchIRC] Send error:', error); return false; }
      return data?.success === true;
    } catch (e) {
      console.error('[TwitchIRC] Send error:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { messages, isConnected, isConnecting, error, channelName, connect, disconnect, clearMessages, sendMessage };
};
