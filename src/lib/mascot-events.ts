/** Tiny pub/sub the shark companion listens to for stream events. */

export type MascotEventType = "celebrate" | "alert" | "info";

export interface MascotEvent {
  id: string;
  type: MascotEventType;
  text: string;
  at: number;
}

type Listener = (event: MascotEvent) => void;

const listeners = new Set<Listener>();

export function emitMascotEvent(type: MascotEventType, text: string) {
  const event: MascotEvent = { id: crypto.randomUUID(), type, text, at: Date.now() };
  listeners.forEach((l) => l(event));
  return event;
}

export function onMascotEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
