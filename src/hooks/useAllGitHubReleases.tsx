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
      setReleases(data.filter(r => !r.draft));
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
