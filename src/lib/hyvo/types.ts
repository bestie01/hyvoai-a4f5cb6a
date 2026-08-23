/** Shared types + constants for the Hyvo co-pilot agent. */

export type HyvoAutonomy = "off" | "assist" | "autopilot";

export type HyvoActionName =
  | "go_live"
  | "end_stream"
  | "mute_mic"
  | "unmute_mic"
  | "switch_scene"
  | "clip"
  | "announce"
  | "timeout_user"
  | "ban_user"
  | "create_poll"
  | "chat_vibe"
  | "icebreaker"
  | "answer"
  | "stop_talking"
  | "unknown";

export interface HyvoIntent {
  action: HyvoActionName;
  parameters: Record<string, unknown>;
  speak: string;
  confident: boolean;
}

export interface HyvoSettings {
  wake_word_enabled: boolean;
  wake_word: string;
  push_to_talk_key: string;
  voice_enabled: boolean;
  voice_id: string;
  autonomy: HyvoAutonomy;
  auto_moderate: boolean;
  auto_answer: boolean;
}

export const HYVO_DEFAULT_SETTINGS: HyvoSettings = {
  wake_word_enabled: true,
  wake_word: "hyvo",
  push_to_talk_key: "v",
  voice_enabled: true,
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  autonomy: "assist",
  auto_moderate: true,
  auto_answer: true,
};

/** Curated co-host voices from the ElevenLabs library. */
export const HYVO_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George — warm, steady" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian — deep, confident" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica — bright, playful" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice — crisp, British" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam — young, energetic" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris — casual, laid back" },
] as const;

/** Events the agent dispatches on `window` for other panels to act on. */
export const HYVO_EVENTS = {
  goLive: "hyvo:go-live",
  endStream: "hyvo:end-stream",
  muteMic: "hyvo:mute-mic",
  unmuteMic: "hyvo:unmute-mic",
  switchScene: "hyvo:switch-scene",
  createPoll: "hyvo:create-poll",
  activity: "hyvo:activity",
} as const;

export type HyvoStatus = "off" | "idle" | "listening" | "thinking" | "speaking";

export interface HyvoEventRow {
  id: string;
  kind: string;
  summary: string;
  detail: Record<string, unknown>;
  created_at: string;
}
