import { MonitorDown, Radio, Activity, Twitch, Youtube, Zap } from "lucide-react";

const platforms = [
  { name: "Twitch", icon: Twitch, detail: "OAuth connection" },
  { name: "YouTube Gaming", icon: Youtube, detail: "OAuth connection" },
  { name: "Kick", icon: Zap, detail: "RTMP destination" },
];

const signals = [
  { icon: MonitorDown, label: "Desktop command center" },
  { icon: Radio, label: "Streaming-only AI" },
  { icon: Activity, label: "Live telemetry" },
];

export function PlatformLogos() {
  return (
    <div className="w-full py-10">
      <div className="mb-7 text-center">
        <p className="font-mono text-xs uppercase text-accent">Built for the platforms you broadcast on</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-px overflow-hidden rounded-lg border border-border/50 bg-border/50 sm:grid-cols-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.name} className="flex items-center gap-4 bg-background px-5 py-5">
              <span className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <div><p className="font-semibold text-foreground">{platform.name}</p><p className="text-xs text-muted-foreground">{platform.detail}</p></div>
            </div>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return <span key={signal.label} className="flex items-center gap-2"><Icon className="h-4 w-4 text-success" />{signal.label}</span>;
        })}
      </div>
    </div>
  );
}

export default PlatformLogos;