import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Twitch, Youtube, MessageCircle, Music, Video } from "lucide-react";

interface PlatformNodesProps {
  twitchConnected: boolean;
  youtubeConnected: boolean;
}

/** Platform link ring — connected nodes glow, unlinked nodes route to Settings. */
export function PlatformNodes({ twitchConnected, youtubeConnected }: PlatformNodesProps) {
  const navigate = useNavigate();

  const nodes = [
    { id: "twitch", label: "Twitch", icon: Twitch, connected: twitchConnected },
    { id: "youtube", label: "YouTube", icon: Youtube, connected: youtubeConnected },
    { id: "discord", label: "Discord", icon: MessageCircle, connected: false },
    { id: "kick", label: "Kick", icon: Video, connected: false },
    { id: "spotify", label: "Spotify", icon: Music, connected: false },
  ];

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
          onClick={() => navigate("/settings")}
          aria-label={`${n.label} — ${n.connected ? "connected" : "not linked"}`}
          className={`group flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs transition-colors ${
            n.connected
              ? "border-[hsl(var(--neon-cyan)/0.5)] bg-[hsl(var(--neon-cyan)/0.08)] text-foreground"
              : "border-border/50 bg-background/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          <n.icon className="h-3.5 w-3.5" />
          <span className="font-mono uppercase tracking-wide">{n.label}</span>
          <span className={`h-1.5 w-1.5 rounded-full ${n.connected ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
        </motion.button>
      ))}
    </div>
  );
}
