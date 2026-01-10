import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, BarChart3, Users, Settings, PlayCircle, TrendingUp, DollarSign, Clock, Radio, MapPin, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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

const navItems = [
  { icon: Home, label: "Overview", path: "/dashboard", count: 16, active: true },
  { icon: Radio, label: "Studio", path: "/studio", count: 0 },
  { icon: BarChart3, label: "Analytics", path: "/dashboard", count: 28 },
  { icon: Users, label: "Community", path: "/community", count: 52 },
  { icon: PlayCircle, label: "Content", path: "/growth", count: 31 },
  { icon: Smartphone, label: "Mobile", path: "/native", count: 7 },
];

export function DashboardSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Overview');

  const handleNavClick = (label: string, path: string) => {
    setActiveItem(label);
    navigate(path);
    toast({
      title: `Navigating to ${label}`,
      description: `Loading ${label.toLowerCase()} section...`,
    });
  };
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
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                   <SidebarMenuButton
                    className={`
                      flex items-center justify-between p-3 rounded-xl transition-all duration-300
                      ${activeItem === item.label 
                        ? 'liquid-glass-active bg-gradient-primary text-white shadow-glow-primary' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                    onClick={() => handleNavClick(item.label, item.path)}
                  >
                    <div className="flex items-center w-full cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!collapsed && item.count > 0 && (
                        <span className="text-sm font-semibold liquid-glass-badge px-2 py-1 rounded-lg">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                  <span className="text-white/60">Revenue</span>
                  <span className="text-white font-semibold">$2,340</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Views</span>
                  <span className="text-white font-semibold">1.2k</span>
                </div>
              </div>
            </div>

            <div className="liquid-glass-panel p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">Activity</span>
              </div>
              <div className="w-16 h-16 rounded-full liquid-glass-icon flex items-center justify-center relative mx-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-primary opacity-60 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse-glow"></div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
