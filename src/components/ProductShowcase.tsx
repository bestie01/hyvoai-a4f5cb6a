import { Radio } from "lucide-react";
import productLoop from "@/assets/product-loop.mp4";
import productLoopPoster from "@/assets/product-loop-poster.jpg";

export function ProductShowcase() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28" aria-labelledby="product-showcase-title">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 font-mono text-xs uppercase text-accent">See Hyvo at work</p>
          <h2 id="product-showcase-title" className="font-display text-4xl font-bold text-foreground sm:text-5xl">Your broadcast, understood in real time.</h2>
          <p className="mt-5 text-lg text-muted-foreground">Watch the desktop command center take a voice command and save a clip — without you ever leaving the stream.</p>
        </div>

        <div className="relative mx-auto aspect-video max-w-6xl overflow-hidden rounded-lg border border-accent/25 bg-card shadow-xl">
          <video
            src={productLoop}
            poster={productLoopPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Silent walkthrough: Hyvo hears 'clip that moment', saves a clip of the last 30 seconds and confirms it"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-accent/20 bg-background/55 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-accent sm:text-xs"><Radio className="h-3.5 w-3.5" /> HYVO co-pilot / live preview</div>
            <span className="flex items-center gap-2 text-xs text-success"><span className="h-2 w-2 rounded-full bg-success" /> Systems healthy</span>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-6xl text-right font-mono text-[10px] uppercase text-muted-foreground">Product preview · desktop app</p>
      </div>
    </section>
  );
}
