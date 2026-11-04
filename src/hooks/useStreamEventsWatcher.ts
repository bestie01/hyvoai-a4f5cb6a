import { RefObject } from "react";
import { emitMascotEvent } from "@/lib/mascot-events";
import { logHyvoEvent } from "@/lib/hyvo/actions";

interface ChatMessage {
  username: string;
  message: string;
}

interface WatcherOptions {
  messages: ChatMessage[];
  viewers: number;
  isLive: boolean;
  userId: string | null;
  /** Ref holding today's AI budget snapshot for the mascot popover. */
  quotaRef?: RefObject<{ remaining: number | typeof Infinity; limit: number }>;
}

const KILL_PATTERN =
  /\b(kills?|killed|killing|double\s*kill|triple\s*kill|quad\s*kill|clutch(ed)?|no\s*scope|1v[1-5]\s*(win|clutch|clutch)?|penta\s*kill|ace[d]?|got\s*him|took\s*(him|them)\s*out|headshot|ace)\b/i;

/**
 * Watches live chat and viewer counts for stream moments (kills, spikes) and
 * fires mascot animations + activity-log entries. The activity log is what the
 * OBS overlay relay forwards, so these moments also animate on the overlay.
 */
export function useStreamEventsWatcher({ messages, viewers, isLive, userId }: WatcherOptions) {
  // Hooks are not used directly — this module is wired by its consumer.
  return useWatcher({ messages, viewers, isLive, userId });
}

import { useEffect, useRef } from "react";

function useWatcher({ messages, viewers, isLive, userId }: WatcherOptions) {
  const seenRef = useRef<Set<string>>(new Set());
  const lastKillRef = useRef(0);
  const lastSpikeRef = useRef(0);
  const prevViewersRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLive) return;
    const now = Date.now();
    // Scan the newest chat messages for hype moments.
    for (let i = Math.max(0, messages.length - 40); i < messages.length; i++) {
      const m = messages[i];
      const key = `${m.username}:${m.message}`;
      if (seenRef.current.has(key)) continue;
      seenRef.current.add(key);
      if (seenRef.current.size > 600) seenRef.current.clear();
      if (now - lastKillRef.current < 15_000) continue;
      if (KILL_PATTERN.test(m.message)) {
        lastKillRef.current = now;
        emitMascotEvent("celebrate", "Kill spotted — GG!");
        if (userId) {
          void logHyvoEvent({ userId, streamId: null }, {
            kind: "ai",
            summary: "Kill spotted — GG!",
            detail: { source: "chat", username: m.username },
          });
        }
        break;
      }
    }
  }, [messages, isLive, userId]);

  useEffect(() => {
    const prev = prevViewersRef.current;
    prevViewersRef.current = viewers;
    if (!isLive || prev === null || prev <= 0) return;
    const jump = viewers - prev;
    const now = Date.now();
    if (jump >= 5 && now - lastSpikeRef.current > 45_000) {
      lastSpikeRef.current = now;
      emitMascotEvent("celebrate", `Viewer spike: +${jump}!`);
      if (userId) {
        void logHyvoEvent({ userId, streamId: null }, {
          kind: "alert",
          summary: `Viewer spike: +${jump}`,
          detail: { source: "stats", viewers },
        });
      }
    }
  }, [viewers, isLive, userId]);
}
