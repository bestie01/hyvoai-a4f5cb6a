import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Camera, 
  Mic, 
  Monitor, 
  Settings, 
  MessageSquare,
  Users,
  BarChart3,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { LiquidGlassCard } from "./ui/liquid-glass-card";

interface DemoFeature {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  position: { top: string; left: string };
}

const features: DemoFeature[] = [
  {
    id: "stream",
    icon: <Play className="h-4 w-4" />,
    label: "Go Live",
    description: "Start streaming to multiple platforms with one click",
    position: { top: "15%", left: "10%" },
  },
  {
    id: "camera",
    icon: <Camera className="h-4 w-4" />,
    label: "Camera",
    description: "Switch between cameras and apply AI backgrounds",
    position: { top: "30%", left: "5%" },
  },
  {
    id: "audio",
    icon: <Mic className="h-4 w-4" />,
    label: "Audio",
    description: "Professional audio mixer with noise suppression",
    position: { top: "45%", left: "8%" },
  },
  {
    id: "scenes",
    icon: <Monitor className="h-4 w-4" />,
    label: "Scenes",
    description: "Quick scene switching with smooth transitions",
    position: { top: "60%", left: "10%" },
  },
  {
    id: "chat",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "Live Chat",
    description: "Unified chat from all platforms with AI moderation",
    position: { top: "20%", left: "85%" },
  },
  {
    id: "viewers",
    icon: <Users className="h-4 w-4" />,
    label: "Viewers",
    description: "Real-time viewer count and engagement metrics",
    position: { top: "40%", left: "88%" },
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    label: "Analytics",
    description: "Live performance insights and recommendations",
    position: { top: "60%", left: "85%" },
  },
  {
    id: "ai",
    icon: <Sparkles className="h-4 w-4" />,
    label: "AI Tools",
    description: "AI-powered captions, highlights, and thumbnails",
    position: { top: "75%", left: "50%" },
  },
];

export const InteractiveDemo = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Demo Container */}
      <LiquidGlassCard className="relative aspect-video overflow-hidden">
        {/* Simulated Dashboard Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Live indicator */}
          <AnimatePresence>
            {isLive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                <span className="font-bold text-sm">LIVE</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulated preview */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border border-border/50 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-2"
              >
                🎮
              </motion.div>
              <p className="text-muted-foreground text-sm">Stream Preview</p>
            </div>
          </div>
        </div>

        {/* Interactive Hotspots */}
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            className="absolute"
            style={{ top: feature.position.top, left: feature.position.left }}
            onHoverStart={() => setActiveFeature(feature.id)}
            onHoverEnd={() => setActiveFeature(null)}
          >
            <motion.button
              className={`relative p-3 rounded-full transition-colors ${
                activeFeature === feature.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-foreground hover:bg-primary/20"
              } backdrop-blur-sm border border-border shadow-lg`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {feature.icon}
              
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {activeFeature === feature.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-background/95 backdrop-blur-md rounded-lg shadow-xl border border-border z-10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {feature.icon}
                    <span className="font-semibold text-sm">{feature.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Demo Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <Button
            variant={isLive ? "destructive" : "hero"}
            size="lg"
            onClick={() => setIsLive(!isLive)}
            className="gap-2"
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? "End Stream" : "Go Live"}
          </Button>
          <Button variant="outline" size="lg">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </LiquidGlassCard>

      {/* Instructions */}
      <p className="text-center text-muted-foreground text-sm mt-4">
        Hover over the buttons to explore features
      </p>
    </div>
  );
};
