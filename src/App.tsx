import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UpdateBanner } from "@/components/UpdateBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/SkipLink";
import { LoadingScreen } from "@/components/ui/loading-screen";
 import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
 import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
 import { GlobalHotkeysProvider } from "@/components/GlobalHotkeysProvider";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better initial load performance
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
          <BrowserRouter>
             <GlobalHotkeysProvider />
             <KeyboardShortcutsModal />
            <Suspense fallback={<LoadingScreen />}>
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
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </Suspense>
          </BrowserRouter>
          <Analytics />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
