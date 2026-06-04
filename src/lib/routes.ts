import { Home, Radio, Users, PlayCircle, Smartphone, Settings, TrendingUp, Download, FileText, DollarSign, Calendar, User as UserIcon } from 'lucide-react';

export type RouteGroup = 'main' | 'create' | 'account' | 'public';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: any;
  group?: RouteGroup;
  showInNav?: boolean;
  showInSidebar?: boolean;
  showInMobile?: boolean;
  requiresAuth?: boolean;
  requiresPro?: boolean;
  isCenterAction?: boolean;
}

// Single source of truth for all routes
export const ROUTES: RouteConfig[] = [
  // Main app
  { path: '/dashboard', label: 'Dashboard', icon: Home, group: 'main', showInNav: true, showInSidebar: true, showInMobile: true },
  { path: '/studio', label: 'Studio', icon: Radio, group: 'main', showInSidebar: true, showInMobile: true },
  { path: '/create', label: 'Create', icon: PlayCircle, group: 'create', showInNav: true, showInSidebar: true, requiresPro: true },
  { path: '/schedule', label: 'Schedule', icon: Calendar, group: 'main', showInSidebar: true },
  { path: '/growth', label: 'Growth', icon: TrendingUp, group: 'main', showInNav: true, showInSidebar: true },
  { path: '/community', label: 'Community', icon: Users, group: 'main', showInNav: true, showInSidebar: true, showInMobile: true },

  // Account
  { path: '/profile', label: 'Profile', icon: UserIcon, group: 'account', showInSidebar: true },
  { path: '/subscription', label: 'Subscription', icon: DollarSign, group: 'account', showInSidebar: true },
  { path: '/settings', label: 'Settings', icon: Settings, group: 'account', showInSidebar: true, showInMobile: true },

  // Public
  { path: '/pricing', label: 'Pricing', icon: DollarSign, group: 'public', showInNav: true },
  { path: '/download', label: 'Download', icon: Download, group: 'public', showInNav: true },
  { path: '/changelog', label: 'Changelog', icon: FileText, group: 'public', showInNav: true },
  { path: '/native', label: 'Mobile', icon: Smartphone, group: 'public', showInSidebar: true },
];

export const getNavRoutes = () => ROUTES.filter(r => r.showInNav);
export const getSidebarRoutes = () => ROUTES.filter(r => r.showInSidebar);
export const getMobileRoutes = () => ROUTES.filter(r => r.showInMobile);

export function isRouteActive(currentPath: string, routePath: string): boolean {
  if (routePath === '/') return currentPath === '/';
  return currentPath === routePath || currentPath.startsWith(routePath + '/');
}

export const POST_AUTH_PATH = '/ready-to-stream';

const PRODUCTION_URL = 'https://hyvoai.lovable.app';

export function getRedirectUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return `${PRODUCTION_URL}${path}`;

  const isElectronEnv = (window as any).electronAPI?.isElectron === true
    || navigator.userAgent.includes('Electron');
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';

  if (isElectronEnv || isLocal) {
    return `${PRODUCTION_URL}${path}`;
  }
  return `${window.location.origin}${path}`;
}
