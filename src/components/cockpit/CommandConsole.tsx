import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Loader2, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ConsoleItem {
  /** Primary copyable line. */
  text: string;
  /** Optional short tag or trigger shown before the text. */
  tag?: string;
}

export interface ConsoleResult {
  title: string;
  items: ConsoleItem[];
}

interface CommandConsoleProps {
  running: string | null;
  result: ConsoleResult | null;
  error: string | null;
  onClear: () => void;
}

/** HUD output panel — every command deck task renders its real result here. */
export function CommandConsole({ running, result, error, onClear }: CommandConsoleProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Clipboard unavailable", variant: "destructive" });
    }
  };

  const heading = running ?? result?.title ?? (error ? "Command failed" : "Console");

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      className="mx-auto w-full max-w-3xl rounded-2xl border border-border/50 bg-background/40 p-4 backdrop-blur-xl"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--neon-cyan))]">
          {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--neon-cyan))]" />}
          {heading}
        </span>
        {(result || error) && !running && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear console"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {error && !running && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground"
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            {error}
          </motion.p>
        )}

        {!error && !running && !result && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Run a command — results land here
          </motion.p>
        )}

        {running && (
          <motion.p
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Working…
          </motion.p>
        )}

        {!running && result && result.items.length > 0 && (
          <motion.ul
            key={result.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-1.5"
          >
            {result.items.map((it, i) => (
              <li
                key={`${it.tag ?? ""}-${i}`}
                className="group flex items-start gap-2 rounded-lg border border-border/40 bg-background/30 px-3 py-2 text-sm"
              >
                {it.tag && (
                  <span className="shrink-0 rounded-md bg-[hsl(var(--neon-cyan)/0.12)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[hsl(var(--neon-cyan))]">
                    {it.tag}
                  </span>
                )}
                <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-foreground/90">{it.text}</span>
                <button
                  type="button"
                  onClick={() => copy(it.text, i)}
                  aria-label="Copy"
                  className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                >
                  {copied === i ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
