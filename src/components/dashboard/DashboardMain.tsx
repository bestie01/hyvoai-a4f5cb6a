import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProStreamAnalytics } from "./ProStreamAnalytics";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Play, 
  Calendar, 
  Activity,
  Brain,
  Sparkles,
  Radio,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { LiquidGlassCard, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";

export function DashboardMain() {
  const navigate = useNavigate();
  const { getAnalytics, metrics, loading } = useRealtimeAnalytics();

  useEffect(() => {
    getAnalytics(7);
  }, [getAnalytics]);

  const statCards = [
    {
      title: "Total Streams",
      value: loading ? "..." : metrics?.totalStreams || 0,
      icon: Play,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Viewers",
      value: loading ? "..." : metrics?.totalViewers.toLocaleString() || 0,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Peak Viewers",
      value: loading ? "..." : metrics?.peakViewers.toLocaleString() || 0,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Avg Engagement",
      value: loading ? "..." : `${metrics?.avgEngagement.toFixed(1) || 0}%`,
      icon: Activity,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
    },
  ];

  const aiFeatures = [
    {
      title: "AI Chat Analysis",
      icon: Brain,
      items: [
        { label: "Sentiment Analysis", status: "Active" },
        { label: "Toxicity Detection", status: "Running" },
        { label: "Trend Tracking", status: "Live" },
      ],
    },
    {
      title: "AI Highlights",
      icon: Sparkles,
      items: [
        { label: "Auto Detection", status: "Enabled" },
        { label: "Clip Generation", status: "Coming Soon", variant: "outline" as const },
        { label: "Social Export", status: "Coming Soon", variant: "outline" as const },
      ],
    },
    {
      title: "Real-time Analytics",
      icon: Zap,
      items: [
        { label: "Live Tracking", status: "Active" },
        { label: "Data Sync", status: "30s" },
        { label: "Alerts", status: "Enabled" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back!</h2>
          <p className="text-white/60">
            Here's what's happening with your streams today.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="lg" 
            className="gap-2 bg-gradient-primary hover:opacity-90 shadow-glow-primary rounded-xl"
            onClick={() => navigate('/studio')}
          >
            <Radio className="w-5 h-5 animate-pulse" />
            Go Live Now
            <Sparkles className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LiquidGlassCard variant="panel" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center liquid-glass-icon`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>

      {/* AI Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {aiFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <LiquidGlassCard variant="elevated" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-white">{feature.title}</h3>
              </div>
              <div className="space-y-3">
                {feature.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-white/60">{item.label}</span>
                    <LiquidGlassBadge className={item.variant === 'outline' ? 'bg-transparent border border-white/20' : ''}>
                      {item.status}
                    </LiquidGlassBadge>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>

      {/* Pro Analytics */}
      <ProStreamAnalytics />

      {/* Stream Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <LiquidGlassCard variant="panel" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Upcoming Streams</h3>
          </div>
          <div className="space-y-3">
            {["Gaming Session - Tonight 8 PM", "IRL Stream - Tomorrow 3 PM", "Collab Stream - Friday 7 PM"].map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-3 liquid-glass-panel rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm text-white">{stream}</span>
                </div>
                <LiquidGlassBadge className="bg-transparent border border-white/20">
                  Scheduled
                </LiquidGlassBadge>
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
}
