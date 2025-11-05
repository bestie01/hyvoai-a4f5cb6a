import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Camera, Radio } from "lucide-react";
import { LiveBadge } from "@/components/animations/LiveBadge";

interface StreamPreviewProps {
  isLive: boolean;
  viewers?: number;
  streamRef: React.RefObject<MediaStream | null>;
  resolution: { width: number; height: number };
  fps: number;
  className?: string;
}

export const StreamPreview = ({
  isLive,
  viewers,
  streamRef,
  resolution,
  fps,
  className = ""
}: StreamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.muted = true;
      videoRef.current.play().catch(console.error);
    }
  }, [streamRef]);

  return (
    <Card className={`glass-card overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="w-5 h-5 text-primary" />
            Stream Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLive && <LiveBadge viewers={viewers} />}
            <Badge variant="outline" className="font-mono text-xs">
              {resolution.width}x{resolution.height} @ {fps}fps
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-video bg-gradient-to-br from-background via-muted/50 to-background rounded-lg overflow-hidden border border-border"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
          />
          
          {!streamRef.current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/50 backdrop-blur-sm">
              <Camera className="w-16 h-16 text-muted-foreground/50" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-foreground">No Active Source</p>
                <p className="text-sm text-muted-foreground">
                  Add a camera or display capture to start
                </p>
              </div>
            </div>
          )}

          {/* Recording indicator */}
          {streamRef.current && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-3 right-3"
            >
              <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-full border border-border">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Radio className="w-4 h-4 text-destructive fill-destructive" />
                </motion.div>
                <span className="text-xs font-medium">RECORDING</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};
