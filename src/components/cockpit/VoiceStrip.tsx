import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="w-full space-y-2.5">
      <div className="min-h-[2.75rem] text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {(lastReply || transcript) && (
            <motion.p
              key={lastReply || transcript}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="inline-block max-w-full border border-accent/20 bg-background/70 px-4 py-2 text-sm text-foreground backdrop-blur-xl"
            >
              {lastReply || `“${transcript}”`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border border-accent/40 bg-background/80 px-3 py-2 backdrop-blur-xl focus-within:border-accent"
      >
        <Waves className="h-4 w-4 shrink-0 text-[hsl(var(--neon-cyan))]" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={status === "listening" ? "Listening — or type a command…" : "Ask Hyvo about your stream…"}
          aria-label="Ask Hyvo"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Send to Hyvo"
          className="h-7 w-7 shrink-0 text-accent"
        >
          <CornerDownLeft className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
