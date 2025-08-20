import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, BarChart3, Users, Settings, PlayCircle, TrendingUp, DollarSign, Clock } from "lucide-react";
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
  { icon: Home, label: "Dashboard", count: 16, active: true },
  { icon: BarChart3, label: "Analytics", count: 28 },
  { icon: Users, label: "Users", count: 52 },
  { icon: PlayCircle, label: "Content", count: 31 },
];

export function DashboardSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-white/10 bg-black/40 backdrop-blur-xl">
      <SidebarContent className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-white" />
            </div>
            {!collapsed && <span className="text-white font-semibold">DialInsorUp</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-white/60 hover:text-white hover:bg-white/10"
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
                    asChild
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-all duration-200
                      ${item.active 
                        ? 'bg-gradient-primary text-white shadow-glow-primary' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center gap-3 flex-1">
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!collapsed && (
                        <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">
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
            <div className="bg-gradient-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-white font-medium">Live Stats</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Revenue</span>
                  <span className="text-white">$2,340</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Views</span>
                  <span className="text-white">1.2k</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">Activity</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-primary/20 flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-gradient-primary opacity-60"></div>
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-glow"></div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}