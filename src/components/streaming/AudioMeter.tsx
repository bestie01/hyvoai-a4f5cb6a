import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

interface AudioMeterProps {
  level?: number; // 0-100
  label?: string;
  className?: string;
}

export const AudioMeter = ({ 
  level = 0, 
  label = "Audio",
  className = "" 
}: AudioMeterProps) => {
  const bars = 20;
  const activeBarCount = Math.floor((level / 100) * bars);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Volume2 className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        {label && (
          <div className="text-xs text-muted-foreground mb-1">{label}</div>
        )}
        <div className="flex gap-1 h-6 items-end">
          {Array.from({ length: bars }).map((_, i) => {
            const isActive = i < activeBarCount;
            const color = i < bars * 0.6 
              ? "bg-success" 
              : i < bars * 0.85 
              ? "bg-warning" 
              : "bg-destructive";
            
            return (
              <motion.div
                key={i}
                className={`flex-1 rounded-sm ${isActive ? color : "bg-muted"}`}
                initial={{ height: "20%" }}
                animate={{ 
                  height: isActive ? `${40 + Math.random() * 60}%` : "20%",
                  opacity: isActive ? 1 : 0.3
                }}
                transition={{ 
                  duration: 0.1,
                  ease: "easeOut"
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="font-mono text-xs text-muted-foreground w-10 text-right">
        {level}dB
      </div>
    </div>
  );
};
