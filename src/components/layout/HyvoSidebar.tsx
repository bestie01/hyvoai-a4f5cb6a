import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Radio, Calendar, TrendingUp, Users, CreditCard,
  Settings, User as UserIcon, LogOut, ChevronLeft, ChevronRight, Crown,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import hyvoLogo from "/hyvo-logo.png";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/studio", label: "Ready to Stream", icon: Radio },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/growth", label: "Growth", icon: TrendingUp },
  { to: "/community", label: "Community", icon: Users },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
];

const FOOTER_NAV: NavItem[] = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function HyvoSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-primary/20 text-white shadow-glow-primary border border-primary/30"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`
        }
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={`flex-shrink-0 h-full liquid-glass-panel border-r border-white/10 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
        <img src={hyvoLogo} alt="Hyvo.ai" className="w-9 h-9 rounded-lg flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-white font-display font-bold tracking-tight">Hyvo.ai</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Studio</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-7 h-7 p-0 text-white/50 hover:text-white hover:bg-white/10"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map(renderItem)}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        {FOOTER_NAV.map(renderItem)}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
        {!collapsed && user?.email && (
          <div className="px-3 pt-2 text-[11px] text-white/40 truncate" title={user.email}>
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
}
