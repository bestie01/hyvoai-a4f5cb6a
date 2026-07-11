import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, X, Minus, Send, Copy, Loader2, Wand2,
  MessageSquare, Flame, Share2, Bot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDraftStream } from "@/lib/draftStream";
import { cn } from "@/lib/utils";

type ChatMsg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "hyvo.copilot.open";

async function invoke(mode: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("stream-copilot", {
    body: { mode, ...payload },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

function useStreamContext() {
  const draft = typeof window !== "undefined" ? getDraftStream() : null;
  return {
    game: draft?.category || "",
    category: draft?.category || "",
    mood: (draft as any)?.mood || "hype",
    streamTitle: draft?.title || "",
    audience: "gaming enthusiasts",
  };
}

/* ------------------------------ Chat Tab ------------------------------ */
const HISTORY_KEY = "hyvo.copilot.history";
const WELCOME: ChatMsg = {
  role: "assistant",
  content:
    "I'm your streaming Copilot. I can suggest titles, tune thumbnails, recommend go-live times, and brainstorm growth tactics. What are we working on?",
};
const SUGGESTED_PROMPTS = [
  { label: "Punchy title ideas", prompt: "Give me 5 punchy stream title ideas for tonight based on my current draft." },
  { label: "Best time to go live", prompt: "Based on typical Twitch/YouTube audience patterns, when should I go live this week?" },
  { label: "Thumbnail concepts", prompt: "Suggest 3 thumbnail concepts that would maximize CTR for my next stream." },
  { label: "Grow to 100 followers", prompt: "Give me a concrete 7-day plan to grow from where I am to 100 followers." },
  { label: "Fix quiet chat", prompt: "My chat has been quiet lately. Give me 5 tactics to re-engage viewers in real time." },
];

function ChatTab() {
  const ctx = useStreamContext();
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? (JSON.parse(raw) as ChatMsg[]) : null;
      return parsed && parsed.length ? parsed : [WELCOME];
    } catch { return [WELCOME]; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40))); } catch {}
  }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const sendText = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const res = await invoke("chat", { ...ctx, messages: next });
      setMessages([...next, { role: "assistant", content: res.reply || "…" }]);
    } catch (e: any) {
      const msg = e?.message || "Copilot is unavailable — try again in a moment.";
      setMessages([...next, { role: "assistant", content: `⚠️ ${msg}` }]);
      toast({ title: "Copilot error", description: msg, variant: "destructive" });
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const reset = () => {
    setMessages([WELCOME]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  };

  const showChips = messages.length <= 1 && !loading;

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "rounded-xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed",
              m.role === "user"
                ? "bg-primary/80 text-white"
                : "bg-white/[0.06] border border-white/10 text-white/90",
            )}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Loader2 className="w-3 h-3 animate-spin" /> thinking…
          </div>
        )}
        {showChips && (
          <div className="pt-1 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Try one</div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendText(s.prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-primary/40 text-white/80 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="pt-3 space-y-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendText(input))}
            placeholder="Ask your Copilot…"
            className="bg-white/[0.04] border-white/10 rounded-xl"
            disabled={loading}
          />
          <Button size="icon" onClick={() => sendText(input)} disabled={loading || !input.trim()} className="rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {messages.length > 1 && (
          <button onClick={reset} className="text-[10px] text-white/40 hover:text-white/70 transition">
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------- Commands Tab -------------------------- */
type ChatCommand = { trigger: string; response: string; cooldown: number; mood: string };

function CommandsTab() {
  const ctx = useStreamContext();
  const [items, setItems] = useState<ChatCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try {
      const res = await invoke("commands", ctx);
      setItems(res.commands || []);
    } catch (e: any) {
      toast({ title: "Couldn't generate", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const save = async (c: ChatCommand) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast({ title: "Sign in to save" });
    const { error } = await supabase.from("chat_commands").insert({
      user_id: user.id,
      command: c.trigger,
      response: c.response,
      cooldown: c.cooldown,
      is_enabled: true,
    } as any);
    toast({ title: error ? "Save failed" : "Saved to Chat Commands", description: error?.message });
  };

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={loading} className="w-full rounded-xl">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
        Generate 5 commands
      </Button>
      <div className="space-y-2">
        {items.map((c, i) => (
          <GlassPanel key={i} variant="subtle" className="p-3">
            <div className="flex items-center justify-between mb-1">
              <code className="text-primary text-sm font-mono">{c.trigger}</code>
              <Badge variant="outline" className="text-[10px] border-white/10">{c.mood} · {c.cooldown}s</Badge>
            </div>
            <p className="text-xs text-white/80 mb-2">{c.response}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { navigator.clipboard.writeText(`${c.trigger} ${c.response}`); toast({ title: "Copied" }); }}>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => save(c)}>Save</Button>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- Icebreakers Tab -------------------------- */
type Icebreaker = { text: string; tag: string };
function IcebreakersTab() {
  const ctx = useStreamContext();
  const [items, setItems] = useState<Icebreaker[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try { const res = await invoke("icebreakers", ctx); setItems(res.icebreakers || []); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={loading} className="w-full rounded-xl">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flame className="w-4 h-4 mr-2" />}
        Spark 5 talking points
      </Button>
      {items.map((it, i) => (
        <GlassPanel key={i} variant="subtle" className="p-3 flex items-start gap-2">
          <Badge variant="outline" className="text-[10px] border-white/10 mt-0.5">{it.tag}</Badge>
          <p className="text-sm text-white/85 flex-1">{it.text}</p>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(it.text); toast({ title: "Copied" }); }}>
            <Copy className="w-3 h-3" />
          </Button>
        </GlassPanel>
      ))}
    </div>
  );
}

/* -------------------------- Social Hook Tab -------------------------- */
function SocialTab() {
  const ctx = useStreamContext();
  const [streamUrl, setStreamUrl] = useState("");
  const [result, setResult] = useState<{ twitter: string; discord: string; hashtags: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try { setResult(await invoke("social", { ...ctx, streamUrl })); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ title: "Copied" }); };

  return (
    <div className="space-y-3">
      <Input placeholder="Your stream URL (optional)" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} className="bg-white/[0.04] border-white/10 rounded-xl" />
      <Button onClick={generate} disabled={loading} className="w-full rounded-xl">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
        Write "we're LIVE" hooks
      </Button>
      {result && (
        <div className="space-y-3">
          <GlassPanel variant="subtle" className="p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-white/60">X / Twitter</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(result.twitter)}><Copy className="w-3 h-3" /></Button>
            </div>
            <Textarea readOnly value={result.twitter} className="bg-transparent border-none text-sm resize-none min-h-[70px] focus-visible:ring-0 p-0" />
          </GlassPanel>
          <GlassPanel variant="subtle" className="p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-white/60">Discord</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(result.discord)}><Copy className="w-3 h-3" /></Button>
            </div>
            <Textarea readOnly value={result.discord} className="bg-transparent border-none text-sm resize-none min-h-[90px] focus-visible:ring-0 p-0" />
          </GlassPanel>
          {result.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.hashtags.map((h) => (
                <Badge key={h} variant="outline" className="text-[10px] border-white/10 cursor-pointer" onClick={() => copy(h)}>{h}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================== SHELL ============================== */
export function StreamCopilotPanel() {
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  const [minimized, setMinimized] = useState(false);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, open ? "1" : "0"); } catch {} }, [open]);
  useEffect(() => {
    const h = () => setOpen((v) => !v);
    window.addEventListener("hyvo:toggle-copilot", h);
    return () => window.removeEventListener("hyvo:toggle-copilot", h);
  }, []);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--neon-cyan))] shadow-[0_0_30px_-4px_hsl(var(--primary)/0.8)] flex items-center justify-center hover:scale-105 transition"
          aria-label="Open AI Copilot"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={cn(
              "fixed z-40 flex flex-col",
              "right-4 bottom-4 md:right-6 md:bottom-6",
              "w-[min(94vw,380px)]",
              minimized ? "h-14" : "h-[min(80vh,600px)]",
            )}
          >
            <GlassPanel variant="raised" glow="cyan" className="flex flex-col h-full overflow-hidden border-zinc-800">
              <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--neon-cyan))] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Hyvo Copilot</div>
                    <div className="text-[10px] text-white/50">Live stream assistant</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setMinimized((v) => !v)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </header>

              {!minimized && (
                <div className="flex-1 overflow-hidden p-3">
                  <Tabs defaultValue="chat" className="h-full flex flex-col">
                    <TabsList className="grid grid-cols-4 bg-white/[0.04] rounded-xl">
                      <TabsTrigger value="chat" className="rounded-lg text-xs"><MessageSquare className="w-3 h-3 mr-1" />Chat</TabsTrigger>
                      <TabsTrigger value="cmd" className="rounded-lg text-xs"><Wand2 className="w-3 h-3 mr-1" />Cmds</TabsTrigger>
                      <TabsTrigger value="ice" className="rounded-lg text-xs"><Flame className="w-3 h-3 mr-1" />Ice</TabsTrigger>
                      <TabsTrigger value="soc" className="rounded-lg text-xs"><Share2 className="w-3 h-3 mr-1" />Post</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-y-auto mt-3 pr-1">
                      <TabsContent value="chat" className="h-full m-0 data-[state=active]:h-full"><ChatTab /></TabsContent>
                      <TabsContent value="cmd" className="m-0"><CommandsTab /></TabsContent>
                      <TabsContent value="ice" className="m-0"><IcebreakersTab /></TabsContent>
                      <TabsContent value="soc" className="m-0"><SocialTab /></TabsContent>
                    </div>
                  </Tabs>
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default StreamCopilotPanel;
