import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Mic, Video, Layers, Wand2, Radio, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    id: "platforms",
    icon: Monitor,
    label: "Multi-Platform",
    eyebrow: "One broadcast, every destination",
    title: "Control your live presence from one place.",
    description: "Connect Twitch and YouTube with OAuth, add RTMP destinations when needed, and see readiness before you go live.",
    metric: "Destinations ready",
    value: "3 / 3",
    items: ["Twitch connected", "YouTube connected", "Kick ready"],
  },
  {
    id: "voice",
    icon: Mic,
    label: "Voice Co-Pilot",
    eyebrow: "Hands stay on the stream",
    title: "Say it once. Hyvo gets it done.",
    description: "Use push-to-talk or typed commands for clips, titles, chat analysis, production help, and live answers.",
    metric: "Command heard",
    value: "Clip that moment",
    items: ["Intent recognized", "Highlight captured", "Confirmation spoken"],
  },
  {
    id: "scenes",
    icon: Video,
    label: "Scene Manager",
    eyebrow: "Production without the scramble",
    title: "Move through your show with confidence.",
    description: "Keep scenes, transitions, camera checks, and launch readiness within reach while your stream stays front and center.",
    metric: "Active scene",
    value: "Gameplay",
    items: ["Camera online", "Audio healthy", "Transition ready"],
  },
  {
    id: "sources",
    icon: Layers,
    label: "Sources",
    eyebrow: "Everything visible at a glance",
    title: "Know what your audience is receiving.",
    description: "Monitor camera, microphone, screen capture, and platform status without digging through separate windows.",
    metric: "Source health",
    value: "All clear",
    items: ["Camera 1080p", "Mic signal stable", "Display capture active"],
  },
  {
    id: "ai",
    icon: Wand2,
    label: "AI Tools",
    eyebrow: "Useful intelligence, live",
    title: "Turn stream signals into next actions.",
    description: "Generate titles, read chat mood, save moments, answer viewers, and surface what to do next while it still matters.",
    metric: "AI response",
    value: "Chat is trending positive",
    items: ["Title ideas ready", "Sentiment analyzed", "Next action suggested"],
  },
] as const;

const Features = () => {
  const [activeId, setActiveId] = useState<(typeof capabilities)[number]["id"]>("voice");
  const active = capabilities.find((capability) => capability.id === activeId) ?? capabilities[1];

  return (
    <section id="features" className="relative overflow-hidden border-y border-border/30 bg-background py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.09)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.09)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="outline" className="mb-5 border-primary/25 bg-primary/5">Explore the command center</Badge>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">One co-pilot. Five jobs off your plate.</h2>
          <p className="mt-5 text-lg text-muted-foreground">Choose a capability to see how Hyvo supports a real broadcast.</p>
        </div>

        <div role="tablist" aria-label="Hyvo capabilities" className="mx-auto mb-8 flex max-w-5xl gap-2 overflow-x-auto pb-2">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            const selected = capability.id === activeId;
            return (
              <Button
                key={capability.id}
                role="tab"
                id={`capability-tab-${capability.id}`}
                aria-selected={selected}
                aria-controls={`capability-panel-${capability.id}`}
                variant={selected ? "default" : "outline"}
                className={cn("h-12 min-w-fit flex-1 px-4", !selected && "border-border/60 bg-card/40 text-muted-foreground")}
                onClick={() => setActiveId(capability.id)}
                onMouseEnter={() => setActiveId(capability.id)}
              >
                <Icon className="h-4 w-4" />
                {capability.label}
              </Button>
            );
          })}
        </div>

        <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-primary/20 bg-card/65 shadow-large backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              id={`capability-panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`capability-tab-${active.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid min-h-[420px] lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="flex flex-col justify-center border-b border-border/40 p-7 sm:p-10 lg:border-b-0 lg:border-r">
                <span className="mb-4 font-mono text-xs uppercase text-accent">{active.eyebrow}</span>
                <h3 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{active.title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{active.description}</p>
              </div>

              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-background/55 p-6 sm:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.14),transparent_55%)]" />
                <div className="relative w-full max-w-lg border border-accent/25 bg-background/75 p-5 shadow-glow-accent backdrop-blur-xl">
                  <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase text-accent"><Radio className="h-4 w-4" /> Live system</div>
                    <span className="flex items-center gap-2 text-xs text-success"><span className="h-2 w-2 rounded-full bg-success" /> Ready</span>
                  </div>
                  <div className="mb-5 bg-muted/45 p-4">
                    <span className="block text-xs text-muted-foreground">{active.metric}</span>
                    <span className="mt-1 block font-display text-xl font-semibold text-foreground">{active.value}</span>
                  </div>
                  <div className="space-y-3">
                    {active.items.map((item, index) => (
                      <motion.div key={item} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }} className="flex items-center gap-3 border-b border-border/35 pb-3 text-sm text-foreground last:border-0 last:pb-0">
                        <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                      </motion.div>
                    ))}
                  </div>
                  {active.id === "voice" && <div className="mt-5 flex items-center gap-3 border-t border-accent/20 pt-4 text-sm text-accent"><MessageSquare className="h-4 w-4" /> Clip saved.</div>}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Features;