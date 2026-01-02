import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Download from "./pages/Download";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import StreamingApp from "./pages/StreamingApp";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import NotFound from "./pages/NotFound";
import NativeFeaturesDemo from "./pages/NativeFeaturesDemo";
import Settings from "./pages/Settings";
import Schedule from "./pages/Schedule";
import Growth from "./pages/Growth";
import Community from "./pages/Community";
import StreamCreator from "./pages/StreamCreator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="hyvo-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/download" element={<Download />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<StreamingApp />} />
          <Route path="/native-features" element={<NativeFeaturesDemo />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
