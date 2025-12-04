import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export function UpdateManager() {
  const checkForUpdates = useCallback(() => {
    // Check if service worker is available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update().catch(console.error);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();
    
    // Check for updates every hour
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
    
    // Listen for visibility changes to check updates when app becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for online event to check updates when coming back online
    const handleOnline = () => {
      toast.success('Back online', { duration: 2000 });
      checkForUpdates();
    };
    
    const handleOffline = () => {
      toast.warning('You are offline', { 
        duration: 3000,
        description: 'Some features may be limited'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkForUpdates]);

  return null;
}
