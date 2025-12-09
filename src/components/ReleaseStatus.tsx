import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import { CheckCircle, XCircle, Clock, ExternalLink, Loader2 } from "lucide-react";

export function ReleaseStatus() {
  const { 
    latestVersion, 
    releaseUrl, 
    assets, 
    isLoading, 
    error, 
    hasReleases, 
    refresh 
  } = useGitHubReleases();
  
  const [buildStatus, setBuildStatus] = useState<'success' | 'pending' | 'failed' | 'unknown'>('unknown');

  useEffect(() => {
    if (hasReleases && assets.length > 0) {
      const hasWindows = assets.some(a => a.name.includes('.exe'));
      const hasMac = assets.some(a => a.name.includes('.dmg'));
      const hasLinux = assets.some(a => a.name.includes('.AppImage'));
      
      if (hasWindows && hasMac && hasLinux) {
        setBuildStatus('success');
      } else if (assets.length > 0) {
        setBuildStatus('pending');
      } else {
        setBuildStatus('failed');
      }
    } else if (hasReleases) {
      setBuildStatus('failed');
    } else {
      setBuildStatus('unknown');
    }
  }, [hasReleases, assets]);

  const getStatusIcon = () => {
    switch (buildStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (buildStatus) {
      case 'success':
        return 'All builds available';
      case 'pending':
        return 'Some builds in progress';
      case 'failed':
        return 'No builds available';
      default:
        return 'Checking...';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Release Status</span>
          <Button variant="ghost" size="sm" onClick={refresh}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasReleases ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm">{getStatusText()}</span>
              </div>
              <Badge variant="secondary">v{latestVersion}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Available Downloads:</p>
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 rounded text-center text-xs ${
                  assets.some(a => a.name.includes('.exe'))
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  Windows
                </div>
                <div className={`p-2 rounded text-center text-xs ${
                  assets.some(a => a.name.includes('.dmg'))
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  macOS
                </div>
                <div className={`p-2 rounded text-center text-xs ${
                  assets.some(a => a.name.includes('.AppImage'))
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  Linux
                </div>
              </div>
            </div>

            {releaseUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(releaseUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No releases found</p>
            <p className="text-xs text-muted-foreground">
              Push a version tag (e.g., v1.0.0) to trigger a build
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
