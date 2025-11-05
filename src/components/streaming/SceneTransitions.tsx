import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  Play,
  Plus,
  Settings,
  Copy,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { ScenePreview } from "./ScenePreview";

interface Scene {
  id: number;
  name: string;
  active: boolean;
  visible: boolean;
  sources: number;
  transition: string;
}

export const SceneTransitions = () => {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 1, name: "Main Gaming", active: true, visible: true, sources: 4, transition: "Fade" },
    { id: 2, name: "Just Chatting", active: false, visible: true, sources: 3, transition: "Cut" },
    { id: 3, name: "BRB Screen", active: false, visible: true, sources: 2, transition: "Slide" },
    { id: 4, name: "Starting Soon", active: false, visible: true, sources: 2, transition: "Fade" },
  ]);

  const switchScene = (id: number) => {
    setScenes(scenes.map(scene => ({
      ...scene,
      active: scene.id === id
    })));
  };

  const toggleVisibility = (id: number) => {
    setScenes(scenes.map(scene =>
      scene.id === id ? { ...scene, visible: !scene.visible } : scene
    ));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5 text-primary" />
            Scenes
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scene Preview Grid */}
        <ScenePreview 
          scenes={scenes.map(s => ({ id: s.id, name: s.name, active: s.active }))} 
          onSceneChange={switchScene}
        />

        {/* Scene List with Controls */}
        <div className="space-y-2">
          {scenes.map((scene, index) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-3 rounded-lg border-2 transition-all
                ${scene.active 
                  ? 'border-primary bg-primary/10 shadow-glow-primary' 
                  : 'border-border bg-muted/30 hover:bg-muted/50'
                }
              `}
            >
              <div className="flex items-center gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleVisibility(scene.id)}
                >
                  {scene.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <p className="font-semibold text-sm">{scene.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs py-0">
                      {scene.sources} sources
                    </Badge>
                    <Badge variant="outline" className="text-xs py-0">
                      {scene.transition}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => switchScene(scene.id)}
                  disabled={scene.active}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
