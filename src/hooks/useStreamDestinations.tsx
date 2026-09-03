import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StreamDestination {
  id: string;
  platform: string;
  rtmp_url: string;
  stream_key: string;
  is_enabled: boolean;
  stream_title: string | null;
}

/** CRUD for multistream destinations stored in `platform_streaming_configs`. */
export function useStreamDestinations() {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<StreamDestination[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setDestinations([]); return; }
      const { data, error } = await supabase
        .from("platform_streaming_configs")
        .select("id, platform, rtmp_url, stream_key, is_enabled, stream_title")
        .eq("user_id", user.id)
        .order("platform");
      if (error) throw error;
      setDestinations(
        (data ?? []).map((d) => ({ ...d, is_enabled: d.is_enabled ?? false })) as StreamDestination[],
      );
    } catch (err) {
      console.error("[destinations] load failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const save = useCallback(
    async (platform: string, rtmpUrl: string, streamKey: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return false; }
      const existing = destinations.find((d) => d.platform === platform);
      const payload = {
        user_id: user.id,
        platform,
        rtmp_url: rtmpUrl.trim(),
        stream_key: streamKey.trim(),
        is_enabled: true,
        updated_at: new Date().toISOString(),
      };
      const { error } = existing
        ? await supabase.from("platform_streaming_configs").update(payload).eq("id", existing.id)
        : await supabase.from("platform_streaming_configs").insert(payload);
      if (error) {
        toast({ title: "Could not save destination", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: `${platform} connected` });
      await refresh();
      return true;
    },
    [destinations, refresh, toast],
  );

  const toggle = useCallback(
    async (id: string, enabled: boolean) => {
      const { error } = await supabase
        .from("platform_streaming_configs")
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) { toast({ title: "Update failed", variant: "destructive" }); return; }
      setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, is_enabled: enabled } : d)));
    },
    [toast],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("platform_streaming_configs").delete().eq("id", id);
      if (error) { toast({ title: "Remove failed", variant: "destructive" }); return; }
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    },
    [toast],
  );

  /** Turn every configured destination into a live broadcast target. */
  const enableAll = useCallback(async () => {
    const targets = destinations.filter((d) => !d.is_enabled && d.stream_key);
    if (!targets.length) {
      toast({ title: "All destinations already live" });
      return;
    }
    const { error } = await supabase
      .from("platform_streaming_configs")
      .update({ is_enabled: true, updated_at: new Date().toISOString() })
      .in("id", targets.map((d) => d.id));
    if (error) {
      toast({ title: "Could not enable destinations", description: error.message, variant: "destructive" });
      return;
    }
    setDestinations((prev) => prev.map((d) => (d.stream_key ? { ...d, is_enabled: true } : d)));
    toast({ title: `${targets.length} destination${targets.length > 1 ? "s" : ""} enabled` });
  }, [destinations, toast]);

  return { destinations, loading, refresh, save, toggle, remove, enableAll };
}
