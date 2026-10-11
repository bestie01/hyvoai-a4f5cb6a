import { Activity, Mic, Radio, Sparkles } from "lucide-react";
import cockpitBackdrop from "@/assets/cockpit-command-center.jpg";

export function ProductShowcase() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28" aria-labelledby="product-showcase-title">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 font-mono text-xs uppercase text-accent">See Hyvo at work</p>
          <h2 id="product-showcase-title" className="font-display text-4xl font-bold text-foreground sm:text-5xl">Your broadcast, understood in real time.</h2>
          <p className="mt-5 text-lg text-muted-foreground">The desktop command center keeps voice control, platform status, live telemetry, and AI actions in one focused view.</p>
        </div>

        <div className="relative mx-auto aspect-video max-w-6xl overflow-hidden rounded-lg border border-accent/25 bg-card shadow-xl">
          <img src={cockpitBackdrop} alt="Hyvo desktop command center preview" className="h-full w-full object-cover" width={1792} height={1024} loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-background/85" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-accent/20 bg-background/55 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-accent sm:text-xs"><Radio className="h-3.5 w-3.5" /> HYVO co-pilot / ready</div>
            <span className="hidden items-center gap-2 text-xs text-success sm:flex"><span className="h-2 w-2 rounded-full bg-success" /> Systems healthy</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:grid-cols-3">
            <div className="hidden border border-border/60 bg-background/70 p-3 backdrop-blur-xl sm:block"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5 text-success" /> Live telemetry</span><strong className="mt-1 block text-sm text-foreground">Stable broadcast</strong></div>
            <div className="border border-accent/35 bg-background/75 p-3 text-center backdrop-blur-xl"><span className="flex items-center justify-center gap-2 text-xs text-accent"><Mic className="h-3.5 w-3.5" /> Voice command</span><strong className="mt-1 block text-sm text-foreground">“Hyvo, clip that moment”</strong></div>
            <div className="hidden border border-border/60 bg-background/70 p-3 backdrop-blur-xl sm:block"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> AI action</span><strong className="mt-1 block text-sm text-foreground">Clip saved</strong></div>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-6xl text-right font-mono text-[10px] uppercase text-muted-foreground">Product preview · desktop app</p>
      </div>
    </section>
  );
}