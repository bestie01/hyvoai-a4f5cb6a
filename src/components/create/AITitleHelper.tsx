import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MOODS = ["Hype", "Chill", "Competitive", "Educational"] as const;
type Mood = typeof MOODS[number];

interface Props {
  category: string;
  description?: string;
  onPick: (title: string) => void;
}

export function AITitleHelper({ category, description, onPick }: Props) {
  const { toast } = useToast();
  const [mood, setMood] = useState<Mood>("Hype");
  const [game, setGame] = useState(category);
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);

  const generate = async () => {
    const seed = (game || category || "").trim();
    if (!seed) {
      toast({ title: "Add a category or game first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTitles([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-title-generator", {
        body: {
          game: seed,
          theme: mood,
          targetAudience: description?.slice(0, 100) || "streaming community",
        },
      });
      if (error) throw error;
      const list = Array.isArray((data as any)?.titles) ? (data as any).titles.slice(0, 5) : [];
      if (!list.length) throw new Error("No suggestions returned");
      setTitles(list);
    } catch (e: any) {
      toast({ title: "AI helper unavailable", description: e?.message ?? "Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassPanel variant="raised" className="p-5 space-y-4 border-primary/20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--neon-cyan))/0.3] to-[hsl(var(--neon-violet))/0.3] border border-white/10 grid place-items-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-display font-semibold text-white">AI Title Helper</div>
          <div className="text-[11px] text-white/50">Game + mood → click-worthy titles.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Game / category</Label>
          <Input
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="e.g. Valorant"
            className="bg-white/[0.04] border-white/10 h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Mood</Label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                  mood === m
                    ? "bg-primary/20 border-primary text-white"
                    : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={generate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-[hsl(var(--neon-violet))] text-white"
      >
        {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>) : (<><Wand2 className="w-4 h-4 mr-2" /> Generate titles</>)}
      </Button>

      {titles.length > 0 && (
        <div className="space-y-2 pt-1">
          {titles.map((t, i) => (
            <motion.button
              key={t + i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { onPick(t); toast({ title: "Title applied" }); }}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-all"
            >
              <div className="text-sm text-white font-medium">{t}</div>
              <div className="text-[10px] text-white/40 mt-0.5">Click to use</div>
            </motion.button>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
