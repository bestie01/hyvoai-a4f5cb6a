import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { DashboardRightPanel } from "@/components/dashboard/DashboardRightPanel";
import { AIPredictiveDashboard } from "@/components/ai/AIPredictiveDashboard";
import { WelcomeWizard } from "@/components/onboarding/WelcomeWizard";
import { ProductTour } from "@/components/onboarding/ProductTour";
import { StreamHealthOverlay } from "@/components/dashboard/StreamHealthOverlay";
import { IngestPanel } from "@/components/streaming/IngestPanel";
import { StreamCanvasPreview } from "@/components/streaming/StreamCanvasPreview";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { getDraftStream, clearDraftStream } from "@/lib/draftStream";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { showWelcome, showTour, completeWelcome, completeTour } = useOnboarding();
  const location = useLocation();
  const { toast } = useToast();

  // Hand-off from /create: if a draft is staged, surface it once.
  useEffect(() => {
    const fromState = (location.state as any)?.draftStream;
    const draft = fromState ?? getDraftStream();
    if (draft && draft.title) {
      toast({
        title: "Draft loaded from Create",
        description: `"${draft.title}" — ${draft.quality} @ ${draft.fps}fps, ${draft.platforms.join(", ")}.`,
      });
      // Clear after surfacing so it doesn't re-fire on every visit.
      clearDraftStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex gap-6 h-full" data-tour="dashboard">
      <WelcomeWizard isOpen={showWelcome} onComplete={completeWelcome} />
      <ProductTour run={showTour} onComplete={completeTour} />

      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Ready to Stream</h1>
            <p className="text-white/60 mt-1">Your streaming command center.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="liquid-glass-button"
            onClick={() => window.dispatchEvent(new Event("hyvo:toggle-stream-health"))}
          >
            <Activity className="w-4 h-4 mr-2 text-emerald-400" />
            Stream Health
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="liquid-glass-panel">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights" data-tour="ai-tools" className="data-[state=active]:bg-white/20">AI Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6" data-tour="analytics">
            <DashboardMain />
          </TabsContent>
          <TabsContent value="ai-insights" className="mt-6">
            <AIPredictiveDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <aside className="w-80 liquid-glass-panel rounded-2xl overflow-hidden hidden xl:block flex-shrink-0">
        <DashboardRightPanel />
      </aside>

      <StreamHealthOverlay />
    </div>
  );
};

export default Dashboard;
