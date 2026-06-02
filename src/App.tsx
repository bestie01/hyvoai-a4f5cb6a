import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UpdateBanner } from "@/components/UpdateBanner";
import { UpdateCenter } from "@/components/UpdateCenter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorListener } from "@/components/GlobalErrorListener";
import { SkipLink } from "@/components/SkipLink";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { GlobalHotkeysProvider } from "@/components/GlobalHotkeysProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequirePro } from "@/components/auth/RequirePro";
import { PageTransition } from "@/components/animations/PageTransition";
import { AppShell } from "@/components/layout/AppShell";
import { TitleBar } from "@/components/desktop/TitleBar";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const StreamingApp = React.lazy(() => import("./pages/StreamingApp"));
const Download = React.lazy(() => import("./pages/Download"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Profile = React.lazy(() => import("./pages/Profile"));
const SubscriptionSuccess = React.lazy(() => import("./pages/SubscriptionSuccess"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Schedule = React.lazy(() => import("./pages/Schedule"));
const Growth = React.lazy(() => import("./pages/Growth"));
const Community = React.lazy(() => import("./pages/Community"));
const StreamCreator = React.lazy(() => import("./pages/StreamCreator"));
const Subscription = React.lazy(() => import("./pages/Subscription"));
const NativeHub = React.lazy(() => import("./pages/native/NativeHub"));
const CameraFeatures = React.lazy(() => import("./pages/native/CameraFeatures"));
const HapticsFeatures = React.lazy(() => import("./pages/native/HapticsFeatures"));
const StorageFeatures = React.lazy(() => import("./pages/native/StorageFeatures"));
const NotificationFeatures = React.lazy(() => import("./pages/native/NotificationFeatures"));
const DisplayFeatures = React.lazy(() => import("./pages/native/DisplayFeatures"));
const GeolocationFeatures = React.lazy(() => import("./pages/native/GeolocationFeatures"));
const DeviceFeatures = React.lazy(() => import("./pages/native/DeviceFeatures"));
const Changelog = React.lazy(() => import("./pages/Changelog"));

// Smarter React Query defaults: avoid refetch storms on focus, reasonable retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Robust Electron detection
const isElectron = typeof window !== 'undefined' && (
  (window as any).electronAPI?.isElectron === true ||
  navigator.userAgent.includes('Electron')
);
const Router = isElectron ? HashRouter : BrowserRouter;

const VALID_PATHS = [
  '/', '/download', '/pricing', '/dashboard', '/ready-to-stream', '/studio', '/native',
  '/auth', '/profile', '/subscription', '/subscription-success', '/settings', '/schedule',
  '/growth', '/community', '/create', '/changelog'
];

// Normalize Electron hash on cold boot — strip file:// artifacts and land in the app shell, not marketing.
if (isElectron && typeof window !== 'undefined') {
  const hash = window.location.hash || '';
  const cleaned = hash.replace(/^#/, '');
  const looksLikeFilePath =
    cleaned.includes('C:') || cleaned.includes('.html') || cleaned.includes('\\') || cleaned.includes('file://');
  if (!cleaned || cleaned === '/' || looksLikeFilePath) {
    // Default desktop landing — RequireAuth will bounce to /auth if not signed in.
    window.location.hash = '#/dashboard';
  }
}

// Synchronous guard: redirect invalid paths in Electron without useEffect flash
function ElectronRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (isElectron) {
    const path = location.pathname;
    const isFilePath = path.includes('C:') || path.includes('.html') || path.includes('\\');
    const isValidRoute = path === '/' || VALID_PATHS.some(p => path === p || path.startsWith(p + '/'));

    if (isFilePath || !isValidRoute) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

// Wrap every lazy-loaded route in its own ErrorBoundary so one page crash
// can't blank the whole app.
const Page = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

const Protected = ({ children, bleed = false }: { children: React.ReactNode; bleed?: boolean }) => (
  <ErrorBoundary>
    <RequireAuth>
      <AppShell bleed={bleed}>{children}</AppShell>
    </RequireAuth>
  </ErrorBoundary>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen />}>
    <ElectronRouteGuard>
      <main id="main-content">
        <PageTransition>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Page><Index /></Page>} />
            <Route path="/download" element={<Page><Download /></Page>} />
            <Route path="/pricing" element={<Page><Pricing /></Page>} />
            <Route path="/auth" element={<Page><Auth /></Page>} />
            <Route path="/changelog" element={<Page><Changelog /></Page>} />
            <Route path="/native" element={<Page><NativeHub /></Page>} />
            <Route path="/native/camera" element={<Page><CameraFeatures /></Page>} />
            <Route path="/native/haptics" element={<Page><HapticsFeatures /></Page>} />
            <Route path="/native/storage" element={<Page><StorageFeatures /></Page>} />
            <Route path="/native/notifications" element={<Page><NotificationFeatures /></Page>} />
            <Route path="/native/display" element={<Page><DisplayFeatures /></Page>} />
            <Route path="/native/geolocation" element={<Page><GeolocationFeatures /></Page>} />
            <Route path="/native/device" element={<Page><DeviceFeatures /></Page>} />

            {/* In-app (authenticated) routes — wrapped in the persistent AppShell */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/ready-to-stream" element={<Protected><Dashboard /></Protected>} />
            <Route path="/studio" element={<Protected bleed><StreamingApp /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/subscription" element={<Protected><Subscription /></Protected>} />
            <Route path="/subscription-success" element={<Protected><SubscriptionSuccess /></Protected>} />
            <Route path="/settings" element={<Protected><Settings /></Protected>} />
            <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
            <Route path="/growth" element={<Protected><Growth /></Protected>} />
            <Route path="/community" element={<Protected><Community /></Protected>} />
            <Route path="/create" element={<Protected bleed><RequirePro feature="create"><StreamCreator /></RequirePro></Protected>} />

            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </PageTransition>
      </main>
    </ElectronRouteGuard>
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="hyvo-ui-theme">
      <TooltipProvider>
        <ErrorBoundary>
          <GlobalErrorListener />
          <SkipLink />
          <TitleBar />
          <UpdateBanner />
          <UpdateCenter />
          <PWAInstallPrompt />
          <Toaster />
          <Sonner />
          <Router>
            <GlobalHotkeysProvider />
            <KeyboardShortcutsModal />
            <AppRoutes />
          </Router>
          <Analytics />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
