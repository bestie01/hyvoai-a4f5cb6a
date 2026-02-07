import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import { 
  Github, 
  Package, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  RefreshCw,
  Globe
} from "lucide-react";
import { GITHUB_CONFIG } from "@/lib/constants";

interface BuildStatusCardProps {
  onUseWebApp?: () => void;
}

export function BuildStatusCard({ onUseWebApp }: BuildStatusCardProps) {
  const { 
    latestVersion, 
    releaseUrl, 
    assets, 
    isLoading, 
    error, 
    hasReleases, 
    refresh 
  } = useGitHubReleases();

  const hasWindows = assets.some(a => a.name.includes('.exe'));
  const hasMac = assets.some(a => a.name.includes('.dmg'));
  const hasLinux = assets.some(a => a.name.includes('.AppImage') || a.name.includes('.deb'));

  const isRepoConfigured = !GITHUB_CONFIG.owner.includes('YOUR_') && !GITHUB_CONFIG.repo.includes('YOUR_');

  if (!isRepoConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-warning/30 bg-gradient-to-br from-warning/10 to-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Desktop Builds Setup Required</CardTitle>
            </div>
            <CardDescription>
              Follow these steps to enable real desktop downloads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">1</Badge>
                <span><strong>Export to GitHub</strong> - Use Lovable's "Export to GitHub" feature</span>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">2</Badge>
                <span><strong>Update config</strong> - Update <code className="bg-muted px-1 rounded">src/lib/constants.ts</code> with your GitHub username and repo</span>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">3</Badge>
                <span><strong>Create a release</strong> - Run <code className="bg-muted px-1 rounded">git tag v1.0.0 && git push origin v1.0.0</code></span>
              </li>
              <li className="flex gap-3">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">4</Badge>
                <span><strong>Wait for builds</strong> - GitHub Actions will build installers automatically (~15 min)</span>
              </li>
            </ol>

            <div className="flex gap-3 pt-2">
              {onUseWebApp && (
                <Button variant="default" onClick={onUseWebApp} className="flex-1">
                  <Globe className="w-4 h-4 mr-2" />
                  Use Web App Instead
                </Button>
              )}
              <Button variant="outline" asChild className="flex-1">
                <a href="https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Guide
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardContent className="py-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking for releases...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-destructive/30 bg-gradient-to-br from-destructive/10 to-red-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-lg">Unable to Fetch Releases</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {onUseWebApp && (
              <Button onClick={onUseWebApp} className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                Use Web App Instead
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!hasReleases) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">No Releases Yet</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Desktop builds haven't been published yet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To create a release, push a version tag to GitHub:
            </p>
            <code className="block bg-muted p-3 rounded text-sm font-mono">
              git tag v1.0.0 && git push origin v1.0.0
            </code>
            <div className="flex gap-3">
              {onUseWebApp && (
                <Button variant="default" onClick={onUseWebApp} className="flex-1">
                  <Globe className="w-4 h-4 mr-2" />
                  Use Web App
                </Button>
              )}
              <Button variant="outline" asChild className="flex-1">
                <a href={`https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/actions`} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Actions
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-success/30 bg-gradient-to-br from-success/10 to-emerald-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <CardTitle className="text-lg">Release v{latestVersion}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Desktop builds are available for download
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-3 rounded text-center text-sm ${hasWindows ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${hasWindows ? '' : 'opacity-30'}`} />
              Windows
            </div>
            <div className={`p-3 rounded text-center text-sm ${hasMac ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${hasMac ? '' : 'opacity-30'}`} />
              macOS
            </div>
            <div className={`p-3 rounded text-center text-sm ${hasLinux ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${hasLinux ? '' : 'opacity-30'}`} />
              Linux
            </div>
          </div>

          {releaseUrl && (
            <Button variant="outline" asChild className="w-full">
              <a href={releaseUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
                <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
