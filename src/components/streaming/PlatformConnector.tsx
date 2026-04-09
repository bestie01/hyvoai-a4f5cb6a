import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { Loader2, Link2, Unlink, Tv, Youtube, RefreshCw, AlertCircle, CheckCircle2, MessageSquare, BarChart3, Radio } from "lucide-react";

interface PlatformConnectorProps {
  onStatsUpdate?: (platform: 'twitch' | 'youtube', stats: any) => void;
}

export function PlatformConnector({ onStatsUpdate }: PlatformConnectorProps) {
  const {
    twitchConnection, youtubeConnection, isLoading,
    connectTwitch, connectYouTube, disconnectPlatform, refreshConnections,
  } = usePlatformOAuth();

  const renderConnection = (
    platform: 'twitch' | 'youtube',
    connection: typeof twitchConnection,
    connectFn: () => Promise<void>,
    icon: React.ReactNode,
    label: string,
    brandColor: string,
    features: string[],
  ) => {
    const needsReconnect = connection?.needsReconnect;

    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
              {icon}
            </div>
            <div>
              <p className="font-medium">{label}</p>
              {connection?.isConnected ? (
                <div className="flex items-center gap-2">
                  {needsReconnect ? (
                    <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Token expired
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {connection.username || 'Connected'}
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not connected</p>
              )}
            </div>
          </div>
          
          {connection?.isConnected ? (
            <div className="flex items-center gap-2">
              {needsReconnect && (
                <Button variant="outline" size="sm" onClick={connectFn} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Reconnect
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => disconnectPlatform(platform)} disabled={isLoading}>
                <Unlink className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={connectFn} disabled={isLoading} style={{ backgroundColor: brandColor }} className="hover:opacity-90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="h-4 w-4 mr-1" /> Connect</>}
            </Button>
          )}
        </div>
        
        {/* Features this connection unlocks */}
        <div className="flex flex-wrap gap-1.5">
          {features.map(f => (
            <Badge key={f} variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
              {f}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Platform Connections
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={refreshConnections} disabled={isLoading} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Connect accounts for real-time stats, chat, and analytics</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {renderConnection(
          'twitch', twitchConnection, connectTwitch,
          <Tv className="h-5 w-5" style={{ color: '#9146FF' }} />,
          'Twitch', '#9146FF',
          ['Live Chat (IRC)', 'Send Messages', 'Stream Stats', 'Analytics']
        )}
        {renderConnection(
          'youtube', youtubeConnection, connectYouTube,
          <Youtube className="h-5 w-5" style={{ color: '#FF0000' }} />,
          'YouTube', '#FF0000',
          ['Live Chat', 'Send Messages', 'Stream Stats', 'Analytics']
        )}
      </CardContent>
    </Card>
  );
}
