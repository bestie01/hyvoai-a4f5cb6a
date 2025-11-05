import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamAnalytics } from "@/components/StreamAnalytics";
import { StreamPreview } from "@/components/streaming/StreamPreview";
import { ProfessionalAudioMixer } from "@/components/streaming/ProfessionalAudioMixer";
import { SceneTransitions } from "@/components/streaming/SceneTransitions";
import { SourceManager } from "@/components/streaming/SourceManager";
import { useWebRTCStream } from "@/hooks/useWebRTCStream";
import { StreamHealthMonitor } from "@/components/StreamHealthMonitor";
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
  Circle,
  Twitch,
  MicOff,
  Youtube,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useTwitchStream } from "@/hooks/useTwitchStream";
import { useYouTubeStream } from "@/hooks/useYouTubeStream";
import { useAuth } from "@/hooks/useAuth";
import { useHaptics } from "@/hooks/useHaptics";
import { useStatusBar } from "@/hooks/useStatusBar";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ImpactStyle, NotificationType } from '@capacitor/haptics';
import { PollCreator } from "@/components/PollCreator";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AIChatAnalysis } from "@/components/ai/AIChatAnalysis";
import { AIHighlights } from "@/components/ai/AIHighlights";
import { AIVoiceAssistant } from "@/components/ai/AIVoiceAssistant";
import { AICaptionOverlay } from "@/components/ai/AICaptionOverlay";
import { AIGameCoach } from "@/components/ai/AIGameCoach";
import { ProFeatureGate } from "@/components/ProFeatureGate";

const StreamingApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const haptics = useHaptics();
  const statusBar = useStatusBar();
  const notifications = usePushNotifications();
  
  const [streamTime, setStreamTime] = useState("00:00:00");
  const [activeStream, setActiveStream] = useState<'twitch' | 'youtube' | null>(null);
  
  // Stream connection states
  const [twitchStreamKey, setTwitchStreamKey] = useState("");
  const [youtubeStreamKey, setYoutubeStreamKey] = useState("");
  const [streamTitle, setStreamTitle] = useState("Live Stream from Hyvo.ai");
  const [streamDescription, setStreamDescription] = useState("Streaming live with Hyvo.ai Studio");
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  
  // Use custom hooks
  const microphone = useMicrophone();
  const twitch = useTwitchStream();
  const youtube = useYouTubeStream();
  const webrtc = useWebRTCStream();
  
  const [captureStats, setCaptureStats] = useState({
    resolution: { width: 1920, height: 1080 },
    fps: 30
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
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
    // Stream timer
    const isStreaming = twitch.isStreaming || youtube.isStreaming;
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
    } else {
      setStreamTime("00:00:00");
    }
  }, [twitch.isStreaming, youtube.isStreaming]);

  const handleConnectToPlatform = async (platform: 'twitch' | 'youtube') => {
    await haptics.impact(ImpactStyle.Medium);
    const streamKey = platform === 'twitch' ? twitchStreamKey : youtubeStreamKey;
    
    if (!streamKey.trim()) {
      toast({
        title: "Missing Stream Key",
        description: `Please enter your ${platform} stream key`,
        variant: "destructive",
      });
      return;
    }

    let success = false;
    if (platform === 'twitch') {
      success = await twitch.connectToTwitch(streamKey, streamTitle);
    } else {
      success = await youtube.connectToYouTube(streamKey, streamTitle, streamDescription, privacy);
    }
    
    if (success) {
      setActiveStream(platform);
      setIsConnectDialogOpen(false);
      await haptics.notification(NotificationType.Success);
      await notifications.sendLocalNotification(
        'Connected!',
        `Successfully connected to ${platform}`
      );
    }
  };

  const handleStartStream = async () => {
    await haptics.impact(ImpactStyle.Heavy);
    
    if (!twitch.isConnected && !youtube.isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to a streaming platform first",
        variant: "destructive",
      });
      return;
    }

    if (activeStream === 'twitch') {
      if (twitch.isStreaming) {
        await twitch.stopStream();
        await haptics.notification(NotificationType.Warning);
      } else {
        await twitch.startStream();
        await haptics.notification(NotificationType.Success);
        await notifications.sendLocalNotification(
          'Stream Started!',
          'Your Twitch stream is now live!'
        );
      }
    } else if (activeStream === 'youtube') {
      if (youtube.isStreaming) {
        await youtube.stopStream();
        await haptics.notification(NotificationType.Warning);
      } else {
        await youtube.startStream();
        await haptics.notification(NotificationType.Success);
        await notifications.sendLocalNotification(
          'Stream Started!',
          'Your YouTube stream is now live!'
        );
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleMicrophoneToggle = async () => {
    await haptics.impact(ImpactStyle.Light);
    
    if (microphone.isRecording) {
      microphone.stopRecording();
    } else {
      if (!microphone.isPermissionGranted) {
        await microphone.requestPermission();
      }
      await microphone.startRecording();
    }
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
              <Badge variant={
                (twitch.isStreaming || youtube.isStreaming) ? "default" : 
                (twitch.isConnected || youtube.isConnected) ? "secondary" : 
                "outline"
              }>
                {(twitch.isStreaming || youtube.isStreaming) ? "LIVE" : 
                 (twitch.isConnected || youtube.isConnected) ? `CONNECTED (${activeStream?.toUpperCase()})` : 
                 "OFFLINE"}
              </Badge>
              {user && (
                <div className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {(twitch.isStreaming || youtube.isStreaming) && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{activeStream === 'twitch' ? twitch.viewers : youtube.viewers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Live: {streamTime}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {!twitch.isConnected && !youtube.isConnected ? (
                  <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Zap className="w-4 h-4" />
                        Connect Platform
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Connect Streaming Platform</DialogTitle>
                        <DialogDescription>
                          Choose your streaming platform and enter your stream key to start broadcasting.
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="twitch" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="twitch" className="gap-2">
                            <Twitch className="w-4 h-4" />
                            Twitch
                          </TabsTrigger>
                          <TabsTrigger value="youtube" className="gap-2">
                            <Youtube className="w-4 h-4" />
                            YouTube
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="twitch" className="space-y-4">
                          <div>
                            <Label htmlFor="twitchKey">Twitch Stream Key</Label>
                            <Input
                              id="twitchKey"
                              type="password"
                              placeholder="Enter your Twitch stream key..."
                              value={twitchStreamKey}
                              onChange={(e) => setTwitchStreamKey(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="streamTitle">Stream Title</Label>
                            <Input
                              id="streamTitle"
                              placeholder="Enter stream title..."
                              value={streamTitle}
                              onChange={(e) => setStreamTitle(e.target.value)}
                            />
                          </div>
                          <Button onClick={() => handleConnectToPlatform('twitch')} className="w-full">
                            Connect to Twitch
                          </Button>
                        </TabsContent>
                        
                        <TabsContent value="youtube" className="space-y-4">
                          <div>
                            <Label htmlFor="youtubeKey">YouTube Stream Key</Label>
                            <Input
                              id="youtubeKey"
                              type="password"
                              placeholder="Enter your YouTube stream key..."
                              value={youtubeStreamKey}
                              onChange={(e) => setYoutubeStreamKey(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="youtubeTitle">Stream Title</Label>
                            <Input
                              id="youtubeTitle"
                              placeholder="Enter stream title..."
                              value={streamTitle}
                              onChange={(e) => setStreamTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="youtubeDesc">Description</Label>
                            <Input
                              id="youtubeDesc"
                              placeholder="Stream description..."
                              value={streamDescription}
                              onChange={(e) => setStreamDescription(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="privacy">Privacy</Label>
                            <Select value={privacy} onValueChange={(value: 'public' | 'unlisted' | 'private') => setPrivacy(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={() => handleConnectToPlatform('youtube')} className="w-full">
                            Connect to YouTube
                          </Button>
                        </TabsContent>
                      </Tabs>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    variant={(twitch.isStreaming || youtube.isStreaming) ? "destructive" : "default"}
                    onClick={handleStartStream}
                    className="gap-2"
                  >
                    {(twitch.isStreaming || youtube.isStreaming) ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {(twitch.isStreaming || youtube.isStreaming) ? "Stop Stream" : "Start Stream"}
                  </Button>
                )}
                
                <Button
                  variant={microphone.isRecording ? "default" : "outline"}
                  onClick={handleMicrophoneToggle}
                  className="gap-2"
                >
                  {microphone.isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  {microphone.isRecording ? "Mic On" : "Mic Off"}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Studio Layout */}
        <div className="flex-1 flex gap-4 p-4">
          {/* Left Panel - Scenes & Sources */}
          <div className="w-80 space-y-4">
            <SceneTransitions />
            <SourceManager onAddSource={(type) => {
              if (type === 'camera') {
                webrtc.startCapture('camera');
              } else if (type === 'display') {
                webrtc.startCapture('screen');
              }
            }} />
          </div>

          {/* Center - Preview & Audio */}
          <div className="flex-1 space-y-4">
            {/* Stream Preview */}
            <StreamPreview
              isLive={twitch.isStreaming || youtube.isStreaming}
              viewers={activeStream === 'twitch' ? twitch.viewers : youtube.viewers}
              streamRef={webrtc.streamRef}
              resolution={captureStats.resolution}
              fps={captureStats.fps}
            />
            
            {/* Audio Mixer */}
            <ProfessionalAudioMixer />
          </div>

          {/* Right Panel - Analytics & Health */}
          <div className="w-96 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {/* Stream Health Monitor */}
            <StreamHealthMonitor />
            
            {/* Stream Analytics */}
            {(twitch.isStreaming || youtube.isStreaming) && (
              <StreamAnalytics
                viewers={activeStream === 'twitch' ? twitch.viewers : youtube.viewers}
                streamTime={streamTime}
                isStreaming={twitch.isStreaming || youtube.isStreaming}
              />
            )}

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

      {/* Chat & Polls Panel */}
      <div className="w-80 border-l border-border flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Zap className="w-4 h-4" />
                AI
              </TabsTrigger>
              <TabsTrigger value="polls" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Polls
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
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
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {(twitch.isStreaming || youtube.isStreaming) ? 
                  `${activeStream === 'twitch' ? twitch.viewers : youtube.viewers} viewers watching` : 
                  "Start streaming to see chat"}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="flex-1 flex flex-col m-0 overflow-y-auto">
            <ProFeatureGate 
              feature="AI-Powered Tools"
              description="Unlock AI chat analysis, highlights, voice assistant, live captions, and game coaching with Pro."
              showUpgrade={true}
            >
              <Tabs defaultValue="insights" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="voice">Voice</TabsTrigger>
                    <TabsTrigger value="captions">Captions</TabsTrigger>
                    <TabsTrigger value="coach">Coach</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="insights" className="flex-1 p-4 space-y-4 overflow-y-auto">
                <AIChatAnalysis 
                  messages={chatMessages.map(msg => ({ 
                    username: msg.user, 
                    message: msg.message, 
                    timestamp: msg.timestamp 
                  }))} 
                  streamId={activeStream || 'demo-stream'}
                  platform={activeStream || 'twitch'}
                />
                <AIHighlights 
                  streamData={{
                    id: activeStream || 'demo-stream',
                    duration: streamTime,
                    viewers: activeStream === 'twitch' ? twitch.viewers : youtube.viewers,
                    category: 'Gaming'
                  }}
                  chatMessages={chatMessages.map(msg => ({ 
                    username: msg.user, 
                    message: msg.message, 
                    timestamp: msg.timestamp 
                  }))}
                  audioLevels={[]}
                />
              </TabsContent>
              
              <TabsContent value="voice" className="flex-1 p-4 overflow-y-auto">
                <AIVoiceAssistant />
              </TabsContent>
              
              <TabsContent value="captions" className="flex-1 p-4 overflow-y-auto">
                <AICaptionOverlay />
              </TabsContent>
              
              <TabsContent value="coach" className="flex-1 p-4 overflow-y-auto">
                <AIGameCoach />
              </TabsContent>
              </Tabs>
            </ProFeatureGate>
          </TabsContent>

          <TabsContent value="polls" className="flex-1 flex flex-col m-0 p-4 overflow-y-auto">
            <PollCreator streamId={activeStream || 'demo-stream'} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StreamingApp;