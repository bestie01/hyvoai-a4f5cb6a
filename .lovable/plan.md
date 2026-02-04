
# Fix GitHub Release Fetch Error

## Problem
The console shows a 404 error when fetching GitHub releases:
```
[network] Failed to load resource: 404
https://api.github.com/repos/AceDZN/stream-studio/releases/latest
```

This is caused by `useVersionCheck.tsx` using an incorrect/outdated GitHub repository name.

## Root Cause
Two hooks fetch from different repos:
- `useVersionCheck.tsx` → `AceDZN/stream-studio` (wrong - returns 404)
- `useGitHubReleases.tsx` → `hyvo-ai/hyvo-stream-studio` (correct)

## Solution

### Step 1: Centralize GitHub Configuration
Add the GitHub repository constant to `src/lib/constants.ts`:

```typescript
// GitHub release configuration
export const GITHUB_CONFIG = {
  owner: 'hyvo-ai',
  repo: 'hyvo-stream-studio',
  apiUrl: 'https://api.github.com/repos/hyvo-ai/hyvo-stream-studio/releases/latest',
} as const;
```

### Step 2: Update useVersionCheck.tsx
Replace the hardcoded wrong URL with the centralized constant:

**Before:**
```typescript
const response = await fetch(
  'https://api.github.com/repos/AceDZN/stream-studio/releases/latest',
```

**After:**
```typescript
import { GITHUB_CONFIG } from '@/lib/constants';
// ...
const response = await fetch(GITHUB_CONFIG.apiUrl, {
```

### Step 3: Update useGitHubReleases.tsx
Use the centralized constant instead of hardcoding:

**Before:**
```typescript
const GITHUB_REPO = 'hyvo-ai/hyvo-stream-studio';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
```

**After:**
```typescript
import { GITHUB_CONFIG } from '@/lib/constants';
const GITHUB_API_URL = GITHUB_CONFIG.apiUrl;
```

### Step 4: Add Graceful Error Handling
Both hooks should handle 404 gracefully without logging errors to console (since no releases may exist yet):

```typescript
if (response.status === 404) {
  // No releases yet - this is expected for new repos
  return;
}
```

## Files to Modify
1. `src/lib/constants.ts` - Add GITHUB_CONFIG
2. `src/hooks/useVersionCheck.tsx` - Use centralized config
3. `src/hooks/useGitHubReleases.tsx` - Use centralized config

## Expected Outcome
- No more 404 errors in console for existing repos
- Graceful handling when no releases exist
- Single source of truth for GitHub configuration
- Easy to update repo name in one place if needed

## Technical Notes
- The GitHub API returns 404 when a repo doesn't exist OR has no releases
- The `useGitHubReleases.tsx` already handles 404 gracefully (line 49-53)
- The `useVersionCheck.tsx` throws an error on 404 (line 42-44) - needs fix
- Both hooks will now use the same repo, eliminating inconsistency
