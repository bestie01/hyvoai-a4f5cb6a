import { useState, useEffect, useRef } from "react";
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
import { RecordingControls } from "@/components/streaming/RecordingControls";
import { useWebRTCStream } from "@/hooks/useWebRTCStream";
import { useLocalRecording } from "@/hooks/useLocalRecording";
import { StreamHealthMonitor } from "@/components/StreamHealthMonitor";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LiveViewerStats } from "@/components/streaming/LiveViewerStats";
import { PlatformConnector } from "@/components/streaming/PlatformConnector";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { LiquidGlassCard, LiquidGlassNav } from "@/components/ui/liquid-glass-card";
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
import { LiveChatPanel } from "@/components/streaming/LiveChatPanel";
import { useLiveChat } from "@/hooks/useLiveChat";
import { HotkeyManager } from "@/components/streaming/HotkeyManager";

const StreamingApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const haptics = useHaptics();
  const statusBar = useStatusBar();
  const notifications = usePushNotifications();
  
  const [isAppLoading, setIsAppLoading] = useState(true);
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
  const localRecording = useLocalRecording();
  const liveChat = useLiveChat();
  const platformOAuth = usePlatformOAuth();
  
  const [captureStats, setCaptureStats] = useState({
    resolution: { width: 1920, height: 1080 },
    fps: 30
  });

  const [scenes, setScenes] = useState([
    { id: 1, name: "Gaming Scene", active: true },
    { id: 2, name: "Just Chatting", active: false },
    { id: 3, name: "BRB Screen", active: false },
    { id: 4, name: "Starting Soon", active: false }
  ]);
  
  const [sources, setSources] = useState([
    { id: 1, name: "Desktop Capture", type: "display", enabled: true },
    { id: 2, name: "Webcam", type: "camera", enabled: true },
    { id: 3, name: "Microphone", type: "audio", enabled: true },
    { id: 4, name: "Game Audio", type: "audio", enabled: true },
    { id: 5, name: "Chat Overlay", type: "overlay", enabled: false }
  ]);

  // AI feature states
  const [aiAutoHighlights, setAiAutoHighlights] = useState(false);
  const [aiChatAnalysis, setAiChatAnalysis] = useState(true);
  const [aiSmartOverlays, setAiSmartOverlays] = useState(false);

  // Recording handlers
  const handleStartRecording = async () => {
    if (webrtc.streamRef.current) {
      await localRecording.startRecording(webrtc.streamRef.current);
      toast({
        title: "Recording Started",
        description: "Your stream is being recorded locally",
      });
    } else {
      toast({
        title: "No Stream Active",
        description: "Start capturing video first to record",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    const blob = await localRecording.stopRecording();
    if (blob) {
      toast({
        title: "Recording Saved",
        description: "Click download to save your recording",
      });
    }
  };

  const handleDownloadRecording = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    localRecording.downloadRecording(`hyvo-recording-${timestamp}.webm`);
    toast({
      title: "Download Started",
      description: "Your recording is being downloaded",
    });
  };

  // Handle loading and auth redirect
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else {
        // Simulate loading for smooth transition
        const timer = setTimeout(() => setIsAppLoading(false), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authLoading, navigate]);

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

  // Show loading screen while app initializes
  if (authLoading || isAppLoading) {
    return <LoadingScreen message="Loading Studio..." />;
  }

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
    <div className="min-h-screen liquid-glass-bg flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls - Liquid Glass Nav */}
        <LiquidGlassNav sticky={true} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gradient-primary">
                Hyvo.ai Studio
              </h1>
              <Badge 
                variant={(twitch.isStreaming || youtube.isStreaming) ? "default" : 
                  (twitch.isConnected || youtube.isConnected) ? "secondary" : 
                  "outline"}
                className={(twitch.isStreaming || youtube.isStreaming) ? "bg-red-500 animate-pulse" : ""}
              >
                {(twitch.isStreaming || youtube.isStreaming) ? "● LIVE" : 
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
                  <div className="flex items-center gap-2 text-red-400">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{activeStream === 'twitch' ? twitch.viewers : youtube.viewers}</span>
                  </div>
                  <div className="flex items-center gap-2 liquid-glass-badge px-3 py-1">
                    <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
                    <span className="font-mono">{streamTime}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {!twitch.isConnected && !youtube.isConnected ? (
                  <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 liquid-glass-button bg-primary/20 border-primary/40 text-primary hover:bg-primary/30">
                        <Zap className="w-4 h-4" />
                        Connect Platform
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md liquid-glass-elevated border-white/10">
                      <DialogHeader>
                        <DialogTitle>Connect Streaming Platform</DialogTitle>
                        <DialogDescription>
                          Choose your streaming platform and enter your stream key to start broadcasting.
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="twitch" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 liquid-glass-panel">
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
                              className="liquid-glass-panel border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="streamTitle">Stream Title</Label>
                            <Input
                              id="streamTitle"
                              placeholder="Enter stream title..."
                              value={streamTitle}
                              onChange={(e) => setStreamTitle(e.target.value)}
                              className="liquid-glass-panel border-white/10"
                            />
                          </div>
                          <Button onClick={() => handleConnectToPlatform('twitch')} className="w-full bg-purple-600 hover:bg-purple-700">
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
                              className="liquid-glass-panel border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="youtubeTitle">Stream Title</Label>
                            <Input
                              id="youtubeTitle"
                              placeholder="Enter stream title..."
                              value={streamTitle}
                              onChange={(e) => setStreamTitle(e.target.value)}
                              className="liquid-glass-panel border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="youtubeDesc">Description</Label>
                            <Input
                              id="youtubeDesc"
                              placeholder="Stream description..."
                              value={streamDescription}
                              onChange={(e) => setStreamDescription(e.target.value)}
                              className="liquid-glass-panel border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="privacy">Privacy</Label>
                            <Select value={privacy} onValueChange={(value: 'public' | 'unlisted' | 'private') => setPrivacy(value)}>
                              <SelectTrigger className="liquid-glass-panel border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="liquid-glass-elevated border-white/10">
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={() => handleConnectToPlatform('youtube')} className="w-full bg-red-600 hover:bg-red-700">
                            Connect to YouTube
                          </Button>
                        </TabsContent>
                      </Tabs>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)} className="liquid-glass-button">
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
                  className={`gap-2 ${!microphone.isRecording ? 'liquid-glass-button' : ''}`}
                >
                  {microphone.isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  {microphone.isRecording ? "Mic On" : "Mic Off"}
                </Button>
                
                <HotkeyManager
                  onStartStream={handleStartStream}
                  onStopStream={handleStartStream}
                  onToggleMic={handleMicrophoneToggle}
                  isStreaming={twitch.isStreaming || youtube.isStreaming}
                  isRecording={localRecording.isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                />
                
                <Button variant="outline" size="icon" className="liquid-glass-button">
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="icon" onClick={handleSignOut} className="liquid-glass-button">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </LiquidGlassNav>

        {/* Main Studio Layout */}
        <div className="flex-1 flex gap-4 p-4">
          {/* Left Panel - Scenes & Sources */}
          <div className="w-80 space-y-4">
            <LiquidGlassCard variant="panel" hoverEffect={false} className="p-0">
              <SceneTransitions />
            </LiquidGlassCard>
            <LiquidGlassCard variant="panel" hoverEffect={false} className="p-0">
              <SourceManager onAddSource={(type) => {
                if (type === 'camera') {
                  webrtc.startCapture('camera');
                } else if (type === 'display') {
                  webrtc.startCapture('screen');
                }
              }} />
            </LiquidGlassCard>
          </div>

          {/* Center - Preview & Audio */}
          <div className="flex-1 space-y-4">
            {/* Stream Preview */}
            <LiquidGlassCard variant="elevated" hoverEffect={false} className="p-0 overflow-hidden">
              <StreamPreview
                isLive={twitch.isStreaming || youtube.isStreaming}
                viewers={activeStream === 'twitch' ? twitch.viewers : youtube.viewers}
                streamRef={webrtc.streamRef}
                resolution={captureStats.resolution}
                fps={captureStats.fps}
              />
            </LiquidGlassCard>
            
            {/* Recording Controls */}
            <LiquidGlassCard variant="panel" hoverEffect={false} className="p-4">
              <RecordingControls
                isRecording={localRecording.isRecording}
                isPaused={localRecording.isPaused}
                duration={localRecording.recordingDuration}
                hasRecording={localRecording.recordingDuration > 0 && !localRecording.isRecording}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onPause={localRecording.pauseRecording}
                onResume={localRecording.resumeRecording}
                onDownload={handleDownloadRecording}
                disabled={!webrtc.isCapturing}
              />
            </LiquidGlassCard>
            
            {/* Audio Mixer */}
            <LiquidGlassCard variant="panel" hoverEffect={false} className="p-0">
              <ProfessionalAudioMixer />
            </LiquidGlassCard>
          </div>

          {/* Right Panel - Analytics & Health */}
          <div className="w-96 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {/* Live Viewer Stats */}
            <LiquidGlassCard variant="default" hoverEffect={false} className="p-0">
              <LiveViewerStats 
                isStreaming={twitch.isStreaming || youtube.isStreaming}
                onConnectPlatform={(platform) => {
                  if (platform === 'twitch') {
                    platformOAuth.connectTwitch();
                  } else {
                    platformOAuth.connectYouTube();
                  }
                }}
              />
            </LiquidGlassCard>

            {/* Platform Connector */}
            <LiquidGlassCard variant="default" hoverEffect={false} className="p-0">
              <PlatformConnector />
            </LiquidGlassCard>

            {/* Stream Health Monitor */}
            <LiquidGlassCard variant="default" hoverEffect={false} className="p-0">
              <StreamHealthMonitor />
            </LiquidGlassCard>
            
            {/* Stream Analytics */}
            {(twitch.isStreaming || youtube.isStreaming) && (
              <LiquidGlassCard variant="glow-primary" hoverEffect={false} className="p-0">
                <StreamAnalytics
                  viewers={activeStream === 'twitch' ? twitch.viewers : youtube.viewers}
                  streamTime={streamTime}
                  isStreaming={twitch.isStreaming || youtube.isStreaming}
                />
              </LiquidGlassCard>
            )}

            {/* AI Features */}
            <LiquidGlassCard variant="glow-accent" className="p-0">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    AI Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Highlights</span>
                    <Switch checked={aiAutoHighlights} onCheckedChange={setAiAutoHighlights} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chat Analysis</span>
                    <Switch checked={aiChatAnalysis} onCheckedChange={setAiChatAnalysis} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Smart Overlays</span>
                    <Switch checked={aiSmartOverlays} onCheckedChange={setAiSmartOverlays} />
                  </div>
                  <Button size="sm" className="w-full liquid-glass-button">
                    AI Settings
                  </Button>
                </CardContent>
              </Card>
            </LiquidGlassCard>
          </div>
        </div>
      </div>

      {/* Chat & Polls Panel */}
      <div className="w-80 liquid-glass-elevated border-l border-white/10 flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <TabsList className="grid w-full grid-cols-3 liquid-glass-panel">
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
          
          <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
            <LiveChatPanel 
              isStreaming={twitch.isStreaming || youtube.isStreaming} 
              streamId={activeStream || 'default-stream'}
            />
          </TabsContent>
          
          <TabsContent value="ai" className="flex-1 flex flex-col m-0 overflow-y-auto">
            <ProFeatureGate 
              feature="AI-Powered Tools"
              description="Unlock AI chat analysis, highlights, voice assistant, live captions, and game coaching with Pro."
              showUpgrade={true}
            >
              <Tabs defaultValue="insights" className="flex-1 flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-4 liquid-glass-panel">
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="voice">Voice</TabsTrigger>
                    <TabsTrigger value="captions">Captions</TabsTrigger>
                    <TabsTrigger value="coach">Coach</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="insights" className="flex-1 p-4 space-y-4 overflow-y-auto">
                <AIChatAnalysis 
                  messages={liveChat.messages.map(msg => ({ 
                    username: msg.displayName, 
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
                  chatMessages={liveChat.messages.map(msg => ({ 
                    username: msg.displayName, 
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
