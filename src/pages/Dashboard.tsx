import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { DashboardRightPanel } from "@/components/dashboard/DashboardRightPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIPredictiveDashboard } from "@/components/ai/AIPredictiveDashboard";
import { WelcomeWizard } from "@/components/onboarding/WelcomeWizard";
import { ProductTour } from "@/components/onboarding/ProductTour";
 import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showWelcome, showTour, completeWelcome, completeTour } = useOnboarding();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen liquid-glass-mesh flex items-center justify-center">
        <div className="liquid-glass-panel p-8 rounded-2xl">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen liquid-glass-mesh" data-tour="dashboard">
      {/* Onboarding */}
      <WelcomeWizard isOpen={showWelcome} onComplete={completeWelcome} />
      <ProductTour run={showTour} onComplete={completeTour} />

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            
            <div className="flex-1 flex">
              <main className="flex-1 p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="liquid-glass-panel">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
                    <TabsTrigger value="ai-insights" data-tour="ai-tools" className="data-[state=active]:bg-white/20">🤖 AI Insights</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-6" data-tour="analytics">
                    <DashboardMain />
                  </TabsContent>
                  <TabsContent value="ai-insights" className="mt-6">
                    <AIPredictiveDashboard />
                  </TabsContent>
                </Tabs>
              </main>
              
               <aside className="w-80 liquid-glass-panel m-4 rounded-2xl overflow-hidden hidden lg:block">
                <DashboardRightPanel />
              </aside>
            </div>
          </div>
        </div>
         
         {/* Mobile Bottom Navigation */}
         <MobileBottomNav />
      </SidebarProvider>
       
       {/* Bottom padding for mobile to account for bottom nav */}
       <div className="h-20 md:hidden" />
    </div>
  );
};

export default Dashboard;
