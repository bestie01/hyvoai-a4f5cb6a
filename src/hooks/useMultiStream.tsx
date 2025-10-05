import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlatformConfig {
  id: string;
  platform: string;
  streamKey: string;
  rtmpUrl: string;
  isEnabled: boolean;
  streamTitle?: string;
  streamDescription?: string;
}

export function useMultiStream() {
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_streaming_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConfigs(data.map(config => ({
        id: config.id,
        platform: config.platform,
        streamKey: config.stream_key,
        rtmpUrl: config.rtmp_url,
        isEnabled: config.is_enabled,
        streamTitle: config.stream_title || undefined,
        streamDescription: config.stream_description || undefined,
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch streaming configs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addConfig = useCallback(async (config: Omit<PlatformConfig, 'id' | 'isEnabled'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('platform_streaming_configs')
        .insert([{
          user_id: user.id,
          platform: config.platform,
          stream_key: config.streamKey,
          rtmp_url: config.rtmpUrl,
          stream_title: config.streamTitle,
          stream_description: config.streamDescription,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${config.platform} configuration added`,
      });

      await fetchConfigs();
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add streaming config",
        variant: "destructive",
      });
    }
  }, [fetchConfigs, toast]);

  const toggleConfig = useCallback(async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('multi-stream-relay', {
        body: { action: 'toggle', platformId: configId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Platform configuration updated",
      });

      await fetchConfigs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to toggle platform",
        variant: "destructive",
      });
    }
  }, [fetchConfigs, toast]);

  const startMultiStream = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('multi-stream-relay', {
        body: { action: 'start_multi_stream' },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Multi-stream relay started",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start multi-stream",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    configs,
    loading,
    fetchConfigs,
    addConfig,
    toggleConfig,
    startMultiStream,
  };
}