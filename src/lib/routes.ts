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

// Get safe redirect URL for OAuth (works on both web and Electron)
export function getRedirectUrl(path: string = '/'): string {
  const isElectronEnv = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;
  if (isElectronEnv) {
    // For Electron, use the published web URL for OAuth callbacks
    return `https://hyvoai.lovable.app${path}`;
  }
  return `${window.location.origin}${path}`;
}
