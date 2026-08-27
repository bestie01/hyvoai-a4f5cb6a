import { useEffect, useRef, useState } from "react";
import { Activity, Cpu, Gauge, Wifi } from "lucide-react";

interface Metric {
  key: string;
  label: string;
  value: string;
  ratio: number;
  icon: typeof Cpu;
  history: number[];
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return <div className="h-6" />;
  const max = Math.max(...points, 1);
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${24 - (p / max) * 22}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full">
      <polyline points={d} fill="none" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.8" />
    </svg>
  );
}

/**
 * Live local system telemetry: render FPS, memory pressure, network downlink
 * and session uptime — sampled every second from real browser APIs.
 */
export function SystemRail() {
  const [fps, setFps] = useState(0);
  const [mem, setMem] = useState(0);
  const [down, setDown] = useState(0);
  const [uptime, setUptime] = useState(0);
  const hist = useRef<Record<string, number[]>>({ fps: [], mem: [], net: [] });
  const started = useRef(Date.now());

  useEffect(() => {
    let frames = 0;
    let raf = 0;
    const count = () => { frames++; raf = requestAnimationFrame(count); };
    raf = requestAnimationFrame(count);

    const id = setInterval(() => {
      const f = frames; frames = 0;
      setFps(f);
      const perfMem = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const m = perfMem ? Math.round((perfMem.usedJSHeapSize / perfMem.jsHeapSizeLimit) * 100) : 0;
      setMem(m);
      const conn = (navigator as unknown as { connection?: { downlink?: number } }).connection;
      const dl = conn?.downlink ?? 0;
      setDown(dl);
      setUptime(Math.floor((Date.now() - started.current) / 1000));
      const push = (k: string, v: number) => {
        hist.current[k] = [...(hist.current[k] ?? []), v].slice(-24);
      };
      push("fps", f); push("mem", m); push("net", dl);
    }, 1000);

    return () => { cancelAnimationFrame(raf); clearInterval(id); };
  }, []);

  const hh = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return [h, m, x].map((n) => String(n).padStart(2, "0")).join(":");
  };

  const metrics: Metric[] = [
    { key: "fps", label: "Render", value: `${fps} fps`, ratio: Math.min(1, fps / 60), icon: Gauge, history: hist.current.fps ?? [] },
    { key: "mem", label: "Memory", value: mem ? `${mem}%` : "—", ratio: mem / 100, icon: Cpu, history: hist.current.mem ?? [] },
    { key: "net", label: "Downlink", value: down ? `${down} Mb/s` : "—", ratio: Math.min(1, down / 20), icon: Wifi, history: hist.current.net ?? [] },
  ];

  return (
    <div className="liquid-glass-panel rounded-2xl border border-border/40 p-4 space-y-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <Activity className="h-3.5 w-3.5 text-[hsl(var(--neon-cyan))]" /> System
      </div>

      {metrics.map((m) => (
        <div key={m.key} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <m.icon className="h-3.5 w-3.5" /> {m.label}
            </span>
            <span className="font-mono text-foreground">{m.value}</span>
          </div>
          <Sparkline points={m.history} />
        </div>
      ))}

      <div className="border-t border-border/40 pt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Session</span>
        <span className="font-mono text-foreground tabular-nums">{hh(uptime)}</span>
      </div>
    </div>
  );
}
