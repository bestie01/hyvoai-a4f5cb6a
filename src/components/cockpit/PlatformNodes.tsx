import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { STREAMING_PLATFORMS, getPlatform } from "@/lib/streaming/platforms";
import { useStreamDestinations } from "@/hooks/useStreamDestinations";

interface PlatformNodesProps {
  twitchConnected: boolean;
  youtubeConnected: boolean;
  onOpenDestinations: () => void;
}

/** Destination ring — real linked accounts and RTMP targets, click to manage. */
export function PlatformNodes({ twitchConnected, youtubeConnected, onOpenDestinations }: PlatformNodesProps) {
  const { destinations } = useStreamDestinations();

  const linkedIds = new Set<string>(destinations.map((d) => d.platform));
  if (twitchConnected) linkedIds.add("twitch");
  if (youtubeConnected) linkedIds.add("youtube");

  const nodes = (linkedIds.size
    ? Array.from(linkedIds)
    : ["twitch", "youtube", "kick"]
  ).map((id) => {
    const platform = getPlatform(id);
    const dest = destinations.find((d) => d.platform === id);
    const connected = linkedIds.has(id);
    return {
      id,
      label: platform?.name ?? id,
      accent: platform?.accent ?? "hsl(var(--neon-cyan))",
      connected,
      enabled: dest ? dest.is_enabled : connected,
    };
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {nodes.map((n, i) => (
        <motion.button
          key={n.id}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          whileHover={{ y: -2 }}
          onClick={onOpenDestinations}
          aria-label={`${n.label} — ${n.connected ? (n.enabled ? "live target" : "linked, disabled") : "not linked"}`}
          className={`group flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs transition-colors ${
            n.connected
              ? "border-[hsl(var(--neon-cyan)/0.5)] bg-[hsl(var(--neon-cyan)/0.08)] text-foreground"
              : "border-border/50 bg-background/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: n.accent }} />
          <span className="font-mono uppercase tracking-wide">{n.label}</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              n.enabled ? "bg-emerald-400" : n.connected ? "bg-amber-400" : "bg-muted-foreground/40"
            }`}
          />
        </motion.button>
      ))}

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={onOpenDestinations}
        aria-label="Add streaming destination"
        className="flex items-center gap-2 rounded-full border border-dashed border-border/60 bg-background/20 px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="font-mono uppercase tracking-wide">
          {STREAMING_PLATFORMS.length} destinations
        </span>
      </motion.button>
    </div>
  );
}
