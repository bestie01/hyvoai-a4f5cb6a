import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { HYVO_EVENTS, HyvoIntent } from "./types";

export interface HyvoActionContext {
  userId: string;
  streamId: string | null;
}

export interface HyvoActionResult {
  /** One short line to speak back. */
  speak: string;
  /** Activity-log entry kind, e.g. "command", "moderation". */
  kind: string;
  summary: string;
  detail?: Record<string, unknown>;
  ok: boolean;
}

const emit = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

const str = (v: unknown, fallback = "") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

/** Writes one row to the Hyvo activity log. Failures are non-fatal. */
export async function logHyvoEvent(
  ctx: HyvoActionContext,
  entry: { kind: string; summary: string; detail?: Record<string, unknown>; spoken?: boolean },
) {
  try {
    await supabase.from("hyvo_agent_events").insert({
      user_id: ctx.userId,
      kind: entry.kind,
      summary: entry.summary.slice(0, 300),
      detail: entry.detail ?? {},
      stream_id: ctx.streamId,
      spoken: entry.spoken ?? false,
    });
  } catch (err) {
    console.error("[hyvo] log failed", err);
  }
}

/**
 * Executes one parsed intent. Every handler is small and independently testable;
 * anything Hyvo genuinely cannot do returns an honest refusal instead of faking it.
 */
export async function executeHyvoAction(
  intent: HyvoIntent,
  ctx: HyvoActionContext,
): Promise<HyvoActionResult> {
  const p = intent.parameters ?? {};
  const ack = str(intent.speak, "Done.");

  switch (intent.action) {
    case "go_live":
      emit(HYVO_EVENTS.goLive);
      return { ok: true, speak: ack || "Going live.", kind: "command", summary: "Started the stream" };

    case "end_stream":
      emit(HYVO_EVENTS.endStream);
      return { ok: true, speak: ack || "Ending the stream.", kind: "command", summary: "Ended the stream" };

    case "mute_mic":
      emit(HYVO_EVENTS.muteMic);
      return { ok: true, speak: "Muted.", kind: "command", summary: "Muted the microphone" };

    case "unmute_mic":
      emit(HYVO_EVENTS.unmuteMic);
      return { ok: true, speak: "Live again.", kind: "command", summary: "Unmuted the microphone" };

    case "switch_scene": {
      const scene = str(p.scene);
      if (!scene) return { ok: false, speak: "Which scene?", kind: "command", summary: "Scene switch needed a name" };
      emit(HYVO_EVENTS.switchScene, { scene });
      return { ok: true, speak: `Switched to ${scene}.`, kind: "command", summary: `Switched scene to ${scene}` };
    }

    case "clip": {
      const label = str(p.label, "Highlight");
      const at = new Date().toISOString();
      const { error } = await supabase.from("stream_highlights").insert({
        user_id: ctx.userId,
        stream_id: ctx.streamId ?? "live",
        highlights: [{ label, at, source: "hyvo-voice" }],
        summary: label,
      });
      if (error) return { ok: false, speak: "Couldn't save that clip.", kind: "clip", summary: "Clip failed" };
      return { ok: true, speak: "Clipped that.", kind: "clip", summary: `Clipped "${label}"`, detail: { label, at } };
    }

    case "announce": {
      const text = str(p.text);
      if (!text) return { ok: false, speak: "What should I post?", kind: "chat", summary: "Announcement had no text" };
      const { error } = await supabase.functions.invoke("twitch-chat-send", { body: { message: text } });
      if (error) return { ok: false, speak: "Chat wouldn't take it.", kind: "chat", summary: "Announcement failed" };
      return { ok: true, speak: "Posted.", kind: "chat", summary: `Announced: ${text}`, detail: { text } };
    }

    case "timeout_user":
    case "ban_user": {
      const username = str(p.username);
      if (!username) return { ok: false, speak: "Who?", kind: "moderation", summary: "Moderation had no username" };
      const isBan = intent.action === "ban_user";
      const { error } = await supabase.from("chat_moderation_actions").insert({
        user_id: ctx.userId,
        stream_id: ctx.streamId ?? "live",
        message: str(p.reason, "(voice command)"),
        username,
        action: isBan ? "ban" : "timeout",
        toxicity_score: 100,
        reason: str(p.reason, "Streamer voice command"),
      });
      if (error) return { ok: false, speak: "That didn't go through.", kind: "moderation", summary: "Moderation failed" };
      return {
        ok: true,
        speak: isBan ? `${username} is gone.` : `${username} timed out.`,
        kind: "moderation",
        summary: `${isBan ? "Banned" : "Timed out"} ${username}`,
        detail: { username },
      };
    }

    case "create_poll": {
      const question = str(p.question);
      const options = Array.isArray(p.options) ? p.options.map((o) => String(o)).slice(0, 4) : [];
      if (!question || options.length < 2) {
        return { ok: false, speak: "Give me a question and two options.", kind: "poll", summary: "Poll was incomplete" };
      }
      const { error } = await supabase.from("stream_polls").insert({
        user_id: ctx.userId,
        stream_id: ctx.streamId ?? "live",
        question,
        options,
        active: true,
      });
      if (error) return { ok: false, speak: "Poll didn't launch.", kind: "poll", summary: "Poll failed" };
      emit(HYVO_EVENTS.createPoll, { question, options });
      return { ok: true, speak: "Poll's up.", kind: "poll", summary: `Poll: ${question}`, detail: { question, options } };
    }

    default:
      return { ok: false, speak: ack, kind: "command", summary: intent.action };
  }
}
