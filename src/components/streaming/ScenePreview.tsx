import { motion } from "framer-motion";
import { Monitor, Check } from "lucide-react";

interface Scene {
  id: number;
  name: string;
  active: boolean;
}

interface ScenePreviewProps {
  scenes: Scene[];
  onSceneChange?: (id: number) => void;
  className?: string;
}

export const ScenePreview = ({ 
  scenes, 
  onSceneChange,
  className = "" 
}: ScenePreviewProps) => {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {scenes.map((scene, index) => (
        <motion.button
          key={scene.id}
          onClick={() => onSceneChange?.(scene.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative aspect-video rounded-lg overflow-hidden
            border-2 transition-colors
            ${scene.active 
              ? "border-primary shadow-glow-primary" 
              : "border-border hover:border-primary/50"
            }
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-muted-foreground" />
          </div>
          
          {scene.active && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
            <p className="text-xs font-medium text-foreground truncate">
              {scene.name}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
