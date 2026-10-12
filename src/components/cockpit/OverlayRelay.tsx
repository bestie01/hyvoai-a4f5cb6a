import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { MonitorUp, Copy, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getOverlayKey, resetOverlayKey, overlayChannelName, overlayUrl, kindFromEvent, OverlayMessage } from "@/lib/overlay";

/** Forwards Hyvo replies + activity events to the OBS overlay page, and offers the browser-source link. */
export function OverlayRelay({ lastReply }: { lastReply: string | null | undefined }) {
  const [key, setKey] = useState(() => getOverlayKey());
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const readyRef = useRef(false);

  const send = (m: Omit<OverlayMessage, "id" | "at">) => {
    if (!channelRef.current || !readyRef.current) return;
    void channelRef.current.send({
      type: "broadcast",
      event: "overlay",
      payload: { ...m, id: crypto.randomUUID(), at: Date.now() },
    });
  };

  useEffect(() => {
    readyRef.current = false;
    const ch = supabase.channel(overlayChannelName(key), { config: { broadcast: { self: false } } });
    ch.subscribe((s) => { readyRef.current = s === "SUBSCRIBED"; });
    channelRef.current = ch;
    const events = supabase
      .channel(`overlay-events-${key}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "hyvo_agent_events" }, (p) => {
        const row = p.new as { kind?: string; summary?: string };
        if (row?.summary) send({ kind: kindFromEvent(row.kind ?? ""), text: row.summary });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(events); channelRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (lastReply) send({ kind: "reply", text: lastReply });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastReply]);

  const url = overlayUrl(key);
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" title="OBS overlay" aria-label="OBS overlay link">
          <MonitorUp />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div>
          <p className="text-sm font-semibold">OBS / Streamlabs overlay</p>
          <p className="text-xs text-muted-foreground">Add a Browser Source with this link (1920×1080). Hyvo's replies and alerts appear on stream while this cockpit is open.</p>
        </div>
        <div className="flex gap-2">
          <input readOnly value={url} className="min-w-0 flex-1 rounded-md border border-border bg-muted px-2 py-1 font-mono text-[11px]" onFocus={(e) => e.currentTarget.select()} />
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={copy} aria-label="Copy overlay link">{copied ? <Check /> : <Copy />}</Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => send({ kind: "info", text: "Hyvo overlay connected." })}>Send test</Button>
          <Button size="sm" variant="ghost" onClick={() => setKey(resetOverlayKey())} title="Make a new private link"><RefreshCw className="mr-1" /> New link</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
