import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HYVO_DEFAULT_SETTINGS, HyvoSettings } from "@/lib/hyvo/types";

const LOCAL_KEY = "hyvo.agent.settings";

function readLocal(): HyvoSettings {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...HYVO_DEFAULT_SETTINGS, ...JSON.parse(raw) } : HYVO_DEFAULT_SETTINGS;
  } catch {
    return HYVO_DEFAULT_SETTINGS;
  }
}

/**
 * Hyvo agent preferences. Persists to the database for the signed-in user and
 * mirrors to localStorage so the dock boots instantly with the right state.
 */
export function useHyvoSettings() {
  const [settings, setSettings] = useState<HyvoSettings>(() =>
    typeof window === "undefined" ? HYVO_DEFAULT_SETTINGS : readLocal(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) setLoading(false); return; }
      const { data } = await supabase
        .from("hyvo_agent_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        const next = { ...HYVO_DEFAULT_SETTINGS, ...(data as Partial<HyvoSettings>) };
        setSettings(next);
        try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const update = useCallback(async (patch: Partial<HyvoSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("hyvo_agent_settings")
      .upsert({ user_id: user.id, ...settings, ...patch }, { onConflict: "user_id" });
  }, [settings]);

  return { settings, update, loading };
}
