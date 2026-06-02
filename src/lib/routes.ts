import { Home, Radio, BarChart3, Users, PlayCircle, Smartphone, Settings, TrendingUp, Download, FileText, DollarSign, Calendar } from 'lucide-react';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: any;
  showInNav?: boolean;
  showInSidebar?: boolean;
  showInMobile?: boolean;
  requiresAuth?: boolean;
  requiresPro?: boolean;
  isCenterAction?: boolean;
}

// Single source of truth for all routes
export const ROUTES: RouteConfig[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, showInNav: true, showInSidebar: true, showInMobile: true },
  { path: '/studio', label: 'Studio', icon: Radio, showInNav: false, showInSidebar: true, showInMobile: true },
  { path: '/studio', label: 'Go Live', icon: PlayCircle, showInMobile: true, isCenterAction: true },
  { path: '/create', label: 'Create', showInNav: true, requiresPro: true },
  { path: '/growth', label: 'Growth', icon: TrendingUp, showInNav: true, showInSidebar: true },
  { path: '/community', label: 'Community', icon: Users, showInNav: true, showInSidebar: true, showInMobile: true },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/pricing', label: 'Pricing', icon: DollarSign, showInNav: true },
  { path: '/subscription', label: 'Subscription', icon: DollarSign, showInSidebar: true },
  { path: '/download', label: 'Download', icon: Download, showInNav: true },
  { path: '/changelog', label: 'Changelog', icon: FileText, showInNav: true },
  { path: '/native', label: 'Mobile', icon: Smartphone, showInSidebar: true },
  { path: '/settings', label: 'Settings', icon: Settings, showInMobile: true },
];

export const getNavRoutes = () => ROUTES.filter(r => r.showInNav);
export const getSidebarRoutes = () => ROUTES.filter(r => r.showInSidebar);
export const getMobileRoutes = () => ROUTES.filter(r => r.showInMobile);

export function isRouteActive(currentPath: string, routePath: string): boolean {
  if (routePath === '/') return currentPath === '/';
  return currentPath === routePath || currentPath.startsWith(routePath + '/');
}

// Default landing route after OAuth success.
export const POST_AUTH_PATH = '/ready-to-stream';

// Production URL — never hand Supabase a localhost callback during OAuth.
const PRODUCTION_URL = 'https://hyvoai.lovable.app';

// Get safe redirect URL for OAuth (works on web, preview, and Electron)
export function getRedirectUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return `${PRODUCTION_URL}${path}`;

  const isElectronEnv = (window as any).electronAPI?.isElectron === true
    || navigator.userAgent.includes('Electron');
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';

  // For Electron and local dev, redirect through the production URL so Supabase
  // never gets a localhost callback (which would 404 in the OAuth flow).
  if (isElectronEnv || isLocal) {
    return `${PRODUCTION_URL}${path}`;
  }
  // On real lovable preview / published / custom domains, use current origin.
  return `${window.location.origin}${path}`;
}
