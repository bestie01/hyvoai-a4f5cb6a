import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, RefreshCw, Eye, EyeOff, Radio, Server, Key, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useToast } from "@/hooks/use-toast";
import { RTMP_INGEST } from "@/lib/constants";

const KEY_LS = "hyvo.streamKey";

function genKey() {
  const id = (crypto as any).randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `hyvo_live_${id.replace(/-/g, "")}`;
}

export function IngestPanel() {
  const { toast } = useToast();
  const [streamKey, setStreamKey] = useState<string>("");
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    let k = localStorage.getItem(KEY_LS);
    if (!k) {
      k = genKey();
      localStorage.setItem(KEY_LS, k);
    }
    setStreamKey(k);
  }, []);

  const regenerate = () => {
    const k = genKey();
    localStorage.setItem(KEY_LS, k);
    setStreamKey(k);
    toast({ title: "Stream key rotated", description: "Update OBS with the new key." });
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const copyAll = () => {
    const block = `Server: ${RTMP_INGEST.serverUrl}\nStream Key: ${streamKey}`;
    copy(block, "OBS config");
  };

  const masked = streamKey ? `${streamKey.slice(0, 10)}${"•".repeat(18)}` : "";

  return (
    <GlassPanel variant="raised" className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-display font-semibold text-white">RTMP Ingest</div>
            <div className="text-xs text-white/50">Point OBS, Streamlabs, or any RTMP encoder here.</div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-400/30 text-emerald-300 bg-emerald-400/10">
          Dev mode
        </span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> Server URL
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={RTMP_INGEST.serverUrl}
              className="bg-white/[0.04] border-white/10 font-mono text-sm"
            />
            <Button variant="outline" size="icon" className="liquid-glass-button" onClick={() => copy(RTMP_INGEST.serverUrl, "Server URL")}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/60 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Stream Key
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={reveal ? streamKey : masked}
              className="bg-white/[0.04] border-white/10 font-mono text-sm"
            />
            <Button variant="outline" size="icon" className="liquid-glass-button" onClick={() => setReveal((v) => !v)}>
              {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" className="liquid-glass-button" onClick={() => copy(streamKey, "Stream key")}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="liquid-glass-button" onClick={regenerate}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={copyAll}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-[hsl(var(--neon-violet))]/20 border border-primary/30 text-white font-medium hover:from-primary/30 hover:to-[hsl(var(--neon-violet))]/30 transition-all"
      >
        <CheckCircle2 className="w-4 h-4" />
        Copy OBS Quick-Setup
      </motion.button>
    </GlassPanel>
  );
}
