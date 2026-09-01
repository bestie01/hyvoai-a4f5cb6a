import { useMemo, useState } from "react";
import { Check, Link2, Loader2, Plug, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STREAMING_PLATFORMS, getPlatform } from "@/lib/streaming/platforms";
import { useStreamDestinations } from "@/hooks/useStreamDestinations";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** Connect Hyvo to every known streaming service — OAuth or RTMP ingest. */
export function DestinationsDialog({ open, onOpenChange }: Props) {
  const { destinations, loading, save, toggle, remove } = useStreamDestinations();
  const { twitchConnection, youtubeConnection, connectTwitch, connectYouTube } = usePlatformOAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);

  const byPlatform = useMemo(
    () => Object.fromEntries(destinations.map((d) => [d.platform, d])),
    [destinations],
  );

  const openEditor = (id: string) => {
    const platform = getPlatform(id);
    const existing = byPlatform[id];
    setEditing(id);
    setUrl(existing?.rtmp_url || platform.rtmpUrl);
    setKey(existing?.stream_key || "");
  };

  const submit = async () => {
    if (!editing || !url.trim() || !key.trim()) return;
    setSaving(true);
    const ok = await save(editing, url, key);
    setSaving(false);
    if (ok) setEditing(null);
  };

  const oauthState = (id: string) =>
    id === "twitch" ? Boolean(twitchConnection?.isConnected) : Boolean(youtubeConnection?.isConnected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-[hsl(var(--neon-cyan))]" /> Streaming destinations
          </DialogTitle>
          <DialogDescription>
            Link accounts or paste an ingest key. Every enabled destination receives your broadcast when you go live.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-2">
            {STREAMING_PLATFORMS.map((p) => {
              const dest = byPlatform[p.id];
              const linked = p.auth === "oauth" ? oauthState(p.id) || Boolean(dest) : Boolean(dest);
              return (
                <div key={p.id} className="rounded-xl border border-border/50 bg-background/40 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {linked ? (dest ? dest.rtmp_url || "Linked account" : "Linked account") : p.keyHint}
                      </p>
                    </div>

                    {dest && (
                      <Switch
                        checked={dest.is_enabled}
                        onCheckedChange={(v) => toggle(dest.id, v)}
                        aria-label={`Enable ${p.name}`}
                      />
                    )}

                    {p.auth === "oauth" && !oauthState(p.id) ? (
                      <Button size="sm" variant="outline" onClick={() => (p.id === "twitch" ? connectTwitch() : connectYouTube())}>
                        <Link2 className="mr-1.5 h-3.5 w-3.5" /> Link
                      </Button>
                    ) : (
                      <Button size="sm" variant={dest ? "ghost" : "outline"} onClick={() => openEditor(p.id)}>
                        {dest ? "Edit key" : linked ? "Add key" : "Connect"}
                      </Button>
                    )}

                    {dest && (
                      <Button size="icon" variant="ghost" onClick={() => remove(dest.id)} aria-label={`Remove ${p.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {linked && <Check className="h-4 w-4 text-emerald-400" />}
                  </div>

                  {editing === p.id && (
                    <div className="mt-3 grid gap-2 border-t border-border/40 pt-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`url-${p.id}`} className="text-xs">Ingest URL</Label>
                        <Input id={`url-${p.id}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="rtmp://…" />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`key-${p.id}`} className="text-xs">Stream key</Label>
                        <Input id={`key-${p.id}`} type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="•••••••••" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button size="sm" onClick={submit} disabled={saving || !url.trim() || !key.trim()}>
                          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && <p className="py-2 text-center text-xs text-muted-foreground">Loading destinations…</p>}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
