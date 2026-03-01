import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Scene {
  id: number;
  name: string;
  active: boolean;
}

interface Source {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
}

interface AIToggles {
  autoHighlights: boolean;
  chatAnalysis: boolean;
  smartOverlays: boolean;
}

interface StudioConfig {
  scenes: Scene[];
  sources: Source[];
  aiToggles: AIToggles;
}

const DEFAULT_SCENES: Scene[] = [
  { id: 1, name: "Gaming Scene", active: true },
  { id: 2, name: "Just Chatting", active: false },
  { id: 3, name: "BRB Screen", active: false },
  { id: 4, name: "Starting Soon", active: false },
];

const DEFAULT_SOURCES: Source[] = [
  { id: 1, name: "Desktop Capture", type: "display", enabled: true },
  { id: 2, name: "Webcam", type: "camera", enabled: true },
  { id: 3, name: "Microphone", type: "audio", enabled: true },
  { id: 4, name: "Game Audio", type: "audio", enabled: true },
  { id: 5, name: "Chat Overlay", type: "overlay", enabled: false },
];

const DEFAULT_AI_TOGGLES: AIToggles = {
  autoHighlights: false,
  chatAnalysis: true,
  smartOverlays: false,
};

const STORAGE_KEY = 'hyvo-studio-config';

export const useStudioConfig = () => {
  const { user } = useAuth();
  const [scenes, setScenes] = useState<Scene[]>(DEFAULT_SCENES);
  const [sources, setSources] = useState<Source[]>(DEFAULT_SOURCES);
  const [aiToggles, setAiToggles] = useState<AIToggles>(DEFAULT_AI_TOGGLES);
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load config from localStorage (instant) then Supabase (authoritative)
  useEffect(() => {
    // Load from localStorage first for instant UI
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed: StudioConfig = JSON.parse(cached);
        setScenes(parsed.scenes || DEFAULT_SCENES);
        setSources(parsed.sources || DEFAULT_SOURCES);
        setAiToggles(parsed.aiToggles || DEFAULT_AI_TOGGLES);
      } catch {}
    }

    // Then load from Supabase if authenticated
    if (user) {
      loadFromSupabase();
    } else {
      setLoaded(true);
    }
  }, [user]);

  const loadFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('stream_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!error && data) {
        // Stream settings stores basic config; we use a JSON column approach
        // Since stream_settings doesn't have a studio_config column,
        // we persist via localStorage + scenes table
        const { data: scenesData } = await supabase
          .from('stream_scenes')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at');

        if (scenesData && scenesData.length > 0) {
          setScenes(scenesData.map((s, i) => ({
            id: i + 1,
            name: s.name,
            active: s.is_default || false,
          })));
        }
      }
    } catch (err) {
      console.error('[useStudioConfig] Failed to load from Supabase:', err);
    } finally {
      setLoaded(true);
    }
  };

  // Debounced save to localStorage + Supabase
  const persistConfig = useCallback((config: StudioConfig) => {
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Debounce Supabase save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!user) return;
      try {
        // Sync scenes to stream_scenes table
        for (const scene of config.scenes) {
          const { data: existing } = await supabase
            .from('stream_scenes')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', scene.name)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('stream_scenes')
              .update({ is_default: scene.active })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('stream_scenes')
              .insert([{
                user_id: user.id,
                name: scene.name,
                is_default: scene.active,
                config: JSON.parse(JSON.stringify({ sources: config.sources, aiToggles: config.aiToggles })),
              }]);
          }
        }
      } catch (err) {
        console.error('[useStudioConfig] Failed to save to Supabase:', err);
      }
    }, 2000);
  }, [user]);

  const updateScenes = useCallback((newScenes: Scene[]) => {
    setScenes(newScenes);
    persistConfig({ scenes: newScenes, sources, aiToggles });
  }, [sources, aiToggles, persistConfig]);

  const updateSources = useCallback((newSources: Source[]) => {
    setSources(newSources);
    persistConfig({ scenes, sources: newSources, aiToggles });
  }, [scenes, aiToggles, persistConfig]);

  const updateAIToggle = useCallback((key: keyof AIToggles, value: boolean) => {
    const newToggles = { ...aiToggles, [key]: value };
    setAiToggles(newToggles);
    persistConfig({ scenes, sources, aiToggles: newToggles });
  }, [scenes, sources, aiToggles, persistConfig]);

  return {
    scenes,
    sources,
    aiToggles,
    loaded,
    updateScenes,
    updateSources,
    updateAIToggle,
    setScenes: updateScenes,
    setSources: updateSources,
  };
};
