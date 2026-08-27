import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { HyvoStatus } from "@/lib/hyvo/types";

interface CoreOrbProps {
  status: HyvoStatus;
  micActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const CAPTION: Record<HyvoStatus, string> = {
  off: "Asleep — tap the core to wake Hyvo",
  idle: "Standing by",
  listening: "Listening…",
  thinking: "Processing",
  speaking: "Speaking",
};

/**
 * Reactive holographic core. Rings pulse with Hyvo's live state and, while the
 * mic is open, their amplitude follows real input level from the microphone.
 */
export function CoreOrb({ status, micActive, onToggle, disabled }: CoreOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(0);
  const statusRef = useRef<HyvoStatus>(status);
  statusRef.current = status;

  // Real mic amplitude while listening.
  useEffect(() => {
    if (!micActive) { levelRef.current = 0; return; }
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
          levelRef.current = Math.min(1, Math.sqrt(sum / buf.length) * 4);
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch { levelRef.current = 0; }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => {});
    };
  }, [micActive]);

  // Ring renderer.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const c = canvas.getContext("2d");
    if (!c) return;
    c.scale(dpr, dpr);

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      const s = statusRef.current;
      const base = s === "off" ? 0.12 : s === "idle" ? 0.3 : s === "thinking" ? 0.75 : s === "speaking" ? 0.85 : 0.5;
      const energy = Math.min(1, base + levelRef.current * 0.8);
      const cx = size / 2;
      const cy = size / 2;

      c.clearRect(0, 0, size, size);

      // Core glow
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, 70 + energy * 26);
      g.addColorStop(0, `rgba(96,165,250,${0.35 + energy * 0.4})`);
      g.addColorStop(0.55, `rgba(34,211,238,${0.16 + energy * 0.2})`);
      g.addColorStop(1, "rgba(10,10,15,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(cx, cy, 70 + energy * 26, 0, Math.PI * 2);
      c.fill();

      // Concentric reactive rings
      for (let i = 0; i < 4; i++) {
        const phase = t * (0.5 + i * 0.22) + i;
        const radius = 62 + i * 22 + Math.sin(phase) * (3 + energy * 12);
        c.beginPath();
        c.lineWidth = i === 0 ? 2 : 1;
        c.strokeStyle = `rgba(${i % 2 === 0 ? "96,165,250" : "34,211,238"},${(0.5 - i * 0.09) * (0.35 + energy)})`;
        c.arc(cx, cy, radius, 0, Math.PI * 2);
        c.stroke();
      }

      // Orbiting nodes
      for (let i = 0; i < 3; i++) {
        const a = t * (0.6 + i * 0.3) + (i * Math.PI * 2) / 3;
        const r = 108 + i * 8;
        c.beginPath();
        c.fillStyle = `rgba(34,211,238,${0.4 + energy * 0.5})`;
        c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.42, 2.2, 0, Math.PI * 2);
        c.fill();
      }

      // Waveform arc while listening/speaking
      if (s === "listening" || s === "speaking") {
        c.beginPath();
        c.strokeStyle = `rgba(52,211,153,${0.35 + levelRef.current * 0.5})`;
        c.lineWidth = 2;
        for (let i = 0; i <= 60; i++) {
          const a = (i / 60) * Math.PI * 2;
          const wob = Math.sin(a * 6 + t * 6) * (4 + levelRef.current * 22);
          const r = 140 + wob;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.closePath();
        c.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        aria-label={micActive ? "Stop listening" : "Talk to Hyvo"}
        className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--neon-cyan)/0.7)] disabled:opacity-60"
      >
        <canvas ref={canvasRef} style={{ width: 320, height: 320 }} className="max-w-[70vw] max-h-[70vw]" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-br from-primary to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
            HYVO
          </span>
        </span>
      </motion.button>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">{CAPTION[status]}</p>
    </div>
  );
}
