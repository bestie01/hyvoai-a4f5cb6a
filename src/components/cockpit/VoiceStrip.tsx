import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Waves } from "lucide-react";
import type { HyvoStatus } from "@/lib/hyvo/types";

interface VoiceStripProps {
  status: HyvoStatus;
  transcript: string;
  lastReply: string;
  onAsk: (text: string) => void;
}

/** Live voice line: what Hyvo heard, what it answered, plus a typed fallback. */
export function VoiceStrip({ status, transcript, lastReply, onAsk }: VoiceStripProps) {
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onAsk(value);
    setText("");
  };

  const line = transcript || lastReply;

  return (
    <div className="w-full max-w-2xl space-y-2.5">
      <div className="min-h-[2.25rem] text-center">
        <AnimatePresence mode="wait">
          {line && (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`text-sm ${transcript ? "text-muted-foreground italic" : "text-foreground"}`}
            >
              {transcript ? `“${transcript}”` : line}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2 backdrop-blur-xl focus-within:border-[hsl(var(--neon-cyan)/0.6)]"
      >
        <Waves className="h-4 w-4 shrink-0 text-[hsl(var(--neon-cyan))]" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={status === "listening" ? "Listening — or type a command…" : "Ask Hyvo anything about your stream…"}
          aria-label="Ask Hyvo"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          aria-label="Send to Hyvo"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-[hsl(var(--neon-cyan))]"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
