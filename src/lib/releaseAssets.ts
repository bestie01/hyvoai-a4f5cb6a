/**
 * Version-aware GitHub release asset matching.
 *
 * A release can carry stale installers from an earlier build (e.g. a v2.3.0
 * release that still holds 2.2.0 files). Matching on extension alone picks
 * whichever asset sorts first, which is usually the OLD one. Always prefer an
 * asset whose filename carries the release's own version.
 */

export interface MinimalAsset {
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
}

/** `v2.3.0` -> `2.3.0` */
export const normalizeVersion = (tag?: string | null): string | null =>
  tag ? tag.replace(/^v/i, "").trim() || null : null;

/** Extracts the semver-ish version embedded in an installer filename. */
export const versionFromAssetName = (name: string): string | null =>
  name.match(/(\d+\.\d+\.\d+)/)?.[1] ?? null;

/**
 * Finds the best asset for a filename pattern, preferring the release version.
 * Falls back to the highest version present, then to the first match.
 */
export function pickReleaseAsset<T extends MinimalAsset>(
  assets: T[] | undefined | null,
  pattern: string,
  releaseVersion?: string | null,
): T | null {
  if (!assets?.length) return null;
  const needle = pattern.toLowerCase();
  const matches = assets.filter(
    (a) => a.name.toLowerCase().includes(needle) && !a.name.toLowerCase().endsWith(".blockmap"),
  );
  if (!matches.length) return null;

  const version = normalizeVersion(releaseVersion);
  if (version) {
    const exact = matches.find((a) => a.name.includes(version));
    if (exact) return exact;
  }

  // No exact match: take the newest version present rather than the first name.
  const ranked = [...matches].sort((a, b) => {
    const av = versionFromAssetName(a.name);
    const bv = versionFromAssetName(b.name);
    if (av && bv && av !== bv) {
      const ap = av.split(".").map(Number);
      const bp = bv.split(".").map(Number);
      for (let i = 0; i < 3; i += 1) {
        if ((bp[i] ?? 0) !== (ap[i] ?? 0)) return (bp[i] ?? 0) - (ap[i] ?? 0);
      }
    }
    return 0;
  });
  return ranked[0] ?? null;
}

export const formatAssetSize = (bytes: number): string =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
