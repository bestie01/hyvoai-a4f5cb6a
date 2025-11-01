import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface YouTubeStreamData {
  streamKey: string;
  title: string;
  description: string;
  privacy: 'public' | 'unlisted' | 'private';
}

interface UseYouTubeStreamReturn {
  isConnected: boolean;
  isStreaming: boolean;
  viewers: number;
  streamData: YouTubeStreamData | null;
  connectToYouTube: (streamKey: string, title?: string, description?: string, privacy?: 'public' | 'unlisted' | 'private') => Promise<boolean>;
  startStream: () => Promise<boolean>;
  stopStream: () => Promise<boolean>;
  updateStreamInfo: (title: string, description: string, privacy: 'public' | 'unlisted' | 'private') => Promise<boolean>;
  disconnect: () => void;
}

export const useYouTubeStream = (): UseYouTubeStreamReturn => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [streamData, setStreamData] = useState<YouTubeStreamData | null>(null);

  const connectToYouTube = useCallback(async (
    streamKey: string, 
    title = "Live Stream from Hyvo.ai", 
    description = "Streaming live with Hyvo.ai Studio",
    privacy: 'public' | 'unlisted' | 'private' = 'public'
  ): Promise<boolean> => {
    try {
      // Validate stream key format (YouTube stream keys are typically 20+ characters)
      if (!streamKey || streamKey.length < 10) {
        toast({
          title: "Invalid Stream Key",
          description: "Please provide a valid YouTube stream key",
          variant: "destructive",
        });
        return false;
      }

      // Call our edge function to validate and setup YouTube connection
      const { data, error } = await supabase.functions.invoke('youtube-stream', {
        body: { 
          action: 'connect',
          streamKey: streamKey,
          title: title,
          description: description,
          privacy: privacy
        }
      });

      if (error) {
        console.error('YouTube connection error:', error);
        toast({
          title: "Connection Failed",
          description: "Could not connect to YouTube. Please check your stream key.",
          variant: "destructive",
        });
        return false;
      }

      setStreamData({
        streamKey: streamKey,
        title: title,
        description: description,
        privacy: privacy
      });
      setIsConnected(true);
      
      toast({
        title: "Connected to YouTube",
        description: `Ready to stream: ${title}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to YouTube:', error);
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while connecting to YouTube",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const startStream = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !streamData) {
      toast({
        title: "Not Connected",
        description: "Please connect to YouTube first",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call edge function to start streaming
      const { data, error } = await supabase.functions.invoke('youtube-stream', {
        body: { 
          action: 'start',
          streamKey: streamData.streamKey,
          title: streamData.title,
          description: streamData.description,
          privacy: streamData.privacy
        }
      });

      if (error) {
        console.error('Stream start error:', error);
        toast({
          title: "Stream Start Failed",
          description: "Could not start streaming to YouTube",
          variant: "destructive",
        });
        return false;
      }

      setIsStreaming(true);
      
      // Start simulating viewer count updates
      const viewerInterval = setInterval(() => {
        setViewers(prev => {
          const change = Math.floor(Math.random() * 8) - 3; // -3 to +4
          return Math.max(0, prev + change);
        });
      }, 8000);

      // Store interval ID for cleanup
      (window as any).youtubeViewerInterval = viewerInterval;
      
      toast({
        title: "Stream Started",
        description: "You're now live on YouTube!",
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
      const { data, error } = await supabase.functions.invoke('youtube-stream', {
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
      if ((window as any).youtubeViewerInterval) {
        clearInterval((window as any).youtubeViewerInterval);
        (window as any).youtubeViewerInterval = null;
      }
      
      toast({
        title: "Stream Stopped",
        description: "Your YouTube stream has ended successfully",
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

  const updateStreamInfo = useCallback(async (title: string, description: string, privacy: 'public' | 'unlisted' | 'private'): Promise<boolean> => {
    if (!isConnected || !streamData) return false;

    try {
      const { data, error } = await supabase.functions.invoke('youtube-stream', {
        body: { 
          action: 'update',
          title: title,
          description: description,
          privacy: privacy
        }
      });

      if (error) {
        console.error('Stream update error:', error);
        return false;
      }

      setStreamData(prev => prev ? { ...prev, title, description, privacy } : null);
      
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
    
    if ((window as any).youtubeViewerInterval) {
      clearInterval((window as any).youtubeViewerInterval);
      (window as any).youtubeViewerInterval = null;
    }
    
    toast({
      title: "Disconnected",
      description: "Disconnected from YouTube",
    });
  }, [isStreaming, stopStream, toast]);

  return {
    isConnected,
    isStreaming,
    viewers,
    streamData,
    connectToYouTube,
    startStream,
    stopStream,
    updateStreamInfo,
    disconnect,
  };
};