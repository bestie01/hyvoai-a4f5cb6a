import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLiveChat, ChatMessage } from "@/hooks/useLiveChat";
import { useTwitchIRC } from "@/hooks/useTwitchIRC";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { ChatModerationControls } from "./ChatModerationControls";
import { 
  MessageSquare, 
  Tv, 
  Youtube, 
  Link2, 
  Unlink, 
  Trash2,
  Crown,
  Shield,
  Loader2,
  Radio,
  Settings2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LiveChatPanelProps {
  isStreaming?: boolean;
  streamId?: string;
}

export function LiveChatPanel({ isStreaming = false, streamId = 'default' }: LiveChatPanelProps) {
  const { 
    messages: ytMessages, 
    isConnected: isYtConnected, 
    isLoading: isYtLoading, 
    connectChat: connectYtChat, 
    disconnectChat: disconnectYtChat,
    clearMessages: clearYtMessages 
  } = useLiveChat();
  
  const twitchIRC = useTwitchIRC();
  
  const { twitchConnection, youtubeConnection } = usePlatformOAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [twitchChannel, setTwitchChannel] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set());

  // Combine messages from both sources
  const allMessages: ChatMessage[] = [
    ...ytMessages,
    ...twitchIRC.messages.map(msg => ({
      id: msg.id,
      platform: 'twitch' as const,
      username: msg.username,
      displayName: msg.displayName,
      message: msg.message,
      timestamp: msg.timestamp,
      badges: msg.badges,
      color: msg.color,
      isSubscriber: msg.isSubscriber,
      isModerator: msg.isModerator,
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
   .filter(msg => !hiddenMessages.has(msg.id));

  const isConnected = isYtConnected || twitchIRC.isConnected;
  const isLoading = isYtLoading || twitchIRC.isConnecting;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, autoScroll]);

  const handleConnect = async () => {
    // Connect YouTube if available
    if (youtubeConnection?.isConnected) {
      await connectYtChat(['youtube']);
    }
    
    // Connect Twitch IRC if channel is set
    if (twitchChannel.trim()) {
      twitchIRC.connect(twitchChannel.trim());
    }
    
    setSettingsOpen(false);
  };

  const handleDisconnect = () => {
    disconnectYtChat();
    twitchIRC.disconnect();
  };

  const handleClear = () => {
    clearYtMessages();
    twitchIRC.clearMessages();
    setHiddenMessages(new Set());
  };

  const handleModerationAction = (action: string, username: string, messageId?: string) => {
    if (action === 'delete' && messageId) {
      setHiddenMessages(prev => new Set(prev).add(messageId));
    }
  };

  const getPlatformIcon = (platform: 'twitch' | 'youtube') => {
    if (platform === 'twitch') {
      return <Tv className="h-3 w-3 text-[#9146FF]" />;
    }
    return <Youtube className="h-3 w-3 text-[#FF0000]" />;
  };

  const getPlatformColor = (platform: 'twitch' | 'youtube') => {
    return platform === 'twitch' ? 'bg-[#9146FF]/20 text-[#9146FF]' : 'bg-[#FF0000]/20 text-[#FF0000]';
  };

  const renderMessage = (msg: ChatMessage) => (
    <div 
      key={msg.id} 
      className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getPlatformIcon(msg.platform)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {msg.isModerator && (
            <Shield className="h-3 w-3 text-green-500" />
          )}
          {msg.isSubscriber && (
            <Crown className="h-3 w-3 text-yellow-500" />
          )}
          <span 
            className="font-semibold text-sm"
            style={{ color: msg.color || 'inherit' }}
          >
            {msg.displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm break-words">{msg.message}</p>
      </div>
      {moderationEnabled && (
        <ChatModerationControls
          username={msg.username}
          messageId={msg.id}
          message={msg.message}
          platform={msg.platform}
          streamId={streamId}
          onAction={(action, username) => handleModerationAction(action, username, msg.id)}
        />
      )}
    </div>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Live Chat
            {isConnected && (
              <Badge variant="secondary" className="text-xs">
                {allMessages.length} messages
              </Badge>
            )}
            {twitchIRC.isConnected && (
              <Badge variant="outline" className="text-xs gap-1 bg-[#9146FF]/10">
                <Radio className="h-2 w-2 animate-pulse" />
                IRC
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            {isConnected && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                title="Clear messages"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Chat settings">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chat Connection Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitch-channel" className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-[#9146FF]" />
                      Twitch Channel (IRC)
                    </Label>
                    <Input
                      id="twitch-channel"
                      placeholder="Enter channel name (e.g., shroud)"
                      value={twitchChannel}
                      onChange={(e) => setTwitchChannel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Real-time chat via Twitch IRC WebSocket. No authentication required for reading.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-[#FF0000]" />
                      YouTube Live Chat
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {youtubeConnection?.isConnected 
                        ? "Connected via OAuth. Will poll for messages during active broadcasts."
                        : "Connect your YouTube account in the Analytics panel to enable YouTube chat."}
                    </p>
                  </div>

                  {/* Moderation Settings */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="moderation-enabled">Enable Moderation Controls</Label>
                    </div>
                    <Switch
                      id="moderation-enabled"
                      checked={moderationEnabled}
                      onCheckedChange={setModerationEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When enabled, hover over messages to access ban, timeout, and warning controls.
                  </p>
                  
                  <Button onClick={handleConnect} className="w-full">
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={isConnected ? handleDisconnect : () => setSettingsOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isConnected ? (
                <>
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {!isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Connect to see live chat messages
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {twitchConnection?.isConnected && (
                <Badge variant="outline" className={getPlatformColor('twitch')}>
                  <Tv className="h-3 w-3 mr-1" />
                  Twitch
                </Badge>
              )}
              {youtubeConnection?.isConnected && (
                <Badge variant="outline" className={getPlatformColor('youtube')}>
                  <Youtube className="h-3 w-3 mr-1" />
                  YouTube
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configure Chat
            </Button>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-8 w-8 text-muted-foreground/50 mb-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Waiting for chat messages...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {twitchIRC.isConnected 
                ? `Connected to #${twitchChannel} via IRC`
                : "Make sure you have an active livestream"}
            </p>
          </div>
        ) : (
          <ScrollArea 
            className="flex-1 px-4" 
            ref={scrollRef}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
              setAutoScroll(isAtBottom);
            }}
          >
            <div className="space-y-1 py-2">
              {allMessages.map(renderMessage)}
            </div>
          </ScrollArea>
        )}

        {/* Connection status footer */}
        {isConnected && (
          <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>
                  {twitchIRC.isConnected && isYtConnected 
                    ? "IRC + Polling" 
                    : twitchIRC.isConnected 
                      ? "IRC (Real-time)" 
                      : "Polling"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {twitchIRC.isConnected && (
                  <Badge variant="outline" className="text-xs py-0">
                    <Tv className="h-3 w-3 mr-1 text-[#9146FF]" />
                    {twitchChannel}
                  </Badge>
                )}
                {isYtConnected && (
                  <Youtube className="h-3 w-3 text-[#FF0000]" />
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
