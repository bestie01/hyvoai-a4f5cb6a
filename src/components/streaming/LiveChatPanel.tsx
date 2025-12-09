import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLiveChat, ChatMessage } from "@/hooks/useLiveChat";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
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
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveChatPanelProps {
  isStreaming?: boolean;
}

export function LiveChatPanel({ isStreaming = false }: LiveChatPanelProps) {
  const { 
    messages, 
    isConnected, 
    isLoading, 
    connectChat, 
    disconnectChat,
    clearMessages 
  } = useLiveChat();
  
  const { twitchConnection, youtubeConnection } = usePlatformOAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleConnect = async () => {
    const platforms: ('twitch' | 'youtube')[] = [];
    if (twitchConnection?.isConnected) platforms.push('twitch');
    if (youtubeConnection?.isConnected) platforms.push('youtube');
    
    if (platforms.length === 0) {
      // If no OAuth connections, still try to connect (will show demo messages)
      platforms.push('youtube');
    }
    
    await connectChat(platforms);
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
      className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
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
                {messages.length} messages
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            {isConnected && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                title="Clear messages"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={isConnected ? disconnectChat : handleConnect}
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
              {!twitchConnection?.isConnected && !youtubeConnection?.isConnected && (
                <span>Connect platforms in Analytics panel</span>
              )}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-8 w-8 text-muted-foreground/50 mb-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Waiting for chat messages...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure you have an active livestream
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
              {messages.map(renderMessage)}
            </div>
          </ScrollArea>
        )}

        {/* Connection status footer */}
        {isConnected && (
          <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Connected</span>
              </div>
              <div className="flex items-center gap-2">
                {twitchConnection?.isConnected && (
                  <Tv className="h-3 w-3 text-[#9146FF]" />
                )}
                {youtubeConnection?.isConnected && (
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
