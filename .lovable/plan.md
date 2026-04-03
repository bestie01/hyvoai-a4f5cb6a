

# Fix: Download Page — GitHub API Returns 404 (Private Repo)

## Problem

The download page fetches release data from `https://api.github.com/repos/bestie01/hyvoai-a4f5cb6a/releases/latest`, but this returns **404** because the repository is private. Without access to the API, the page shows "No releases found" and no download buttons work — even though the desktop release build succeeded.

## Solution Options

### Option A: Make the GitHub repo public (Recommended — simplest)

1. Go to GitHub → `bestie01/hyvoai-a4f5cb6a` → Settings → General
2. Scroll to "Danger Zone" → Change visibility → Make public
3. The download page will immediately start working — no code changes needed

### Option B: Add a GitHub token for API access (if repo must stay private)

This requires code changes:

| File | Change |
|------|--------|
| `src/hooks/useGitHubReleases.tsx` | Add `Authorization: Bearer <token>` header to API fetch calls |
| `src/hooks/useAllGitHubReleases.tsx` | Same token header addition |

The token would need to be stored as a Supabase secret and proxied through an edge function (to avoid exposing it client-side), or the releases would need to be proxied.

### Option C: Proxy releases through a Supabase edge function

Create a `github-releases` edge function that:
1. Fetches from the GitHub API using a server-side token (stored as a Supabase secret)
2. Returns the release data to the client
3. Update the hooks to call this edge function instead of GitHub directly

| File | Change |
|------|--------|
| `supabase/functions/github-releases/index.ts` | New edge function that fetches releases with auth |
| `src/hooks/useGitHubReleases.tsx` | Point API URL to edge function |
| `src/hooks/useAllGitHubReleases.tsx` | Point API URL to edge function |

## Recommendation

**Option A** is by far the simplest. Making the repo public lets the existing code work perfectly — download counts, release notes, asset URLs, and the changelog page all come to life with zero code changes. The desktop release you already built will show up immediately.

If the repo must stay private, Option C (edge function proxy) is the most secure approach since it keeps the GitHub token server-side.

