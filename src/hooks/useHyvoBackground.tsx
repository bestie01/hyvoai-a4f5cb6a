import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveChat } from "@/hooks/useLiveChat";
import { logHyvoEvent } from "@/lib/hyvo/actions";
import { HyvoSettings } from "@/lib/hyvo/types";

interface Options {
  enabled: boolean;
  speak: (text: string) => void;
  settings: HyvoSettings;
}

const SCREEN_INTERVAL_MS = 1500;

/**
 * Background autonomy: screens incoming chat for toxicity, auto-answers known
 * questions, and reads the room when it goes quiet. Silent by default — only
 * critical events are spoken aloud.
 */
export function useHyvoBackground({ enabled, speak, settings }: Options) {
  const { messages } = useLiveChat();
  const seenRef = useRef<Set<string>>(new Set());
  const queueRef = useRef<{ id: string; username: string; message: string }[]>([]);
  const workingRef = useRef(false);
  const knowledgeRef = useRef<{ question: string; answer: string }[]>([]);
  const bannedRef = useRef<string[]>([]);
  const userIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;
      userIdRef.current = user.id;
      const [{ data: qa }, { data: banned }] = await Promise.all([
        supabase.from("viewer_qa_knowledge").select("question, answer").eq("auto_respond", true).limit(25),
        supabase.from("banned_words").select("word").limit(40),
      ]);
      if (!active) return;
      knowledgeRef.current = qa ?? [];
      bannedRef.current = (banned ?? []).map((b) => b.word);
    })();
    return () => { active = false; };
  }, [enabled]);

  // Queue every unseen chat message for screening.
  useEffect(() => {
    if (!enabled) return;
    for (const m of messages) {
      if (seenRef.current.has(m.id)) continue;
      seenRef.current.add(m.id);
      lastActivityRef.current = Date.now();
      queueRef.current.push({ id: m.id, username: m.username, message: m.message });
    }
  }, [messages, enabled]);

  // Drain the screening queue at a steady pace so the AI gateway isn't hammered.
  useEffect(() => {
    if (!enabled || (!settings.auto_moderate && !settings.auto_answer)) return;

    const timer = setInterval(async () => {
      const userId = userIdRef.current;
      if (workingRef.current || !userId) return;
      const next = queueRef.current.shift();
      if (!next) return;
      workingRef.current = true;
      try {
        const { data, error } = await supabase.functions.invoke("hyvo-agent", {
          body: {
            mode: "screen",
            message: next.message,
            username: next.username,
            knowledge: settings.auto_answer ? knowledgeRef.current : [],
            bannedWords: bannedRef.current,
            sensitivity: settings.autonomy === "autopilot" ? "strict" : "balanced",
          },
        });
        if (error) throw error;

        const action = String(data?.action ?? "none");
        const toxicity = Number(data?.toxicity ?? 0);
        const autoReply = String(data?.auto_reply ?? "");
        const notify = Boolean(data?.notify);

        if (settings.auto_moderate && action !== "none") {
          await supabase.from("chat_moderation_actions").insert({
            user_id: userId,
            stream_id: "live",
            message: next.message,
            username: next.username,
            action,
            toxicity_score: Math.round(toxicity),
            reason: String(data?.reason ?? "Auto-moderated by Hyvo"),
          });
          await logHyvoEvent({ userId, streamId: null }, {
            kind: "moderation",
            summary: `${action} · ${next.username}`,
            detail: { toxicity, reason: data?.reason },
          });
        }

        if (settings.auto_answer && autoReply) {
          await supabase.functions.invoke("twitch-chat-send", { body: { message: autoReply } });
          await logHyvoEvent({ userId, streamId: null }, {
            kind: "answer",
            summary: `Answered ${next.username}`,
            detail: { question: next.message, reply: autoReply },
          });
        }

        if (notify && data?.speak) {
          speak(String(data.speak));
          await logHyvoEvent({ userId, streamId: null }, {
            kind: "alert", summary: String(data.speak), spoken: true,
          });
        }
      } catch (err) {
        console.error("[hyvo-background]", err);
      } finally {
        workingRef.current = false;
      }
    }, SCREEN_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [enabled, settings.auto_moderate, settings.auto_answer, settings.autonomy, speak]);

  // Dead air: after 4 quiet minutes with a live chat connection, offer one talking point.
  useEffect(() => {
    if (!enabled || settings.autonomy !== "autopilot") return;
    const timer = setInterval(async () => {
      const userId = userIdRef.current;
      if (!userId || Date.now() - lastActivityRef.current < 4 * 60_000) return;
      lastActivityRef.current = Date.now();
      try {
        const { data } = await supabase.functions.invoke("hyvo-agent", { body: { mode: "icebreaker" } });
        if (data?.speak) {
          speak(String(data.speak));
          await logHyvoEvent({ userId, streamId: null }, {
            kind: "icebreaker", summary: String(data.speak), spoken: true,
          });
        }
      } catch (err) {
        console.error("[hyvo-icebreaker]", err);
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [enabled, settings.autonomy, speak]);
}
