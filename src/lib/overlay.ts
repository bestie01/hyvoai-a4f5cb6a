/** Shared helpers for the OBS browser-source overlay (/overlay/copilot). */
const KEY_STORAGE = "hyvo.overlay.key";
const PUBLIC_ORIGIN = "https://hyvoai.lovable.app";

export interface OverlayMessage {
  id: string;
  kind: "reply" | "alert" | "action" | "info";
  text: string;
  at: number;
}

export function getOverlayKey(): string {
  let k = localStorage.getItem(KEY_STORAGE);
  if (!k) {
    k = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(KEY_STORAGE, k);
  }
  return k;
}

export function resetOverlayKey(): string {
  localStorage.removeItem(KEY_STORAGE);
  return getOverlayKey();
}

export const overlayChannelName = (key: string) => `hyvo-overlay-${key}`;

export function overlayUrl(key: string): string {
  const origin = /^https?:/.test(window.location.protocol) ? window.location.origin : PUBLIC_ORIGIN;
  return `${origin}/overlay/copilot?key=${key}`;
}

export function kindFromEvent(kind: string): OverlayMessage["kind"] {
  const k = kind.toLowerCase();
  if (k.includes("alert") || k.includes("raid") || k.includes("critical") || k.includes("warn")) return "alert";
  if (k.includes("action") || k.includes("clip") || k.includes("command")) return "action";
  if (k.includes("reply") || k.includes("ai") || k.includes("answer")) return "reply";
  return "info";
}
