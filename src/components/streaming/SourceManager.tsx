import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Camera,
  Monitor,
  Mic,
  Image,
  Type,
  Video,
  Plus,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  GripVertical
} from "lucide-react";

interface Source {
  id: string;
  name: string;
  type: 'camera' | 'display' | 'audio' | 'image' | 'text' | 'video';
  enabled: boolean;
  visible: boolean;
  order: number;
}

const sourceIcons = {
  camera: Camera,
  display: Monitor,
  audio: Mic,
  image: Image,
  text: Type,
  video: Video
};

export const SourceManager = ({ onAddSource }: { onAddSource?: (type: string) => void }) => {
  const [sources, setSources] = useState<Source[]>([
    { id: "1", name: "Webcam", type: "camera", enabled: true, visible: true, order: 1 },
    { id: "2", name: "Game Capture", type: "display", enabled: true, visible: true, order: 2 },
    { id: "3", name: "Microphone", type: "audio", enabled: true, visible: true, order: 3 },
    { id: "4", name: "Overlay Image", type: "image", enabled: false, visible: true, order: 4 },
    { id: "5", name: "Stream Title", type: "text", enabled: true, visible: true, order: 5 },
  ]);

  const toggleSource = (id: string) => {
    setSources(sources.map(source =>
      source.id === id ? { ...source, enabled: !source.enabled } : source
    ));
  };

  const toggleVisibility = (id: string) => {
    setSources(sources.map(source =>
      source.id === id ? { ...source, visible: !source.visible } : source
    ));
  };

  const deleteSource = (id: string) => {
    setSources(sources.filter(source => source.id !== id));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5 text-primary" />
            Sources
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onAddSource?.('camera')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sources.map((source, index) => {
          const Icon = sourceIcons[source.type];
          
          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${source.enabled 
                  ? 'border-border bg-card hover:bg-muted/50' 
                  : 'border-border bg-muted/30 opacity-60'
                }
              `}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </Button>

              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{source.name}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {source.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleVisibility(source.id)}
                >
                  {source.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                <Switch
                  checked={source.enabled}
                  onCheckedChange={() => toggleSource(source.id)}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteSource(source.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const Layers = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
