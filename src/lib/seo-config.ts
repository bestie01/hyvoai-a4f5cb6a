// Central per-route SEO metadata. Add an entry when you add a public route.

export const SITE_URL = "https://hyvoai.lovable.app";
export const SITE_NAME = "Hyvo.ai";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export interface RouteSeoEntry {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const softwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hyvo.ai",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Windows, macOS, Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "284" },
} as const;

export const ROUTE_SEO: Record<string, RouteSeoEntry> = {
  "/": {
    title: "Hyvo.ai — AI Streaming Assistant for YouTube & Twitch",
    description:
      "Automate streaming with AI. Schedule smarter, engage in real-time, create highlights automatically.",
    jsonLd: softwareApp,
  },
  "/pricing": {
    title: "Pricing — Hyvo.ai",
    description:
      "Simple pricing for serious streamers. Pro unlocks AI highlights, multi-stream relay, and unlimited overlays.",
    ogImage: `${SITE_URL}/og-pricing.jpg`,
  },
  "/download": {
    title: "Download Hyvo Stream Studio — Native Desktop App",
    description:
      "Get the native Hyvo Stream Studio for macOS and Windows. Hardware-accelerated streaming with AI on board.",
    ogImage: `${SITE_URL}/og-download.jpg`,
    jsonLd: softwareApp,
  },
  "/auth": {
    title: "Sign in — Hyvo.ai",
    description: "Sign in to Hyvo.ai to manage streams, schedules, and analytics.",
    noindex: true,
  },
  "/changelog": {
    title: "Changelog — Hyvo.ai",
    description: "Release notes for Hyvo.ai and Hyvo Stream Studio.",
  },
  "/community": {
    title: "Community — Hyvo.ai",
    description: "Connect with other creators using Hyvo.ai to grow their streams.",
  },
  "/dashboard": {
    title: "Dashboard — Hyvo.ai",
    description: "Your live streaming command center.",
    noindex: true,
  },
  "/studio": {
    title: "Studio — Hyvo.ai",
    description: "Professional broadcast studio with scenes, mixer, and AI co-pilot.",
    noindex: true,
  },
  "/create": {
    title: "Create a Stream — Hyvo.ai",
    description: "Plan, configure, and go live in minutes.",
    noindex: true,
  },
  "/settings": { title: "Settings — Hyvo.ai", description: "Account preferences.", noindex: true },
  "/profile": { title: "Profile — Hyvo.ai", description: "Your creator profile.", noindex: true },
  "/subscription": {
    title: "Subscription — Hyvo.ai",
    description: "Manage your Hyvo Pro subscription.",
    noindex: true,
  },
  "/schedule": { title: "Schedule — Hyvo.ai", description: "Plan upcoming streams.", noindex: true },
  "/growth": { title: "Growth — Hyvo.ai", description: "Grow your audience.", noindex: true },
  "/native": {
    title: "Native Features — Hyvo.ai",
    description: "Mobile and desktop native capabilities.",
  },
};

export function resolveRouteSeo(pathname: string): RouteSeoEntry {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];
  // longest-prefix fallback (e.g. /native/camera -> /native)
  const match = Object.keys(ROUTE_SEO)
    .filter((p) => p !== "/" && pathname.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (match) return ROUTE_SEO[match];
  return {
    title: "Hyvo.ai — AI Streaming Assistant",
    description: "Automate streaming with AI.",
  };
}
