import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, X, GripVertical } from "lucide-react";
import { PulseDot, type PulseStatus } from "./PulseDot";

const LS_KEY = "hyvo.streamHealth.v1";

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { open: true, x: 24, y: 24 };
}

function statusFor(value: number, good: number, warn: number, invert = false): PulseStatus {
  if (invert) {
    if (value >= good) return "good";
    if (value >= warn) return "warn";
    return "bad";
  }
  if (value <= good) return "good";
  if (value <= warn) return "warn";
  return "bad";
}

interface Metrics { fps: number; bitrate: number; latency: number; }

export function StreamHealthOverlay() {
  const [state, setState] = useState(loadState);
  const [metrics, setMetrics] = useState<Metrics>({ fps: 60, bitrate: 6000, latency: 38 });
  const [live, setLive] = useState(false);
  const liveTimeout = useRef<number | null>(null);
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const toggle = () => setState((s: any) => ({ ...s, open: !s.open }));
    const onMetrics = (e: Event) => {
      const detail = (e as CustomEvent<Metrics>).detail;
      if (!detail) return;
      setMetrics(detail);
      setLive(true);
      if (liveTimeout.current) window.clearTimeout(liveTimeout.current);
      // If no metrics for 4s, fall back to simulated drift
      liveTimeout.current = window.setTimeout(() => setLive(false), 4000);
    };
    window.addEventListener("hyvo:toggle-stream-health", toggle);
    window.addEventListener("hyvo:stream-metrics", onMetrics as EventListener);
    return () => {
      window.removeEventListener("hyvo:toggle-stream-health", toggle);
      window.removeEventListener("hyvo:stream-metrics", onMetrics as EventListener);
      if (liveTimeout.current) window.clearTimeout(liveTimeout.current);
    };
  }, []);

  // Simulated drift only when no live metrics are arriving.
  useEffect(() => {
    if (!state.open || live) return;
    const id = setInterval(() => {
      setMetrics((m) => ({
        fps: Math.max(45, Math.min(60, m.fps + (Math.random() - 0.5) * 3)),
        bitrate: Math.max(3500, Math.min(8000, m.bitrate + (Math.random() - 0.5) * 400)),
        latency: Math.max(18, Math.min(120, m.latency + (Math.random() - 0.5) * 10)),
      }));
    }, 1200);
    return () => clearInterval(id);
  }, [state.open, live]);

  if (!state.open) return null;

  const onDragStart = (e: React.PointerEvent) => {
    dragRef.current = { ox: e.clientX, oy: e.clientY, sx: state.x, sy: state.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.ox;
    const dy = e.clientY - dragRef.current.oy;
    setState((s: any) => ({
      ...s,
      x: Math.max(8, dragRef.current!.sx - dx),
      y: Math.max(8, dragRef.current!.sy - dy),
    }));
  };
  const onDragEnd = () => { dragRef.current = null; };

  const { fps, bitrate, latency } = metrics;

  // Composite health score → drives the pulse intensity of every row & headline.
  const fpsScore = Math.max(0, Math.min(1, (60 - fps) / 15));
  const brScore = Math.max(0, Math.min(1, (5000 - bitrate) / 2500));
  const latScore = Math.max(0, Math.min(1, (latency - 40) / 80));
  const composite = Math.max(fpsScore, brScore, latScore);

  const overallStatus: PulseStatus = composite < 0.33 ? "good" : composite < 0.66 ? "warn" : "bad";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed z-40 w-64 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl text-white"
      style={{ right: state.x, bottom: state.y }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/10 cursor-grab active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-white/40" />
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide">Stream Health</span>
          <PulseDot status={overallStatus} intensity={composite} />
        </div>
        <button
          aria-label="Close stream health"
          className="text-white/50 hover:text-white"
          onClick={() => setState((s: any) => ({ ...s, open: false }))}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2.5">
        <Row label="FPS"     value={Math.round(fps)}     unit=""     status={statusFor(fps, 58, 50, true)}        intensity={fpsScore} />
        <Row label="Bitrate" value={Math.round(bitrate)} unit="kbps" status={statusFor(bitrate, 4000, 5000, true)} intensity={brScore} />
        <Row label="Latency" value={Math.round(latency)} unit="ms"   status={statusFor(latency, 50, 90)}            intensity={latScore} />
        <div className="pt-2 mt-1 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
          <span>{live ? "Live diagnostics" : "Simulated"}</span>
          {live && <span className="text-emerald-400">● LIVE</span>}
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, unit, status, intensity }: { label: string; value: number; unit: string; status: PulseStatus; intensity: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2.5">
        <PulseDot status={status} intensity={intensity} />
        <span className="text-white/70">{label}</span>
      </div>
      <div className="font-mono tabular-nums">
        <span className="text-white">{value}</span>
        {unit && <span className="text-white/40 text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}
