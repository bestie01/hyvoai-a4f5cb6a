import { DraftStream } from "@/lib/draftStream";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

const SUGGESTED_TAGS = ["Gaming", "Just Chatting", "Music", "Art", "IRL", "Coding", "Esports", "Speedrun"];

interface Props {
  draft: DraftStream;
  onChange: (patch: Partial<DraftStream>) => void;
}

export function SetupStep({ draft, onChange }: Props) {
  const [tagInput, setTagInput] = useState("");

  const addTag = (t: string) => {
    const v = t.trim();
    if (!v || draft.tags.includes(v)) return;
    onChange({ tags: [...draft.tags, v].slice(0, 8) });
    setTagInput("");
  };

  return (
    <GlassPanel variant="raised" className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Stream title *</Label>
        <Input
          id="title"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Late-night ranked grind to Diamond"
          className="bg-white/[0.04] border-white/10 focus-visible:border-primary/60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          rows={3}
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Tell viewers what to expect."
          className="bg-white/[0.04] border-white/10 focus-visible:border-primary/60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat">Category</Label>
        <Input
          id="cat"
          value={draft.category}
          onChange={(e) => onChange({ category: e.target.value })}
          placeholder="e.g. Valorant"
          className="bg-white/[0.04] border-white/10 focus-visible:border-primary/60"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {draft.tags.map((t) => (
            <Badge key={t} className="bg-primary/15 border border-primary/30 text-white gap-1">
              {t}
              <button onClick={() => onChange({ tags: draft.tags.filter((x) => x !== t) })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(tagInput);
            }
          }}
          placeholder="Type a tag and press Enter"
          className="bg-white/[0.04] border-white/10 focus-visible:border-primary/60"
        />
        <div className="flex flex-wrap gap-2 pt-2">
          {SUGGESTED_TAGS.filter((t) => !draft.tags.includes(t)).map((t) => (
            <button
              key={t}
              onClick={() => addTag(t)}
              className="px-2.5 py-1 rounded-full text-xs bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08]"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
        <div>
          <div className="font-medium text-white">Schedule for later</div>
          <div className="text-xs text-white/50">Off = go live immediately from the Studio.</div>
        </div>
        <Switch
          checked={draft.scheduled}
          onCheckedChange={(v) => onChange({ scheduled: v })}
        />
      </div>

      {draft.scheduled && (
        <div className="space-y-2">
          <Label htmlFor="when">When</Label>
          <Input
            id="when"
            type="datetime-local"
            value={draft.scheduledAt ?? ""}
            onChange={(e) => onChange({ scheduledAt: e.target.value })}
            className="bg-white/[0.04] border-white/10 focus-visible:border-primary/60"
          />
        </div>
      )}
    </GlassPanel>
  );
}
