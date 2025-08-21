import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Square, 
  Settings, 
  Monitor, 
  Mic, 
  Camera, 
  Users, 
  MessageSquare,
  Volume2,
  Eye,
  Heart,
  Share2,
  BarChart3,
  Layers,
  Filter,
  Palette,
  Zap,
  Circle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StreamingApp = () => {
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [viewers, setViewers] = useState(247);
  const [streamTime, setStreamTime] = useState("00:00:00");
  const [scenes] = useState([
    { id: 1, name: "Gaming Scene", active: true },
    { id: 2, name: "Just Chatting", active: false },
    { id: 3, name: "BRB Screen", active: false },
    { id: 4, name: "Starting Soon", active: false }
  ]);
  
  const [sources] = useState([
    { id: 1, name: "Desktop Capture", type: "display", enabled: true },
    { id: 2, name: "Webcam", type: "camera", enabled: true },
    { id: 3, name: "Microphone", type: "audio", enabled: true },
    { id: 4, name: "Game Audio", type: "audio", enabled: true },
    { id: 5, name: "Chat Overlay", type: "overlay", enabled: false }
  ]);

  const [chatMessages] = useState([
    { id: 1, user: "StreamFan123", message: "Great stream! Keep it up!", timestamp: "12:34" },
    { id: 2, user: "GamerPro", message: "What's your setup?", timestamp: "12:35" },
    { id: 3, user: "ChatMod", message: "Welcome everyone!", timestamp: "12:36", mod: true },
    { id: 4, user: "NewViewer", message: "First time here, loving it!", timestamp: "12:37" }
  ]);

  useEffect(() => {
    // Simulate live viewer count changes
    if (isStreaming) {
      const interval = setInterval(() => {
        setViewers(prev => prev + Math.floor(Math.random() * 3) - 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  useEffect(() => {
    // Simulate stream timer
    if (isStreaming) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        setStreamTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  const handleStartStream = () => {
    setIsStreaming(!isStreaming);
    toast({
      title: isStreaming ? "Stream Stopped" : "Stream Started",
      description: isStreaming ? "Your stream has ended successfully" : "You're now live on Twitch!",
    });
  };

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Recording saved to your videos folder" : "Now recording your stream",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Hyvo.ai Studio
              </h1>
              <Badge variant={isStreaming ? "default" : "secondary"}>
                {isStreaming ? "LIVE" : "OFFLINE"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {isStreaming && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{viewers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Live: {streamTime}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant={isStreaming ? "destructive" : "default"}
                  onClick={handleStartStream}
                  className="gap-2"
                >
                  {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isStreaming ? "Stop Stream" : "Start Stream"}
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleStartRecording}
                  className="gap-2"
                >
                  <Circle className="w-4 h-4" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Studio Layout */}
        <div className="flex-1 flex">
          {/* Preview & Sources */}
          <div className="flex-1 flex flex-col p-4 gap-4">
            {/* Stream Preview */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Stream Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center space-y-4">
                    <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Stream Preview</p>
                      <p className="text-sm text-muted-foreground">
                        {isStreaming ? "Your stream is live!" : "Click 'Start Stream' to go live"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Mixer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Mixer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Microphone</span>
                      <Switch defaultChecked />
                    </div>
                    <Slider defaultValue={[75]} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop Audio</span>
                      <Switch defaultChecked />
                    </div>
                    <Slider defaultValue={[60]} max={100} step={1} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Scenes & Sources */}
          <div className="w-80 border-l border-border p-4 space-y-4">
            {/* Scenes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Scenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {scenes.map((scene) => (
                  <Button
                    key={scene.id}
                    variant={scene.active ? "default" : "outline"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    {scene.name}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  + Add Scene
                </Button>
              </CardContent>
            </Card>

            {/* Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      {source.type === 'display' && <Monitor className="w-4 h-4" />}
                      {source.type === 'camera' && <Camera className="w-4 h-4" />}
                      {source.type === 'audio' && <Mic className="w-4 h-4" />}
                      {source.type === 'overlay' && <Palette className="w-4 h-4" />}
                      <span className="text-sm">{source.name}</span>
                    </div>
                    <Switch checked={source.enabled} />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  + Add Source
                </Button>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Highlights</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chat Analysis</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart Overlays</span>
                  <Switch />
                </div>
                <Button size="sm" className="w-full">
                  AI Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-80 border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Live Chat
          </h3>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${msg.mod ? 'text-green-500' : 'text-primary'}`}>
                  {msg.user}
                </span>
                <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-foreground">{msg.message}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2 mb-3">
            <Button size="sm" variant="outline">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {isStreaming ? `${viewers} viewers watching` : "Start streaming to see chat"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingApp;