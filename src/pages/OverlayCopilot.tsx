import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Zap, MessageCircle, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { overlayChannelName, OverlayMessage } from "@/lib/overlay";

const LIFETIME_MS = 8000;
const ICONS = { reply: MessageCircle, alert: AlertTriangle, action: Zap, info: Radio } as const;
const TONE = {
  reply: "border-accent/60 text-accent",
  alert: "border-destructive/70 text-destructive",
  action: "border-success/60 text-success",
  info: "border-primary/60 text-primary",
} as const;

/** Transparent browser-source page for OBS/Streamlabs. */
export default function OverlayCopilot() {
  const [params] = useSearchParams();
  const key = params.get("key");
  const demo = params.get("demo") === "1";
  const [items, setItems] = useState<OverlayMessage[]>([]);

  useEffect(() => {
    const prev = { html: document.documentElement.style.background, body: document.body.style.background };
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.documentElement.classList.add("overlay-mode");
    return () => {
      document.documentElement.style.background = prev.html;
      document.body.style.background = prev.body;
      document.documentElement.classList.remove("overlay-mode");
    };
  }, []);

  const push = (m: OverlayMessage) => {
    setItems((p) => [...p, m].slice(-4));
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== m.id)), LIFETIME_MS);
  };

  useEffect(() => {
    if (!key) return;
    const ch = supabase
      .channel(overlayChannelName(key))
      .on("broadcast", { event: "overlay" }, ({ payload }) => push(payload as OverlayMessage))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [key]);

  useEffect(() => {
    if (!demo) return;
    const samples: Omit<OverlayMessage, "id" | "at">[] = [
      { kind: "alert", text: "Raid incoming — ShadowFox with 48 viewers." },
      { kind: "action", text: "Clipped the last 30 seconds." },
      { kind: "reply", text: "Chat's hyped. Good moment for a poll." },
    ];
    let i = 0;
    const tick = () => { push({ ...samples[i % samples.length], id: crypto.randomUUID(), at: Date.now() }); i++; };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [demo]);

  if (!key && !demo) {
    return <p className="p-6 font-mono text-sm text-muted-foreground">Missing overlay key. Copy the link from the Hyvo cockpit.</p>;
  }

  return (
    <div className="pointer-events-none fixed bottom-10 left-10 flex w-[520px] flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((m) => {
          const Icon = ICONS[m.kind] ?? Radio;
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, x: -40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={`flex items-start gap-3 rounded-xl border-l-4 bg-background/80 px-4 py-3 shadow-2xl backdrop-blur-xl ${TONE[m.kind]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">Hyvo · {m.kind}</p>
                <p className="text-base font-medium leading-snug text-foreground">{m.text}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
