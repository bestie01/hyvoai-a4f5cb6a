import { useState, useEffect, useCallback } from 'react';

interface ReleaseAsset {
  name: string;
  size: number;
  download_url: string;
  browser_download_url: string;
}

interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: ReleaseAsset[];
}

interface UseGitHubReleasesReturn {
  latestVersion: string | null;
  releaseUrl: string | null;
  assets: ReleaseAsset[];
  isLoading: boolean;
  error: string | null;
  hasReleases: boolean;
  getAssetUrl: (pattern: string) => string | null;
  getAssetSize: (pattern: string) => string | null;
  refresh: () => Promise<void>;
}

const GITHUB_REPO = 'hyvo-ai/hyvo-stream-studio';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const useGitHubReleases = (): UseGitHubReleasesReturn => {
  const [release, setRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestRelease = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 404) {
        // No releases yet
        setRelease(null);
        setError(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: Release = await response.json();
      setRelease(data);
    } catch (err) {
      console.error('Failed to fetch GitHub releases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch releases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestRelease();
  }, [fetchLatestRelease]);

  const getAssetUrl = useCallback((pattern: string): string | null => {
    if (!release?.assets) return null;
    const asset = release.assets.find(a => 
      a.name.toLowerCase().includes(pattern.toLowerCase())
    );
    return asset?.browser_download_url || null;
  }, [release]);

  const getAssetSize = useCallback((pattern: string): string | null => {
    if (!release?.assets) return null;
    const asset = release.assets.find(a => 
      a.name.toLowerCase().includes(pattern.toLowerCase())
    );
    if (!asset) return null;
    
    const bytes = asset.size;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [release]);

  return {
    latestVersion: release?.tag_name?.replace('v', '') || null,
    releaseUrl: release?.html_url || null,
    assets: release?.assets || [],
    isLoading,
    error,
    hasReleases: !!release,
    getAssetUrl,
    getAssetSize,
    refresh: fetchLatestRelease,
  };
};
