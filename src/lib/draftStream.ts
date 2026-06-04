// Typed localStorage helpers for the Create → Ready-to-Stream hand-off.

export type StreamQuality = "720p" | "1080p" | "1440p" | "4K";
export type StreamPlatform = "twitch" | "youtube" | "custom";

export interface DraftStream {
  title: string;
  description: string;
  category: string;
  tags: string[];
  scheduled: boolean;
  scheduledAt?: string; // ISO
  thumbnailDataUrl?: string;
  quality: StreamQuality;
  bitrate: number; // kbps
  fps: 30 | 60;
  platforms: StreamPlatform[];
  customRtmpUrl?: string;
  customStreamKey?: string;
  updatedAt: string;
}

const KEY = "hyvo.draftStream";

export function getDraftStream(): DraftStream | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DraftStream) : null;
  } catch {
    return null;
  }
}

export function saveDraftStream(draft: Partial<DraftStream>): DraftStream {
  const current = getDraftStream() ?? createEmptyDraft();
  const next: DraftStream = {
    ...current,
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function clearDraftStream() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function createEmptyDraft(): DraftStream {
  return {
    title: "",
    description: "",
    category: "",
    tags: [],
    scheduled: false,
    quality: "1080p",
    bitrate: 6000,
    fps: 60,
    platforms: ["twitch"],
    updatedAt: new Date().toISOString(),
  };
}
