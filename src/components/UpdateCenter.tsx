import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { useState } from 'react';

/**
 * Compact desktop-only update pill (bottom-right).
 * Renders nothing on web — `UpdateBanner` handles web update prompts.
 */
export function UpdateCenter() {
  const {
    isDesktop,
    updateStatus,
    downloadProgress,
    latestVersion,
    installUpdate,
    checkForUpdates,
  } = useVersionCheck();
  const [hidden, setHidden] = useState(false);

  if (!isDesktop) return null;
  if (hidden) return null;

  // Only render when there is something meaningful to say
  const visible =
    updateStatus === 'checking' ||
    updateStatus === 'available' ||
    updateStatus === 'downloading' ||
    updateStatus === 'ready' ||
    updateStatus === 'error';

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-[90] max-w-sm"
        role="status"
        aria-live="polite"
      >
        <div className="liquid-glass-panel border border-border/50 rounded-2xl shadow-xl p-3 backdrop-blur-2xl bg-background/80">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {updateStatus === 'ready' && <CheckCircle className="w-5 h-5 text-primary" />}
              {updateStatus === 'downloading' && <Download className="w-5 h-5 text-primary animate-pulse" />}
              {updateStatus === 'checking' && <RefreshCw className="w-5 h-5 text-primary animate-spin" />}
              {updateStatus === 'available' && <Download className="w-5 h-5 text-primary" />}
              {updateStatus === 'error' && <AlertTriangle className="w-5 h-5 text-destructive" />}
            </div>

            <div className="flex-1 min-w-0">
              {updateStatus === 'checking' && (
                <p className="text-sm font-medium text-foreground">Checking for updates…</p>
              )}
              {updateStatus === 'available' && (
                <p className="text-sm font-medium text-foreground">
                  Update available{latestVersion ? <> <span className="text-muted-foreground">v{latestVersion}</span></> : null}
                </p>
              )}
              {updateStatus === 'downloading' && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">
                    Downloading update{latestVersion ? ` v${latestVersion}` : ''}…
                  </p>
                  <Progress value={downloadProgress} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">{Math.round(downloadProgress)}%</p>
                </div>
              )}
              {updateStatus === 'ready' && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Restart to install v{latestVersion}</p>
                  <p className="text-xs text-muted-foreground">Your work will continue after relaunch.</p>
                </div>
              )}
              {updateStatus === 'error' && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Update failed</p>
                  <p className="text-xs text-muted-foreground">We couldn't fetch the latest release. Try again.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {updateStatus === 'ready' && (
                <Button size="sm" onClick={installUpdate}>Restart</Button>
              )}
              {updateStatus === 'error' && (
                <Button size="sm" variant="outline" onClick={checkForUpdates}>Retry</Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                aria-label="Dismiss update notice"
                onClick={() => setHidden(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
