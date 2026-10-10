import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HyvoStatus } from "@/lib/hyvo/types";
import { useMicLevel } from "@/hooks/useMicLevel";

interface CoreOrbProps {
  status: HyvoStatus;
  micActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const CAPTION: Record<HyvoStatus, string> = {
  off: "Voice offline",
  idle: "Standing by",
  listening: "Listening",
  thinking: "Processing command",
  speaking: "Speaking",
};

/** Transparent control over the local holographic globe, without obscuring it. */
export function CoreOrb({ status, micActive, onToggle, disabled }: CoreOrbProps) {
  const levels = useMicLevel(micActive);
  const avg = levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center">
      <div aria-hidden className={`pointer-events-none absolute h-[min(37vw,43vh)] w-[min(37vw,43vh)] rounded-full border border-primary/30 shadow-[0_0_70px_hsl(var(--primary)/0.2)] transition-transform ${micActive ? "border-accent/80" : ""}`} style={{ transform: `scale(${1 + avg * 0.12})` }} />
      <div aria-hidden className={`pointer-events-none absolute h-48 w-48 transition-opacity sm:h-56 sm:w-56 ${micActive ? "opacity-100" : "opacity-20"}`}>
        {Array.from({ length: 32 }).map((_, i) => {
          const v = levels[i] ?? 0;
          return (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 w-1 origin-bottom rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.7)]"
              style={{ height: `${8 + v * 34}px`, transform: `translate(-50%, -100%) rotate(${i * 11.25}deg) translateY(-62px)`, opacity: 0.35 + v * 0.65 }}
            />
          );
        })}
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        disabled={disabled}
        aria-label={micActive ? "Stop listening" : "Talk to Hyvo"}
        className="group relative z-10 flex h-28 w-28 flex-col gap-1 rounded-full border border-accent/60 bg-background/65 text-foreground shadow-[0_0_45px_hsl(var(--accent)/0.3)] backdrop-blur-xl transition-transform hover:scale-105 hover:bg-background/75 focus-visible:ring-accent sm:h-32 sm:w-32"
      >
        {micActive ? <Mic className="h-5 w-5 text-accent" /> : <MicOff className="h-5 w-5 text-accent" />}
        <span className="font-display text-lg font-bold">HYVO</span>
      </Button>
      <span className="absolute bottom-0 rounded border border-accent/30 bg-background/75 px-3 py-1 font-mono text-[10px] uppercase text-accent backdrop-blur-xl" aria-live="polite">{CAPTION[status]}</span>
    </div>
  );
}
