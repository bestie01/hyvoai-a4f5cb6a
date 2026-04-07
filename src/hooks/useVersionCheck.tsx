import { useState, useEffect, useCallback } from 'react';
import { GITHUB_CONFIG } from '@/lib/constants';

const CURRENT_VERSION = '2.1.0';
const DISMISSED_VERSION_KEY = 'hyvo_dismissed_version';

const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;

interface VersionInfo {
  latestVersion: string | null;
  currentVersion: string;
  hasUpdate: boolean;
  releaseUrl: string | null;
  releaseNotes: string | null;
  isLoading: boolean;
  error: string | null;
  isDismissed: boolean;
  isDesktop: boolean;
  updateStatus: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
  downloadProgress: number;
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
    isDesktop: !!isElectron,
    updateStatus: 'idle',
    downloadProgress: 0,
  });

  // Get real app version from Electron if available
  useEffect(() => {
    if (isElectron) {
      (window as any).electronAPI.getAppVersion().then((version: string) => {
        if (version) {
          setVersionInfo(prev => ({ ...prev, currentVersion: version }));
        }
      }).catch(() => {});

      // Listen for update events
      const cleanups: (() => void)[] = [];
      
      const api = (window as any).electronAPI;
      if (api.onUpdateChecking) cleanups.push(api.onUpdateChecking(() => setVersionInfo(prev => ({ ...prev, updateStatus: 'checking' }))));
      if (api.onUpdateAvailable) cleanups.push(api.onUpdateAvailable((info: any) => setVersionInfo(prev => ({ ...prev, updateStatus: 'available', latestVersion: info?.version || prev.latestVersion, hasUpdate: true }))));
      if (api.onUpdateNotAvailable) cleanups.push(api.onUpdateNotAvailable(() => setVersionInfo(prev => ({ ...prev, updateStatus: 'idle' }))));
      if (api.onUpdateProgress) cleanups.push(api.onUpdateProgress((info: any) => setVersionInfo(prev => ({ ...prev, updateStatus: 'downloading', downloadProgress: info?.percent || 0 }))));
      if (api.onUpdateDownloaded) cleanups.push(api.onUpdateDownloaded(() => setVersionInfo(prev => ({ ...prev, updateStatus: 'ready' }))));
      if (api.onUpdateError) cleanups.push(api.onUpdateError(() => setVersionInfo(prev => ({ ...prev, updateStatus: 'error' }))));

      return () => cleanups.forEach(fn => fn && fn());
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    // Desktop: trigger native update check
    if (isElectron) {
      try {
        (window as any).electronAPI.checkForUpdates();
        setVersionInfo(prev => ({ ...prev, updateStatus: 'checking' }));
      } catch {}
      return;
    }

    // Web: check GitHub API
    try {
      setVersionInfo(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch(GITHUB_CONFIG.apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
      
      if (response.status === 404) {
        setVersionInfo(prev => ({ ...prev, isLoading: false, hasUpdate: false }));
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch release info');

      const data = await response.json();
      const latestVersion = data.tag_name?.replace(/^v/, '') || null;
      const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
      const isDismissed = dismissedVersion === latestVersion;
      const hasUpdate = latestVersion && compareVersions(latestVersion, CURRENT_VERSION) > 0;

      setVersionInfo(prev => ({
        ...prev,
        latestVersion,
        hasUpdate: !!hasUpdate && !isDismissed,
        releaseUrl: data.html_url || null,
        releaseNotes: data.body || null,
        isLoading: false,
        error: null,
        isDismissed,
      }));
    } catch (error) {
      setVersionInfo(prev => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : 'Failed to check for updates' }));
    }
  }, []);

  const installUpdate = useCallback(() => {
    if (isElectron) {
      (window as any).electronAPI.installUpdate?.();
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
    const interval = setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return { ...versionInfo, checkForUpdates, dismissUpdate, installUpdate };
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
