import { useState } from "react";
import { Megaphone, Scissors, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickPresetsProps {
  isLive: boolean;
  busy: boolean;
  onTitles: () => void;
  onClip: () => void;
  onShoutout: (channel: string) => void;
}

/** One-click streamer presets: titles, clip, shoutout. */
export function QuickPresets({ isLive, busy, onTitles, onClip, onShoutout }: QuickPresetsProps) {
  const [shout, setShout] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={onTitles} className="border-accent/40 bg-background/60 text-accent hover:bg-accent/10">
          <Sparkles /> Title
        </Button>
        <Button variant="outline" size="sm" disabled={busy || !isLive} onClick={onClip} title={isLive ? "Clip that" : "Go live to clip"} className="border-accent/40 bg-background/60 text-accent hover:bg-accent/10">
          <Scissors /> Clip that
        </Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => setShout((s) => !s)} className="border-accent/40 bg-background/60 text-accent hover:bg-accent/10">
          <Megaphone /> Shoutout
        </Button>
      </div>
      {shout && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = name.trim().replace(/^@/, "");
            if (!n) return;
            onShoutout(n);
            setName("");
            setShout(false);
          }}
        >
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Channel name" className="h-8 bg-background/60" />
          <Button type="submit" size="sm" aria-label="Send shoutout"><Send /></Button>
        </form>
      )}
    </div>
  );
}
