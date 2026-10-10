import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedRow {
  id: string;
  kind: string;
  summary: string;
  created_at: string;
}

const KIND_TONE: Record<string, string> = {
  command: "text-[hsl(var(--neon-cyan))]",
  ai: "text-primary",
  alert: "text-amber-400",
  moderation: "text-rose-400",
};

type Filter = "all" | "commands" | "ai" | "alerts";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "commands", label: "Commands" },
  { id: "ai", label: "AI" },
  { id: "alerts", label: "Alerts" },
];
const groupOf = (kind: string): Exclude<Filter, "all"> => {
  const k = kind.toLowerCase();
  if (/(command|action|clip|poll|chat)/.test(k)) return "commands";
  if (/(ai|reply|answer|insight|copilot|suggest)/.test(k)) return "ai";
  return "alerts";
};
const FILTER_KEY = "hyvo-activity-filter";

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Timestamped log of what Hyvo did and saw, live-updated from the agent event stream. */
export function ActivityFeed() {
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [filter, setFilter] = useState<Filter>(() => (localStorage.getItem(FILTER_KEY) as Filter) || "all");
  useEffect(() => { localStorage.setItem(FILTER_KEY, filter); }, [filter]);
  const counts = { all: rows.length, commands: 0, ai: 0, alerts: 0 } as Record<Filter, number>;
  rows.forEach((r) => { counts[groupOf(r.kind)]++; });
  const shown = filter === "all" ? rows : rows.filter((r) => groupOf(r.kind) === filter);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("hyvo_agent_events")
        .select("id, kind, summary, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (active && data) setRows(data as FeedRow[]);
    })();

    const channel = supabase
      .channel("cockpit-activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hyvo_agent_events" },
        (payload) => setRows((prev) => [payload.new as FeedRow, ...prev].slice(0, 20)),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-border/50 bg-background/40 p-4 backdrop-blur-xl">
      <header className="flex items-center gap-2 border-b border-border/40 pb-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--neon-cyan))]">
        <History className="h-3 w-3" /> Activity log
      </header>
      <div role="tablist" className="mt-2 flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-md px-2 py-0.5 font-mono text-[10px] uppercase transition-colors ${filter === f.id ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}
          >
            {f.label} <span className="opacity-60">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Nothing logged yet
        </p>
      ) : (
        <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {shown.map((r) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-background/40"
              >
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground pt-0.5">{time(r.created_at)}</span>
                <span className={`shrink-0 font-mono text-[10px] uppercase tracking-wide pt-0.5 ${KIND_TONE[r.kind] ?? "text-muted-foreground"}`}>
                  {r.kind}
                </span>
                <span className="min-w-0 flex-1 break-words text-foreground/90">{r.summary}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
