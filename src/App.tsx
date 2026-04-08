import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UpdateBanner } from "@/components/UpdateBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/SkipLink";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { GlobalHotkeysProvider } from "@/components/GlobalHotkeysProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
const NativeHub = React.lazy(() => import("./pages/native/NativeHub"));
const CameraFeatures = React.lazy(() => import("./pages/native/CameraFeatures"));
const HapticsFeatures = React.lazy(() => import("./pages/native/HapticsFeatures"));
const StorageFeatures = React.lazy(() => import("./pages/native/StorageFeatures"));
const NotificationFeatures = React.lazy(() => import("./pages/native/NotificationFeatures"));
const DisplayFeatures = React.lazy(() => import("./pages/native/DisplayFeatures"));
const GeolocationFeatures = React.lazy(() => import("./pages/native/GeolocationFeatures"));
const DeviceFeatures = React.lazy(() => import("./pages/native/DeviceFeatures"));
const Changelog = React.lazy(() => import("./pages/Changelog"));

const queryClient = new QueryClient();

// Robust Electron detection
const isElectron = typeof window !== 'undefined' && (
  (window as any).electronAPI?.isElectron === true ||
  navigator.userAgent.includes('Electron')
);
const Router = isElectron ? HashRouter : BrowserRouter;

// Synchronous guard: redirect invalid paths in Electron without useEffect flash
function ElectronRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (isElectron) {
    const path = location.pathname;
    // Redirect file:// artifacts or invalid paths synchronously
    const isFilePath = path.includes('C:') || path.includes('.html') || path.includes('\\');
    const isValidRoute = path === '/' || VALID_PATHS.some(p => path === p || path.startsWith(p + '/'));
    
    if (isFilePath || !isValidRoute) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

const VALID_PATHS = [
  '/', '/download', '/pricing', '/dashboard', '/studio', '/native',
  '/auth', '/profile', '/subscription-success', '/settings', '/schedule',
  '/growth', '/community', '/create', '/changelog'
];

const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen />}>
    <ElectronRouteGuard>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/download" element={<Download />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<StreamingApp />} />
          <Route path="/native" element={<NativeHub />} />
          <Route path="/native/camera" element={<CameraFeatures />} />
          <Route path="/native/haptics" element={<HapticsFeatures />} />
          <Route path="/native/storage" element={<StorageFeatures />} />
          <Route path="/native/notifications" element={<NotificationFeatures />} />
          <Route path="/native/display" element={<DisplayFeatures />} />
          <Route path="/native/geolocation" element={<GeolocationFeatures />} />
          <Route path="/native/device" element={<DeviceFeatures />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/community" element={<Community />} />
          <Route path="/create" element={<StreamCreator />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </ElectronRouteGuard>
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="hyvo-ui-theme">
      <TooltipProvider>
        <ErrorBoundary>
          <SkipLink />
          <UpdateBanner />
          <PWAInstallPrompt />
          <Toaster />
          <Sonner />
          <Router>
            <GlobalHotkeysProvider />
            <KeyboardShortcutsModal />
            <AppRoutes />
          </Router>
          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
