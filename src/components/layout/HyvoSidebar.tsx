import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Radio, Calendar, TrendingUp, Users, CreditCard,
  Settings, User as UserIcon, LogOut, ChevronLeft, ChevronRight, Crown, Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import hyvoLogo from "/hyvo-logo.png";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { to: "/dashboard",  label: "Dashboard",       icon: Home },
  { to: "/studio",     label: "Ready to Stream", icon: Radio },
  { to: "/create",     label: "Create",          icon: Sparkles },
  { to: "/schedule",   label: "Schedule",        icon: Calendar },
  { to: "/growth",     label: "Growth",          icon: TrendingUp },
  { to: "/community",  label: "Community",       icon: Users },
  { to: "/subscription", label: "Subscription",  icon: CreditCard },
];

const FOOTER_NAV: NavItem[] = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
];

const LS_KEY = "hyvo.sidebar.collapsed";
const COCKPIT_ROUTES = ["/studio", "/ready-to-stream", "/create"];

function initialsOf(name?: string | null) {
  if (!name) return "U";
  return name.split(/[\s@.]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

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

  const fullName = (user?.user_metadata as any)?.full_name as string | undefined;
  const avatarUrl = (user?.user_metadata as any)?.avatar_url as string | undefined;
  const displayName = fullName || user?.email?.split("@")[0] || "Streamer";

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
    const link = (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
            collapsed ? "justify-center" : ""
          } ${
            isActive
              ? "text-white"
              : "text-white/70 hover:text-white hover:bg-white/[0.06]"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/30 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {isActive && (
              <motion.span
                layoutId="sidebar-active-accent"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-gradient-to-b from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-violet))] shadow-[0_0_12px_hsl(var(--neon-cyan)/0.8)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
            {!collapsed && <span className="text-sm font-medium truncate relative z-10">{item.label}</span>}
          </>
        )}
      </NavLink>
    );
    if (!collapsed) return link;
    return (
      <Tooltip key={item.to} delayDuration={150}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <aside
      className={`flex-shrink-0 h-full liquid-glass-panel border-r border-white/10 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
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

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map(renderItem)}
      </nav>

      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        {FOOTER_NAV.map(renderItem)}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>

        {/* Real account card */}
        {user && !collapsed && (
          <div className="mt-2 mx-1 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <div className={`relative ${showProBadge ? "p-[1.5px] rounded-full bg-gradient-to-tr from-amber-400 via-pink-400 to-[hsl(var(--neon-violet))]" : ""}`}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-[11px] bg-primary/20 text-white">{initialsOf(displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate" title={displayName}>{displayName}</div>
              <div className="text-[10px] text-white/40 truncate">{user.email}</div>
            </div>
            {showProBadge && (
              <Badge className="h-5 px-1.5 text-[9px] bg-gradient-to-r from-amber-400 to-amber-600 text-black border-0 font-bold">
                <Crown className="w-2.5 h-2.5 mr-0.5" />
                {tierLabel}
              </Badge>
            )}
          </div>
        )}
        {user && collapsed && (
          <div className="flex flex-col items-center gap-1 pt-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-[10px] bg-primary/20 text-white">{initialsOf(displayName)}</AvatarFallback>
            </Avatar>
            {showProBadge && <Crown className="w-3 h-3 text-amber-400" />}
          </div>
        )}
      </div>
    </aside>
  );
}
