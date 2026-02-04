import { useState, useEffect, useCallback } from 'react';
import { GITHUB_CONFIG } from '@/lib/constants';

const CURRENT_VERSION = '1.0.0';
const DISMISSED_VERSION_KEY = 'hyvo_dismissed_version';

interface VersionInfo {
  latestVersion: string | null;
  currentVersion: string;
  hasUpdate: boolean;
  releaseUrl: string | null;
  releaseNotes: string | null;
  isLoading: boolean;
  error: string | null;
  isDismissed: boolean;
}

export function useVersionCheck() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    latestVersion: null,
    currentVersion: CURRENT_VERSION,
    hasUpdate: false,
    releaseUrl: null,
    releaseNotes: null,
    isLoading: true,
    error: null,
    isDismissed: false,
  });

  const checkForUpdates = useCallback(async () => {
    try {
      setVersionInfo(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(GITHUB_CONFIG.apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 404) {
        // No releases yet - this is expected for new repos
        setVersionInfo(prev => ({
          ...prev,
          isLoading: false,
          hasUpdate: false,
        }));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch release info');
      }

      const data = await response.json();
      const latestVersion = data.tag_name?.replace(/^v/, '') || null;
      const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
      const isDismissed = dismissedVersion === latestVersion;
      
      const hasUpdate = latestVersion && compareVersions(latestVersion, CURRENT_VERSION) > 0;

      setVersionInfo({
        latestVersion,
        currentVersion: CURRENT_VERSION,
        hasUpdate: hasUpdate && !isDismissed,
        releaseUrl: data.html_url || null,
        releaseNotes: data.body || null,
        isLoading: false,
        error: null,
        isDismissed,
      });
    } catch (error) {
      console.error('[VERSION-CHECK] Error:', error);
      setVersionInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check for updates',
      }));
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    if (versionInfo.latestVersion) {
      localStorage.setItem(DISMISSED_VERSION_KEY, versionInfo.latestVersion);
      setVersionInfo(prev => ({ ...prev, hasUpdate: false, isDismissed: true }));
    }
  }, [versionInfo.latestVersion]);

  useEffect(() => {
    checkForUpdates();
    
    // Check for updates every 4 hours
    const interval = setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return {
    ...versionInfo,
    checkForUpdates,
    dismissUpdate,
  };
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}
