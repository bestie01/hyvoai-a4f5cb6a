import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

export function UpdateManager() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
      
      // Check for updates every hour
      r && setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', {
        duration: 3000,
      });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.info('New version available!', {
        duration: 10000,
        action: {
          label: (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Update
            </span>
          ),
          onClick: () => {
            updateServiceWorker(true);
            setNeedRefresh(false);
          },
        },
        description: 'Click to update and get the latest features',
      });
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}
