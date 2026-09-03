import { useState, useEffect, useCallback } from 'react';
import { GITHUB_CONFIG } from '@/lib/constants';
import { formatAssetSize, normalizeVersion, pickReleaseAsset, versionFromAssetName } from '@/lib/releaseAssets';

interface ReleaseAsset {
  name: string;
  size: number;
  download_count: number;
  download_url: string;
  browser_download_url: string;
}

interface Release {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  assets: ReleaseAsset[];
}

interface UseGitHubReleasesReturn {
  latestVersion: string | null;
  releaseUrl: string | null;
  releaseDate: string | null;
  releaseNotes: string | null;
  assets: ReleaseAsset[];
  isLoading: boolean;
  error: string | null;
  hasReleases: boolean;
  getAssetUrl: (pattern: string) => string | null;
  getAssetSize: (pattern: string) => string | null;
  getAssetDownloads: (pattern: string) => number | null;
  /** Version embedded in the resolved asset filename, e.g. "2.3.0". */
  getAssetVersion: (pattern: string) => string | null;
  refresh: () => Promise<void>;
}

const GITHUB_API_URL = GITHUB_CONFIG.apiUrl;

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

  const version = normalizeVersion(release?.tag_name);

  const find = useCallback(
    (pattern: string) => pickReleaseAsset(release?.assets, pattern, release?.tag_name),
    [release],
  );

  const getAssetUrl = useCallback(
    (pattern: string) => find(pattern)?.browser_download_url ?? null,
    [find],
  );

  const getAssetSize = useCallback((pattern: string) => {
    const asset = find(pattern);
    return asset ? formatAssetSize(asset.size) : null;
  }, [find]);

  const getAssetDownloads = useCallback(
    (pattern: string) => find(pattern)?.download_count ?? null,
    [find],
  );

  const getAssetVersion = useCallback((pattern: string) => {
    const asset = find(pattern);
    return asset ? versionFromAssetName(asset.name) ?? version : null;
  }, [find, version]);

  return {
    latestVersion: version,
    releaseUrl: release?.html_url || null,
    releaseDate: release?.published_at || null,
    releaseNotes: release?.body || null,
    assets: release?.assets || [],
    isLoading,
    error,
    hasReleases: !!release,
    getAssetUrl,
    getAssetSize,
    getAssetDownloads,
    getAssetVersion,
    refresh: fetchLatestRelease,
  };
};
