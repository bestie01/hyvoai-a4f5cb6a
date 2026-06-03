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

export function StreamHealthOverlay() {
  const [state, setState] = useState(loadState);
  const [fps, setFps] = useState(60);
  const [bitrate, setBitrate] = useState(6000);
  const [latency, setLatency] = useState(38);
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);

  // Persist position/open state
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  // Listen for header toggle event
  useEffect(() => {
    const handler = () => setState((s: any) => ({ ...s, open: !s.open }));
    window.addEventListener("hyvo:toggle-stream-health", handler);
    return () => window.removeEventListener("hyvo:toggle-stream-health", handler);
  }, []);

  // Simulated diagnostics — gentle drift so the panel feels live.
  useEffect(() => {
    if (!state.open) return;
    const id = setInterval(() => {
      setFps((v) => Math.max(45, Math.min(60, v + (Math.random() - 0.5) * 3)));
      setBitrate((v) => Math.max(3500, Math.min(8000, v + (Math.random() - 0.5) * 400)));
      setLatency((v) => Math.max(18, Math.min(120, v + (Math.random() - 0.5) * 10)));
    }, 1200);
    return () => clearInterval(id);
  }, [state.open]);

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

  const metrics: { node: React.ReactNode; key: string }[] = [
    {
      key: "fps",
      node: (
        <Row
          label="FPS"
          value={Math.round(fps)}
          unit=""
          dot={statusColor(fps, 58, 50, true)}
        />
      ),
    },
    {
      key: "bitrate",
      node: (
        <Row
          label="Bitrate"
          value={Math.round(bitrate)}
          unit="kbps"
          dot={statusColor(bitrate, 4000, 5000, true)}
        />
      ),
    },
    {
      key: "latency",
      node: (
        <Row
          label="Latency"
          value={Math.round(latency)}
          unit="ms"
          dot={statusColor(latency, 50, 90)}
        />
      ),
    },
  ];

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
        </div>
        <button
          aria-label="Close stream health"
          className="text-white/50 hover:text-white"
          onClick={() => setState((s: any) => ({ ...s, open: false }))}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        {metrics.map((m) => (
          <div key={m.key}>{m.node}</div>
        ))}
        <div className="pt-2 mt-1 border-t border-white/5 text-[10px] uppercase tracking-wider text-white/40">
          Live diagnostics · placeholder
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, unit, dot }: { label: string; value: number; unit: string; dot: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-white/70">{label}</span>
      </div>
      <div className="font-mono tabular-nums">
        <span className="text-white">{value}</span>
        {unit && <span className="text-white/40 text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}
