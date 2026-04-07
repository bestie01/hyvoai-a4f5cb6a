import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVersionCheck } from '@/hooks/useVersionCheck';

export function UpdateBanner() {
  const { hasUpdate, latestVersion, currentVersion, releaseUrl, dismissUpdate, isDesktop, updateStatus, downloadProgress, installUpdate, checkForUpdates } = useVersionCheck();

  if (!hasUpdate && updateStatus !== 'downloading' && updateStatus !== 'ready') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary via-primary/90 to-accent shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}>
                <Sparkles className="w-5 h-5 text-primary-foreground flex-shrink-0" />
              </motion.div>

              {updateStatus === 'downloading' ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-primary-foreground text-sm font-medium whitespace-nowrap">Downloading update...</span>
                  <Progress value={downloadProgress} className="flex-1 max-w-xs h-2" />
                  <span className="text-primary-foreground/80 text-xs whitespace-nowrap">{Math.round(downloadProgress)}%</span>
                </div>
              ) : updateStatus === 'ready' ? (
                <span className="text-primary-foreground text-sm font-medium">
                  Update ready! Restart to install <strong>v{latestVersion}</strong>
                </span>
              ) : (
                <span className="text-primary-foreground text-sm md:text-base font-medium truncate">
                  <span className="hidden sm:inline">🎉 </span>
                  New version <strong>v{latestVersion}</strong> available
                  <span className="hidden md:inline text-primary-foreground/80"> (Current: v{currentVersion})</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {updateStatus === 'ready' ? (
                <Button size="sm" variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground border-0" onClick={installUpdate}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Restart Now</span>
                </Button>
              ) : isDesktop ? (
                <Button size="sm" variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground border-0" onClick={checkForUpdates} disabled={updateStatus === 'checking' || updateStatus === 'downloading'}>
                  <RefreshCw className={`w-4 h-4 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{updateStatus === 'checking' ? 'Checking...' : 'Update'}</span>
                </Button>
              ) : releaseUrl ? (
                <Button size="sm" variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-primary-foreground border-0" onClick={() => window.open(releaseUrl, '_blank')}>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              ) : null}
              
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-white/20 p-1" onClick={dismissUpdate} aria-label="Dismiss update notification">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
