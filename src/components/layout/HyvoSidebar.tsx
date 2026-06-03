import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Radio, Calendar, TrendingUp, Users, CreditCard,
  Settings, User as UserIcon, LogOut, ChevronLeft, ChevronRight, Crown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import hyvoLogo from "/hyvo-logo.png";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  essential?: boolean;
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Home, essential: true },
  { to: "/studio", label: "Ready to Stream", icon: Radio, essential: true },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/growth", label: "Growth", icon: TrendingUp },
  { to: "/community", label: "Community", icon: Users },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
];

const FOOTER_NAV: NavItem[] = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
];

const LS_KEY = "hyvo.sidebar.collapsed";
const COCKPIT_ROUTES = ["/studio", "/ready-to-stream", "/create"];

export function HyvoSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored !== null) return stored === "1";
    } catch {}
    return COCKPIT_ROUTES.some(r => location.pathname.startsWith(r));
  });
  const { user, signOut } = useAuth();
  const { isPaid, isPaused, subscription } = useSubscription();
  const navigate = useNavigate();
  const showProBadge = isPaid && !isPaused;
  const tierLabel = subscription.subscription_tier === 'Year One' ? 'Year One' : 'Pro';

  // Auto-collapse on cockpit routes (only if user hasn't toggled manually for this route change)
  useEffect(() => {
    if (COCKPIT_ROUTES.some(r => location.pathname.startsWith(r))) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

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
          <div className="px-3 pt-2 flex items-center gap-2">
            <span className="text-[11px] text-white/40 truncate flex-1" title={user.email}>
              {user.email}
            </span>
            {showProBadge && (
              <Badge className="h-5 px-1.5 text-[10px] bg-gradient-to-r from-amber-400 to-amber-600 text-black border-0 font-semibold">
                <Crown className="w-2.5 h-2.5 mr-0.5" />
                {tierLabel}
              </Badge>
            )}
          </div>
        )}
        {collapsed && showProBadge && (
          <div className="flex justify-center pt-2">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </div>
    </aside>
  );
}
