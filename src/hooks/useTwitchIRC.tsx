import { useState, useCallback, useRef, useEffect } from 'react';

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
  connect: (channel: string, accessToken?: string) => void;
  disconnect: () => void;
  clearMessages: () => void;
}

export const useTwitchIRC = (): UseTwitchIRCReturn => {
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const channelRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const parseIRCMessage = useCallback((raw: string): TwitchMessage | null => {
    try {
      // Parse PRIVMSG format: @tags :user!user@user.tmi.twitch.tv PRIVMSG #channel :message
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
      
      return {
        id: tags['id'] || `twitch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[TwitchIRC] Already connected');
      return;
    }

    setIsConnecting(true);
    setError(null);
    channelRef.current = channel.toLowerCase().replace('#', '');

    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[TwitchIRC] WebSocket connected');
      
      // Authenticate (anonymous or with token)
      if (accessToken) {
        ws.send(`PASS oauth:${accessToken}`);
        ws.send(`NICK ${channelRef.current}`);
      } else {
        // Anonymous connection
        ws.send('PASS SCHMOOPIIE');
        ws.send(`NICK justinfan${Math.floor(Math.random() * 100000)}`);
      }
      
      // Request capabilities for tags (badges, colors, etc.)
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
      
      // Join channel
      ws.send(`JOIN #${channelRef.current}`);
    };

    ws.onmessage = (event) => {
      const lines = event.data.split('\r\n');
      
      for (const line of lines) {
        if (!line) continue;
        
        // Respond to PING to keep connection alive
        if (line.startsWith('PING')) {
          ws.send('PONG :tmi.twitch.tv');
          continue;
        }
        
        // Check for successful join
        if (line.includes('366') || line.includes('End of /NAMES list')) {
          setIsConnected(true);
          setIsConnecting(false);
          reconnectAttemptsRef.current = 0; // Reset backoff on successful join
          console.log('[TwitchIRC] Joined channel:', channelRef.current);
          continue;
        }
        
        // Parse chat messages
        if (line.includes('PRIVMSG')) {
          const parsed = parseIRCMessage(line);
          if (parsed) {
            setMessages(prev => {
              const newMessages = [...prev, parsed];
              // Keep only last 200 messages
              return newMessages.slice(-200);
            });
          }
        }
      }
    };

    ws.onerror = (event) => {
      console.error('[TwitchIRC] WebSocket error:', event);
      setError('Connection error');
      setIsConnecting(false);
    };

    ws.onclose = () => {
      console.log('[TwitchIRC] WebSocket closed');
      setIsConnected(false);
      setIsConnecting(false);
      
      // Auto-reconnect with exponential backoff
      if (channelRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        console.log(`[TwitchIRC] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(channelRef.current!, accessToken);
        }, delay);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setError('Max reconnection attempts reached. Please reconnect manually.');
      }
    };
  }, [parseIRCMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    channelRef.current = null;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    messages,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    clearMessages,
  };
};
