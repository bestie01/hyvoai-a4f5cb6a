import { DraftStream, StreamPlatform, StreamQuality } from "@/lib/draftStream";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Twitch, Youtube, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  draft: DraftStream;
  onChange: (patch: Partial<DraftStream>) => void;
}

const QUALITIES: StreamQuality[] = ["720p", "1080p", "1440p", "4K"];

const PLATFORMS: { id: StreamPlatform; label: string; icon: any; tint: string }[] = [
  { id: "twitch", label: "Twitch", icon: Twitch, tint: "from-[#9146FF]/30 to-[#9146FF]/5 border-[#9146FF]/40" },
  { id: "youtube", label: "YouTube", icon: Youtube, tint: "from-[#FF0033]/30 to-[#FF0033]/5 border-[#FF0033]/40" },
  { id: "custom", label: "Custom RTMP", icon: Radio, tint: "from-[hsl(var(--neon-cyan))]/30 to-[hsl(var(--neon-cyan))]/5 border-[hsl(var(--neon-cyan))]/40" },
];

export function StreamConfigStep({ draft, onChange }: Props) {
  const togglePlatform = (id: StreamPlatform) => {
    const has = draft.platforms.includes(id);
    onChange({
      platforms: has ? draft.platforms.filter((p) => p !== id) : [...draft.platforms, id],
    });
  };

  return (
    <GlassPanel variant="raised" className="p-6 space-y-8">
      {/* Quality */}
      <div className="space-y-3">
        <Label>Quality</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUALITIES.map((q) => (
            <button
              key={q}
              onClick={() => onChange({ quality: q })}
              className={cn(
                "rounded-xl py-3 text-sm font-semibold border transition-all",
                draft.quality === q
                  ? "bg-primary/15 border-primary text-white shadow-[0_0_24px_-8px_hsl(var(--primary)/0.7)]"
                  : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]",
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Bitrate */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Bitrate</Label>
          <span className="text-sm text-white/70 font-mono">{draft.bitrate} kbps</span>
        </div>
        <Slider
          value={[draft.bitrate]}
          min={1500}
          max={12000}
          step={500}
          onValueChange={(v) => onChange({ bitrate: v[0] })}
        />
      </div>

      {/* FPS */}
      <div className="space-y-3">
        <Label>Frame rate</Label>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {[30, 60].map((fps) => (
            <button
              key={fps}
              onClick={() => onChange({ fps: fps as 30 | 60 })}
              className={cn(
                "rounded-xl py-2.5 text-sm font-semibold border transition-all",
                draft.fps === fps
                  ? "bg-primary/15 border-primary text-white"
                  : "bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]",
              )}
            >
              {fps} fps
            </button>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-3">
        <Label>Platforms</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => {
            const active = draft.platforms.includes(p.id);
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  "rounded-xl p-4 flex items-center gap-3 border bg-gradient-to-br transition-all text-left",
                  active ? p.tint + " text-white" : "from-white/[0.03] to-transparent border-white/10 text-white/70 hover:text-white",
                )}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-[11px] opacity-70">{active ? "Selected" : "Tap to enable"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom RTMP fields */}
      {draft.platforms.includes("custom") && (
        <div className="grid md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="space-y-2">
            <Label htmlFor="rtmp">RTMP URL</Label>
            <Input
              id="rtmp"
              value={draft.customRtmpUrl ?? ""}
              onChange={(e) => onChange({ customRtmpUrl: e.target.value })}
              placeholder="rtmp://live.example.com/app"
              className="bg-white/[0.04] border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Stream key</Label>
            <Input
              id="key"
              type="password"
              value={draft.customStreamKey ?? ""}
              onChange={(e) => onChange({ customStreamKey: e.target.value })}
              placeholder="••••••••••••"
              className="bg-white/[0.04] border-white/10 font-mono"
            />
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
