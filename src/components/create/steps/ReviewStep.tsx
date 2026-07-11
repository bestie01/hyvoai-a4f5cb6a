import { DraftStream } from "@/lib/draftStream";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SmartImage } from "@/components/ui/SmartImage";
import { CheckCircle2, AlertCircle, Radio, Calendar, Image as ImageIcon, Tag } from "lucide-react";

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

function Check({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
      )}
      <div className="min-w-0">
        <div className="text-sm text-white leading-tight">{label}</div>
        {hint && <div className="text-[11px] text-white/40 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export function ReviewStep({ draft }: Props) {
  const hasTitle = draft.title.trim().length > 2;
  const hasThumb = !!draft.thumbnailDataUrl;
  const hasPlatform = draft.platforms.length > 0;
  const hasCategory = !!draft.category;
  const hasTags = draft.tags.length > 0;
  const readyCount = [hasTitle, hasThumb, hasPlatform, hasCategory].filter(Boolean).length;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <GlassPanel variant="raised" className="p-5 md:col-span-1">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Preview</div>
        {draft.thumbnailDataUrl ? (
          <SmartImage src={draft.thumbnailDataUrl} alt="" aspectRatio="16/9" />
        ) : (
          <div className="rounded-xl aspect-video bg-gradient-to-br from-[hsl(var(--neon-violet))/0.25] to-[hsl(var(--neon-cyan))/0.15] border border-white/10 grid place-items-center text-white/40 text-sm">
            <div className="text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-60" />
              No thumbnail
            </div>
          </div>
        )}
        <div className="mt-4">
          <div className="text-white font-semibold leading-tight">{draft.title || "Untitled stream"}</div>
          <div className="text-xs text-white/50 mt-1">{draft.category || "No category"}</div>
          {draft.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {draft.tags.slice(0, 6).map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70">
                  <Tag className="w-2.5 h-2.5 inline mr-1" />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>

      <div className="md:col-span-2 space-y-4">
        <GlassPanel variant="raised" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-widest text-white/40">Launch readiness</div>
            <div className="text-[11px] text-white/50">{readyCount}/4 ready</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Check ok={hasTitle} label="Stream title" hint={hasTitle ? undefined : "Add a title before launching."} />
            <Check ok={hasPlatform} label="Destination platform" hint={hasPlatform ? draft.platforms.join(", ") : "Pick at least one platform."} />
            <Check ok={hasThumb} label="Thumbnail" hint={hasThumb ? undefined : "Optional but recommended for CTR."} />
            <Check ok={hasCategory} label="Category" hint={hasCategory ? draft.category : "Helps discovery — add one."} />
            <Check ok={hasTags} label="Tags" hint={hasTags ? `${draft.tags.length} tag${draft.tags.length === 1 ? "" : "s"}` : "Optional — improves reach."} />
            <Check
              ok={draft.scheduled ? !!draft.scheduledAt : true}
              label={draft.scheduled ? "Scheduled time" : "Instant go-live"}
              hint={draft.scheduled ? new Date(draft.scheduledAt || Date.now()).toLocaleString() : "Will launch on demand."}
            />
          </div>
        </GlassPanel>

        <GlassPanel variant="raised" className="p-5">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-3">Summary</div>
          <Row label="Title" value={draft.title || "—"} />
          <Row label="Category" value={draft.category || "—"} />
          <Row label="Tags" value={draft.tags.length ? draft.tags.join(", ") : "—"} />
          <Row
            label="Schedule"
            value={
              <span className="flex items-center gap-1.5 justify-end">
                {draft.scheduled ? <Calendar className="w-3 h-3 text-primary" /> : <Radio className="w-3 h-3 text-emerald-400" />}
                {draft.scheduled ? new Date(draft.scheduledAt || Date.now()).toLocaleString() : "Go live now"}
              </span>
            }
          />
          <Row label="Quality" value={`${draft.quality} @ ${draft.fps} fps`} />
          <Row label="Bitrate" value={`${draft.bitrate.toLocaleString()} kbps`} />
          <Row label="Platforms" value={draft.platforms.join(", ") || "—"} />
        </GlassPanel>
      </div>
    </div>
  );
}
