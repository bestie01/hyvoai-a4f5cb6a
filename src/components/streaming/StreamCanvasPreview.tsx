import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Monitor, TestTube2, Play, Square, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AudioMeter } from "@/components/streaming/AudioMeter";
import { cn } from "@/lib/utils";

type Source = "camera" | "screen" | "test";

export function StreamCanvasPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [source, setSource] = useState<Source>("test");
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Acquire media for current source
  useEffect(() => {
    let cancelled = false;
    setError(null);
    stopStream();

    async function start() {
      try {
        if (source === "test") {
          drawTestPattern();
          return;
        }
        const stream = source === "camera"
          ? await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        attachAudioAnalyser(stream);
      } catch (e: any) {
        setError(e?.message ?? "Could not access media device.");
      }
    }

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  function stopStream() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
  }

  function attachAudioAnalyser(stream: MediaStream) {
    try {
      const tracks = stream.getAudioTracks();
      if (!tracks.length) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100 * 1.6)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  }

  function drawTestPattern() {
    const c = canvasRef.current;
    if (!c) return;
    c.width = 1280; c.height = 720;
    const ctx = c.getContext("2d")!;
    const bars = ["#ffffff", "#ffe600", "#00e0ff", "#00d35a", "#ff3df0", "#ff2d2d", "#1a4cff"];
    let t = 0;
    const render = () => {
      const bw = c.width / bars.length;
      bars.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * bw, 0, bw, c.height * 0.75);
      });
      // moving bar
      const grad = ctx.createLinearGradient(0, c.height * 0.75, c.width, c.height);
      grad.addColorStop(0, "#0b0f1a");
      grad.addColorStop(0.5, "#1a2540");
      grad.addColorStop(1, "#0b0f1a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, c.height * 0.75, c.width, c.height * 0.25);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 36px Inter, sans-serif";
      ctx.fillText("HYVO TEST PATTERN", 40, c.height * 0.75 + 60);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "20px JetBrains Mono, monospace";
      ctx.fillText(new Date().toLocaleTimeString(), 40, c.height * 0.75 + 100);
      // simulated audio bar
      ctx.fillStyle = "rgba(0,224,255,0.7)";
      const w = ((Math.sin(t / 12) + 1) / 2) * (c.width - 80);
      ctx.fillRect(40, c.height * 0.75 + 130, w, 14);
      t++;
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    // simulated audio level
    const id = setInterval(() => setAudioLevel(40 + Math.round(Math.random() * 30)), 250);
    rafRef.current = requestAnimationFrame(() => {});
    // cleanup interval via stream effect
    streamRef.current = { getTracks: () => [], getAudioTracks: () => [] } as any;
    // tear down interval through unmount via wrapping
    (streamRef.current as any).__intId = id;
  }

  // Emit synthetic stream-metrics so the global StreamHealthOverlay reflects this preview.
  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(() => {
      const event = new CustomEvent("hyvo:stream-metrics", {
        detail: {
          fps: 58 + Math.round(Math.random() * 2),
          bitrate: 5600 + Math.round((Math.random() - 0.5) * 800),
          latency: 32 + Math.round((Math.random() - 0.5) * 16),
        },
      });
      window.dispatchEvent(event);
    }, 1200);
    return () => clearInterval(id);
  }, [streaming]);

  // Tear down test-pattern interval on unmount
  useEffect(() => () => {
    const s: any = streamRef.current;
    if (s?.__intId) clearInterval(s.__intId);
  }, []);

  return (
    <GlassPanel variant="raised" className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-display font-semibold text-white">Stream Preview</div>
          <div className="text-xs text-white/50">Local capture · WebRTC powered</div>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          {([
            { id: "camera", icon: Camera, label: "Camera" },
            { id: "screen", icon: Monitor, label: "Screen" },
            { id: "test", icon: TestTube2, label: "Test" },
          ] as const).map((opt) => {
            const Icon = opt.icon;
            const active = source === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSource(opt.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                  active ? "bg-primary/20 text-white border border-primary/40" : "text-white/60 hover:text-white",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
        {source === "test" ? (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        ) : (
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 text-white p-6 text-center">
            <div>
              <AlertCircle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
              <div className="font-medium">{error}</div>
              <div className="text-xs text-white/50 mt-1">Switch to the Test pattern or grant permissions.</div>
            </div>
          </div>
        )}
        {streaming && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </motion.div>
        )}
      </div>

      <AudioMeter level={audioLevel} label="Mic / System audio" />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-white/40">
          {streaming ? "Broadcasting to ingest server…" : "Idle — preview only"}
        </div>
        <Button
          onClick={() => setStreaming((v) => !v)}
          className={cn(
            "rounded-xl font-semibold",
            streaming
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-primary to-[hsl(var(--neon-violet))] text-white shadow-[0_0_24px_-6px_hsl(var(--primary)/0.7)]",
          )}
        >
          {streaming ? (<><Square className="w-4 h-4 mr-2" /> Stop</>) : (<><Play className="w-4 h-4 mr-2" /> Go Live</>)}
        </Button>
      </div>
    </GlassPanel>
  );
}
