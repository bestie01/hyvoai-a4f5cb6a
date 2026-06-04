import { DraftStream } from "@/lib/draftStream";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface Props {
  draft: DraftStream;
  onChange: (patch: Partial<DraftStream>) => void;
}

export function MediaStep({ draft, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => onChange({ thumbnailDataUrl: String(r.result) });
    r.readAsDataURL(file);
  }, [onChange]);

  return (
    <GlassPanel variant="raised" className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-display font-semibold text-white mb-1">Thumbnail</h3>
        <p className="text-sm text-white/50">Drag & drop or click to upload. 16:9 recommended.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) readFile(f);
        }}
        onClick={() => fileRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-white/15 bg-white/[0.02] hover:border-white/30"
        }`}
        style={{ aspectRatio: "16/9" }}
      >
        {draft.thumbnailDataUrl ? (
          <>
            <SmartImage
              src={draft.thumbnailDataUrl}
              alt="Thumbnail preview"
              aspectRatio="16/9"
              className="rounded-xl"
            />
            <button
              onClick={(e) => { e.stopPropagation(); onChange({ thumbnailDataUrl: undefined }); }}
              className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-black/60 backdrop-blur border border-white/20 text-white hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/60">
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-white/[0.05] border border-white/10 grid place-items-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <div className="font-medium text-white">Drop image or click to browse</div>
              <div className="text-xs text-white/40 mt-1">PNG, JPG, WebP up to 8 MB</div>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readFile(f);
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="liquid-glass-button" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose file
        </Button>
        <div className="text-xs text-white/40">
          Tip: bold faces and high contrast outperform busy art.
        </div>
      </div>
    </GlassPanel>
  );
}
