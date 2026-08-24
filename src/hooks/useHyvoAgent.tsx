import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHyvoSettings } from "@/hooks/useHyvoSettings";
import { useHyvoVoice } from "@/hooks/useHyvoVoice";
import { executeHyvoAction, logHyvoEvent } from "@/lib/hyvo/actions";
import { HyvoIntent, HyvoStatus } from "@/lib/hyvo/types";

type Recognition = any;

function getRecognition(): Recognition | null {
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";
  return rec;
}

/**
 * The Hyvo voice loop: continuous listening with a wake word, push-to-talk
 * fallback, intent parsing through the `hyvo-agent` function, and action
 * dispatch. Everything it does is written to the activity log.
 */
export function useHyvoAgent() {
  const { settings, update, loading } = useHyvoSettings();
  const { speak, stop: stopVoice, speaking } = useHyvoVoice(settings.voice_id, settings.voice_enabled);

  const [status, setStatus] = useState<HyvoStatus>("off");
  const [transcript, setTranscript] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [note, setNote] = useState("");
  const [supported, setSupported] = useState(true);
  const [micActive, setMicActive] = useState(false);

  const recRef = useRef<Recognition | null>(null);
  const wantListeningRef = useRef(false);
  const pttRef = useRef(false);
  const busyRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { userIdRef.current = data.user?.id ?? null; });
  }, []);

  const ctx = useMemo(() => ({ userId: userIdRef.current ?? "", streamId: null as string | null }), []);

  /** Send a phrase to Hyvo, parse it into an action, execute, then speak back. */
  const handleUtterance = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setStatus("thinking");
    setTranscript(text);

    try {
      const { data, error } = await supabase.functions.invoke("hyvo-agent", {
        body: { mode: "command", transcript: text },
      });
      if (error) throw error;
      const intent = data as HyvoIntent;

      if (intent.action === "stop_talking") {
        stopVoice();
        setLastReply("Quiet.");
        setStatus("idle");
        return;
      }

      const userId = userIdRef.current;
      if (!userId) {
        setLastReply("Sign in first.");
        speak("Sign in first.");
        return;
      }

      if (intent.action === "answer" || intent.action === "unknown") {
        const { data: ans } = await supabase.functions.invoke("hyvo-agent", {
          body: { mode: "ask", question: text },
        });
        const spoken = (ans?.speak as string) || "Couldn't get that one.";
        setLastReply(spoken);
        if (ans?.detail) setNote(String(ans.detail));
        speak(spoken);
        await logHyvoEvent({ userId, streamId: null }, {
          kind: "answer", summary: text, detail: { reply: spoken }, spoken: true,
        });
        return;
      }

      const result = await executeHyvoAction(intent, { userId, streamId: null });
      setLastReply(result.speak);
      speak(result.speak);
      await logHyvoEvent({ userId, streamId: null }, {
        kind: result.kind, summary: result.summary, detail: { ...result.detail, ok: result.ok }, spoken: true,
      });
    } catch (err) {
      console.error("[hyvo-agent]", err);
      setLastReply("Hyvo hit an error.");
    } finally {
      busyRef.current = false;
      setStatus(wantListeningRef.current ? "listening" : "idle");
    }
  }, [speak, stopVoice]);

  /** Wake-word / push-to-talk gate over raw recognition results. */
  const onResult = useCallback((event: any) => {
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) finalText += res[0].transcript;
      else setTranscript(res[0].transcript);
    }
    if (!finalText.trim()) return;

    const lower = finalText.toLowerCase();
    const wake = (settings.wake_word || "hyvo").toLowerCase();

    if (pttRef.current) {
      void handleUtterance(finalText);
      return;
    }
    if (!settings.wake_word_enabled) return;
    const idx = lower.indexOf(wake);
    if (idx === -1) return;
    const command = finalText.slice(idx + wake.length).replace(/^[\s,.:!?-]+/, "");
    if (command.trim().length > 1) void handleUtterance(command);
  }, [handleUtterance, settings.wake_word, settings.wake_word_enabled]);

  const startListening = useCallback(() => {
    if (recRef.current) return;
    const rec = getRecognition();
    if (!rec) { setSupported(false); return; }
    rec.onresult = onResult;
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed") { setMicActive(false); wantListeningRef.current = false; setStatus("off"); }
    };
    rec.onend = () => {
      recRef.current = null;
      if (wantListeningRef.current) setTimeout(() => startListening(), 400);
      else setStatus("off");
    };
    try {
      rec.start();
      recRef.current = rec;
      setMicActive(true);
      setStatus(busyRef.current ? "thinking" : "listening");
    } catch {
      recRef.current = null;
    }
  }, [onResult]);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    const rec = recRef.current;
    recRef.current = null;
    try { rec?.stop(); } catch { /* ignore */ }
    setMicActive(false);
    setStatus("off");
  }, []);

  const toggleListening = useCallback(() => {
    if (wantListeningRef.current) { stopListening(); return; }
    wantListeningRef.current = true;
    startListening();
  }, [startListening, stopListening]);

  // Push-to-talk: hold the configured key (with Ctrl+Shift) to talk regardless of wake word.
  useEffect(() => {
    const key = (settings.push_to_talk_key || "v").toLowerCase();
    const isEditable = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (isEditable(e.target) || e.repeat) return;
      if (e.key.toLowerCase() !== key || !e.ctrlKey || !e.shiftKey) return;
      e.preventDefault();
      pttRef.current = true;
      if (!wantListeningRef.current) { wantListeningRef.current = true; startListening(); }
      setStatus("listening");
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key) return;
      pttRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [settings.push_to_talk_key, startListening]);

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* ignore */ } }, []);

  useEffect(() => {
    if (speaking) setStatus("speaking");
    else if (wantListeningRef.current) setStatus(busyRef.current ? "thinking" : "listening");
  }, [speaking]);

  return {
    settings, update, settingsLoading: loading,
    status, transcript, lastReply, note, setNote,
    supported, micActive,
    toggleListening, stopListening,
    ask: handleUtterance,
    speak, stopVoice,
  };
}
