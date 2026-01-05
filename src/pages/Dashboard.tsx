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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" data-tour="dashboard">
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
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ai-insights" data-tour="ai-tools">🤖 AI Insights</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-6" data-tour="analytics">
                    <DashboardMain />
                  </TabsContent>
                  <TabsContent value="ai-insights" className="mt-6">
                    <AIPredictiveDashboard />
                  </TabsContent>
                </Tabs>
              </main>
              
              <aside className="w-80">
                <DashboardRightPanel />
              </aside>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
