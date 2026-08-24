import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/constants";

/**
 * Streaming ElevenLabs speech queue for the Hyvo co-pilot.
 * Speech is queued so overlapping events never talk over each other,
 * and `stop()` kills playback instantly ("Hyvo, shut up").
 */
export function useHyvoVoice(voiceId: string, enabled: boolean) {
  const [speaking, setSpeaking] = useState(false);
  const queueRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runningRef = useRef(false);
  const urlRef = useRef<string | null>(null);

  const cleanupUrl = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  const playOne = useCallback(async (text: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ text, voiceId, quality: "live" }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    cleanupUrl();
    const url = URL.createObjectURL(blob);
    urlRef.current = url;

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = url;
    await audio.play();
    await new Promise<void>((resolve) => {
      const done = () => {
        audio.removeEventListener("ended", done);
        audio.removeEventListener("error", done);
        resolve();
      };
      audio.addEventListener("ended", done);
      audio.addEventListener("error", done);
    });
  }, [voiceId]);

  const drain = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setSpeaking(true);
    while (queueRef.current.length) {
      const next = queueRef.current.shift()!;
      try {
        await playOne(next);
      } catch (err) {
        console.error("[hyvo-voice]", err);
      }
    }
    runningRef.current = false;
    setSpeaking(false);
  }, [playOne]);

  const speak = useCallback((text: string) => {
    const clean = (text ?? "").trim();
    if (!enabled || !clean) return;
    queueRef.current.push(clean.slice(0, 600));
    void drain();
  }, [enabled, drain]);

  const stop = useCallback(() => {
    queueRef.current = [];
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    runningRef.current = false;
    setSpeaking(false);
  }, []);

  useEffect(() => () => {
    audioRef.current?.pause();
    cleanupUrl();
  }, []);

  return { speak, stop, speaking };
}
