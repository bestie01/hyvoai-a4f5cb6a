import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { Loader2, Link2, Unlink, Tv, Youtube, Users, Eye, RefreshCw } from "lucide-react";

interface PlatformConnectorProps {
  onStatsUpdate?: (platform: 'twitch' | 'youtube', stats: any) => void;
}

export function PlatformConnector({ onStatsUpdate }: PlatformConnectorProps) {
  const {
    twitchConnection,
    youtubeConnection,
    isLoading,
    connectTwitch,
    connectYouTube,
    disconnectPlatform,
    refreshConnections,
  } = usePlatformOAuth();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConnections();
    setRefreshing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Platform Connections
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Twitch Connection */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#9146FF]/20 flex items-center justify-center">
              <Tv className="h-5 w-5 text-[#9146FF]" />
            </div>
            <div>
              <p className="font-medium">Twitch</p>
              {twitchConnection?.isConnected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {twitchConnection.username || 'Connected'}
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not connected</p>
              )}
            </div>
          </div>
          
          {twitchConnection?.isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnectPlatform('twitch')}
              disabled={isLoading}
            >
              <Unlink className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={connectTwitch}
              disabled={isLoading}
              className="bg-[#9146FF] hover:bg-[#7c3aed]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>

        {/* YouTube Connection */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF0000]/20 flex items-center justify-center">
              <Youtube className="h-5 w-5 text-[#FF0000]" />
            </div>
            <div>
              <p className="font-medium">YouTube</p>
              {youtubeConnection?.isConnected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {youtubeConnection.username || 'Connected'}
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not connected</p>
              )}
            </div>
          </div>
          
          {youtubeConnection?.isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnectPlatform('youtube')}
              disabled={isLoading}
            >
              <Unlink className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={connectYouTube}
              disabled={isLoading}
              className="bg-[#FF0000] hover:bg-[#cc0000]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Connect your accounts to fetch real viewer counts and stream stats
        </p>
      </CardContent>
    </Card>
  );
}
