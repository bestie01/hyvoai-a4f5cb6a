import { useState, useEffect } from "react";
import { Plus, Trash2, Power, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMultiStream } from "@/hooks/useMultiStream";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const PLATFORMS = [
  { value: 'twitch', label: 'Twitch', rtmpDefault: 'rtmp://live.twitch.tv/app/' },
  { value: 'youtube', label: 'YouTube', rtmpDefault: 'rtmp://a.rtmp.youtube.com/live2/' },
  { value: 'facebook', label: 'Facebook', rtmpDefault: 'rtmps://live-api-s.facebook.com:443/rtmp/' },
  { value: 'kick', label: 'Kick', rtmpDefault: 'rtmp://stream.kick.com/app/' },
  { value: 'tiktok', label: 'TikTok', rtmpDefault: 'rtmp://push.live.tiktok.com/live/' },
];

export function MultiStreamConfig() {
  const { configs, loading, fetchConfigs, addConfig, toggleConfig, startMultiStream } = useMultiStream();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleAddConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const platform = PLATFORMS.find(p => p.value === selectedPlatform);

    await addConfig({
      platform: selectedPlatform,
      streamKey: formData.get('streamKey') as string,
      rtmpUrl: formData.get('rtmpUrl') as string || platform?.rtmpDefault || '',
      streamTitle: formData.get('streamTitle') as string || undefined,
      streamDescription: formData.get('streamDescription') as string || undefined,
    });

    setDialogOpen(false);
    e.currentTarget.reset();
    setSelectedPlatform("");
  };

  const enabledCount = configs.filter(c => c.isEnabled).length;

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Multi-Platform Streaming</CardTitle>
            <CardDescription>
              Stream simultaneously to multiple platforms
              {enabledCount > 0 && ` • ${enabledCount} active`}
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-glow">
                <Plus className="mr-2 h-4 w-4" />
                Add Platform
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Add Streaming Platform</DialogTitle>
                <DialogDescription>
                  Configure a new platform for multi-streaming
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddConfig} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlatform && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stream Key</label>
                      <Input
                        name="streamKey"
                        type="password"
                        placeholder="Your stream key"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">RTMP URL (Optional)</label>
                      <Input
                        name="rtmpUrl"
                        placeholder={PLATFORMS.find(p => p.value === selectedPlatform)?.rtmpDefault}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stream Title</label>
                      <Input name="streamTitle" placeholder="Optional" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input name="streamDescription" placeholder="Optional" />
                    </div>

                    <Button type="submit" className="w-full">Add Platform</Button>
                  </>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : configs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Power className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No platforms configured yet</p>
            <p className="text-sm mt-2">Add platforms to start multi-streaming</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.isEnabled}
                        onCheckedChange={() => toggleConfig(config.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{config.platform}</span>
                          {config.isEnabled && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        {config.streamTitle && (
                          <p className="text-sm text-muted-foreground mt-1">{config.streamTitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {enabledCount > 0 && (
              <Button onClick={startMultiStream} className="w-full btn-glow">
                <Power className="mr-2 h-4 w-4" />
                Start Multi-Stream ({enabledCount} platforms)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}