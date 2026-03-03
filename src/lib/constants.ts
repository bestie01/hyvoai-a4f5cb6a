// Centralized constants for the application

export const SUPABASE_URL = "https://fxvvcyjwgxxxezqzucwm.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnZjeWp3Z3h4eGV6cXp1Y3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzExNzEsImV4cCI6MjA3MTEwNzE3MX0.Lv6PT9SfKcNWHmnFHi3Nr7RiPVwe-vurSN3u-82yCg8";

// App metadata
export const APP_NAME = "Hyvo.ai";
export const APP_DESCRIPTION = "AI-powered streaming platform";

// External links
export const EXTERNAL_LINKS = {
  twitter: "https://twitter.com/hyvoai",
  github: "https://github.com/hyvoai",
  linkedin: "https://linkedin.com/company/hyvoai",
  youtube: "https://youtube.com/@hyvoai",
  support: "mailto:support@hyvo.ai",
  contact: "mailto:hello@hyvo.ai",
} as const;

// GitHub release configuration
// IMPORTANT: Update these values after exporting to GitHub
// 1. Export this project to GitHub using Lovable's "Export to GitHub" feature
// 2. Replace 'YOUR_GITHUB_USERNAME' with your actual GitHub username
// 3. Replace 'YOUR_REPO_NAME' with your actual repository name
// 4. Create a release: git tag v1.0.0 && git push origin v1.0.0
export const GITHUB_CONFIG = {
  owner: 'bestie01',
  repo: 'hyvoai-a4f5cb6a',
  get apiUrl() {
    return `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;
  },
} as const;

// Feature flags
export const FEATURES = {
  enableTTS: true,
  enableAIFeatures: true,
  enableMultiStream: true,
} as const;
