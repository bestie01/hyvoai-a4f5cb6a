import { useState, useEffect } from "react";
import { Plus, Trash2, Star, Keyboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Scene {
  id: string;
  name: string;
  config: any;
  thumbnailUrl?: string;
  isDefault: boolean;
  hotkey?: string;
}

export function SceneManager() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stream_scenes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setScenes(data.map(scene => ({
        id: scene.id,
        name: scene.name,
        config: scene.config,
        thumbnailUrl: scene.thumbnail_url || undefined,
        isDefault: scene.is_default,
        hotkey: scene.hotkey || undefined,
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load scenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createScene = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('stream_scenes')
        .insert([{
          user_id: user.id,
          name: formData.get('name') as string,
          hotkey: formData.get('hotkey') as string || null,
          config: {},
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scene created successfully",
      });

      setDialogOpen(false);
      loadScenes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create scene",
        variant: "destructive",
      });
    }
  };

  const deleteScene = async (sceneId: string) => {
    try {
      const { error } = await supabase
        .from('stream_scenes')
        .delete()
        .eq('id', sceneId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scene deleted",
      });

      loadScenes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete scene",
        variant: "destructive",
      });
    }
  };

  const setDefaultScene = async (sceneId: string) => {
    try {
      await supabase
        .from('stream_scenes')
        .update({ is_default: false })
        .neq('id', sceneId);

      const { error } = await supabase
        .from('stream_scenes')
        .update({ is_default: true })
        .eq('id', sceneId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default scene updated",
      });

      loadScenes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to set default scene",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scene Manager</CardTitle>
            <CardDescription>Create and manage your stream scenes</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow">
                <Plus className="mr-2 h-4 w-4" />
                New Scene
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Create New Scene</DialogTitle>
                <DialogDescription>
                  Add a new scene configuration to your stream
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createScene} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scene Name</label>
                  <Input name="name" placeholder="e.g., Starting Soon" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hotkey (Optional)</label>
                  <Input name="hotkey" placeholder="e.g., F1, Ctrl+1" />
                </div>

                <Button type="submit" className="w-full">Create Scene</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : scenes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scenes yet</p>
            <p className="text-sm mt-2">Create your first scene to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <div key={scene.id} className="glass p-4 rounded-lg group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{scene.name}</h4>
                      {scene.isDefault && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {scene.hotkey && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Keyboard className="h-3 w-3" />
                        {scene.hotkey}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!scene.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultScene(scene.id)}
                      className="flex-1"
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteScene(scene.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}