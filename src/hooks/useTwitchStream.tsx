import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TwitchStreamData {
  streamKey: string;
  title: string;
  category: string;
}

interface UseTwitchStreamReturn {
  isConnected: boolean;
  isStreaming: boolean;
  viewers: number;
  streamData: TwitchStreamData | null;
  connectToTwitch: (streamKey: string, title?: string, category?: string) => Promise<boolean>;
  startStream: () => Promise<boolean>;
  stopStream: () => Promise<boolean>;
  updateStreamInfo: (title: string, category: string) => Promise<boolean>;
  disconnect: () => void;
}

export const useTwitchStream = (): UseTwitchStreamReturn => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [streamData, setStreamData] = useState<TwitchStreamData | null>(null);

  const connectToTwitch = useCallback(async (
    streamKey: string, 
    title = "Live Stream from Hyvo.ai", 
    category = "Software and Game Development"
  ): Promise<boolean> => {
    try {
      // Validate stream key format (Twitch stream keys are typically 40+ characters)
      if (!streamKey || streamKey.length < 10) {
        toast({
          title: "Invalid Stream Key",
          description: "Please provide a valid Twitch stream key",
          variant: "destructive",
        });
        return false;
      }

      // Call our edge function to validate and setup Twitch connection
      const { data, error } = await supabase.functions.invoke('twitch-stream', {
        body: { 
          action: 'connect',
          streamKey: streamKey,
          title: title,
          category: category
        }
      });

      if (error) {
        console.error('Twitch connection error:', error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to Twitch. Please check your stream key.",
          variant: "destructive",
        });
        return false;
      }

      setStreamData({
        streamKey: streamKey,
        title: title,
        category: category
      });
      setIsConnected(true);
      
      toast({
        title: "Connected to Twitch",
        description: `Ready to stream: ${title}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to Twitch:', error);
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while connecting to Twitch",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const startStream = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !streamData) {
      toast({
        title: "Not Connected",
        description: "Please connect to Twitch first",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call edge function to start streaming
      const { data, error } = await supabase.functions.invoke('twitch-stream', {
        body: { 
          action: 'start',
          streamKey: streamData.streamKey,
          title: streamData.title,
          category: streamData.category
        }
      });

      if (error) {
        console.error('Stream start error:', error);
        toast({
          title: "Stream Start Failed",
          description: "Could not start streaming to Twitch",
          variant: "destructive",
        });
        return false;
      }

      setIsStreaming(true);
      
      // Start simulating viewer count updates
      const viewerInterval = setInterval(() => {
        setViewers(prev => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return Math.max(0, prev + change);
        });
      }, 5000);

      // Store interval ID for cleanup
      (window as any).viewerInterval = viewerInterval;
      
      toast({
        title: "Stream Started",
        description: "You're now live on Twitch!",
      });
      
      return true;
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Stream Error",
        description: "An unexpected error occurred while starting the stream",
        variant: "destructive",
      });
      return false;
    }
  }, [isConnected, streamData, toast]);

  const stopStream = useCallback(async (): Promise<boolean> => {
    if (!isStreaming) return true;

    try {
      // Call edge function to stop streaming
      const { data, error } = await supabase.functions.invoke('twitch-stream', {
        body: { 
          action: 'stop',
          streamKey: streamData?.streamKey
        }
      });

      if (error) {
        console.error('Stream stop error:', error);
        toast({
          title: "Stream Stop Failed",
          description: "Could not stop streaming properly",
          variant: "destructive",
        });
      }

      setIsStreaming(false);
      setViewers(0);
      
      // Clear viewer interval
      if ((window as any).viewerInterval) {
        clearInterval((window as any).viewerInterval);
        (window as any).viewerInterval = null;
      }
      
      toast({
        title: "Stream Stopped",
        description: "Your stream has ended successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast({
        title: "Stream Error",
        description: "An error occurred while stopping the stream",
        variant: "destructive",
      });
      return false;
    }
  }, [isStreaming, streamData?.streamKey, toast]);

  const updateStreamInfo = useCallback(async (title: string, category: string): Promise<boolean> => {
    if (!isConnected || !streamData) return false;

    try {
      const { data, error} = await supabase.functions.invoke('twitch-stream', {
        body: { 
          action: 'update',
          title: title,
          category: category
        }
      });

      if (error) {
        console.error('Stream update error:', error);
        return false;
      }

      setStreamData(prev => prev ? { ...prev, title, category } : null);
      
      toast({
        title: "Stream Updated",
        description: `Title: ${title}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating stream:', error);
      return false;
    }
  }, [isConnected, streamData, toast]);

  const disconnect = useCallback(() => {
    if (isStreaming) {
      stopStream();
    }
    
    setIsConnected(false);
    setStreamData(null);
    setViewers(0);
    
    if ((window as any).viewerInterval) {
      clearInterval((window as any).viewerInterval);
      (window as any).viewerInterval = null;
    }
    
    toast({
      title: "Disconnected",
      description: "Disconnected from Twitch",
    });
  }, [isStreaming, stopStream, toast]);

  return {
    isConnected,
    isStreaming,
    viewers,
    streamData,
    connectToTwitch,
    startStream,
    stopStream,
    updateStreamInfo,
    disconnect,
  };
};