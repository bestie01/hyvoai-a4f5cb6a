import { ChevronLeft, ChevronRight, PlayCircle, Clock, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSidebarRoutes, isRouteActive } from "@/lib/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getSidebarRoutes();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-white/10 liquid-glass-panel">
      <SidebarContent className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center bg-gradient-primary">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="text-white font-semibold">Hyvo.ai</span>}
          </div>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => {
                const active = isRouteActive(location.pathname, item.path);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path + item.label}>
                    <SidebarMenuButton
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                        active
                          ? 'liquid-glass-active bg-gradient-primary text-white shadow-glow-primary'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <div className="flex items-center w-full cursor-pointer">
                        <div className="flex items-center gap-3 flex-1">
                          {Icon && <Icon className="w-5 h-5" />}
                          {!collapsed && <span className="font-medium">{item.label}</span>}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-8 space-y-4">
            <div className="liquid-glass-panel p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-white font-medium">Live Stats</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Status</span>
                  <span className="text-white font-semibold">Ready</span>
                </div>
              </div>
            </div>
            <div className="liquid-glass-panel p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">Activity</span>
              </div>
              <div className="w-16 h-16 rounded-full liquid-glass-icon flex items-center justify-center relative mx-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-primary opacity-60 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse-glow" />
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
