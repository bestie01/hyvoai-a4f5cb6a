import { useState, useEffect, useCallback } from 'react';
import { GITHUB_CONFIG } from '@/lib/constants';

export interface ReleaseAsset {
  name: string;
  size: number;
  download_count: number;
  download_url: string;
  browser_download_url: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
  assets: ReleaseAsset[];
}

export const useAllGitHubReleases = () => {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = GITHUB_CONFIG.apiUrl.replace('/latest', '');
      const response = await fetch(`${baseUrl}?per_page=50`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: GitHubRelease[] = await response.json();
      // Strip assets that belong to an older build but were uploaded into this
      // release (e.g. leftover 2.2.0 installers inside the v2.3.0 release).
      const cleaned = data
        .filter((r) => !r.draft)
        .map((r) => {
          const version = normalizeVersion(r.tag_name);
          if (!version) return r;
          const scoped = r.assets.filter(
            (a) => !versionFromAssetName(a.name) || a.name.includes(version),
          );
          return { ...r, assets: scoped.length ? scoped : r.assets };
        });
      setReleases(cleaned);

    } catch (err) {
      console.error('Failed to fetch GitHub releases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch releases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  return { releases, isLoading, error, refresh: fetchReleases };
};
