import { useEffect, useState } from "react";

/** Returns 0..1 microphone level bands while `active`; empty array when idle. */
export function useMicLevel(active: boolean, bands = 32) {
  const [levels, setLevels] = useState<number[]>([]);

  useEffect(() => {
    if (!active || !navigator.mediaDevices?.getUserMedia) {
      setLevels([]);
      return;
    }
    let raf = 0;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const step = Math.max(1, Math.floor(data.length / bands));
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const out: number[] = [];
          for (let i = 0; i < bands; i++) out.push((data[i * step] ?? 0) / 255);
          setLevels(out);
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setLevels([]);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
    };
  }, [active, bands]);

  return levels;
}
