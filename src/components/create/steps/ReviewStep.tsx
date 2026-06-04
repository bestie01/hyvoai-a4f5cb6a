import { DraftStream } from "@/lib/draftStream";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SmartImage } from "@/components/ui/SmartImage";

interface Props {
  draft: DraftStream;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

export function ReviewStep({ draft }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <GlassPanel variant="raised" className="p-5 md:col-span-1">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Preview</div>
        {draft.thumbnailDataUrl ? (
          <SmartImage src={draft.thumbnailDataUrl} alt="" aspectRatio="16/9" />
        ) : (
          <div className="rounded-xl aspect-video bg-gradient-to-br from-[hsl(var(--neon-violet))/0.25] to-[hsl(var(--neon-cyan))/0.15] border border-white/10 grid place-items-center text-white/40 text-sm">
            No thumbnail
          </div>
        )}
        <div className="mt-4">
          <div className="text-white font-semibold leading-tight">{draft.title || "Untitled stream"}</div>
          <div className="text-xs text-white/50 mt-1">{draft.category || "No category"}</div>
        </div>
      </GlassPanel>

      <GlassPanel variant="raised" className="p-5 md:col-span-2">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Summary</div>
        <Row label="Title" value={draft.title || "—"} />
        <Row label="Category" value={draft.category || "—"} />
        <Row label="Tags" value={draft.tags.length ? draft.tags.join(", ") : "—"} />
        <Row label="Schedule" value={draft.scheduled ? new Date(draft.scheduledAt || Date.now()).toLocaleString() : "Go live now"} />
        <Row label="Quality" value={`${draft.quality} @ ${draft.fps} fps`} />
        <Row label="Bitrate" value={`${draft.bitrate} kbps`} />
        <Row label="Platforms" value={draft.platforms.join(", ") || "—"} />
      </GlassPanel>
    </div>
  );
}
