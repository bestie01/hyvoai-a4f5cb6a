import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProStreamAnalytics } from "./ProStreamAnalytics";
import { DraggableWidget } from "./DraggableWidget";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { useDashboardCelebrations } from "@/hooks/useDashboardCelebrations";
import { Confetti } from "@/components/effects/Confetti";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Play, 
  Calendar, 
  Activity,
  Brain,
  Sparkles,
  Radio,
  Zap,
  Settings2,
  RotateCcw,
  PartyPopper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidGlassCard, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { toast } from "sonner";

export function DashboardMain() {
  const navigate = useNavigate();
  const { getAnalytics, metrics, loading } = useRealtimeAnalytics();
  const [showWidgetControls, setShowWidgetControls] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  const {
    widgets,
    draggedWidget,
    dragOverWidget,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    toggleVisibility,
    resetToDefaults,
  } = useDashboardWidgets();

  const {
    celebration,
    resetConfetti,
    celebrateFirstLive,
    checkViewerMilestone,
  } = useDashboardCelebrations();

  useEffect(() => {
    getAnalytics(7);
  }, [getAnalytics]);

  // Simulate going live and milestone checks
  const handleGoLive = () => {
    setIsLive(true);
    const isFirst = celebrateFirstLive();
    if (isFirst) {
      toast.success("🎉 Congratulations on your first stream!", {
        description: "You're officially a streamer now!",
        duration: 5000,
      });
    }
    navigate('/studio');
  };

  // Check for viewer milestones when metrics change
  useEffect(() => {
    if (metrics?.peakViewers) {
      const milestone = checkViewerMilestone(metrics.peakViewers);
      if (milestone) {
        toast.success(`🎊 ${milestone.toLocaleString()} viewer milestone!`, {
          description: "You're growing fast! Keep up the great work!",
          duration: 5000,
        });
      }
    }
  }, [metrics?.peakViewers, checkViewerMilestone]);

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

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "stats":
        return (
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
        );

      case "ai-features":
        return (
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
        );

      case "analytics":
        return <ProStreamAnalytics />;

      case "schedule":
        return (
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Confetti Celebration */}
      <Confetti 
        isActive={celebration.showConfetti} 
        onComplete={resetConfetti}
        count={celebration.celebrationType === "first-live" ? 150 : 100}
      />

      {/* Celebration Toast Overlay */}
      <AnimatePresence>
        {celebration.showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full shadow-lg">
              <PartyPopper className="w-5 h-5" />
              <span className="font-semibold">
                {celebration.celebrationType === "first-live" 
                  ? "🎉 First Stream Celebration!" 
                  : `🎊 ${celebration.milestoneValue?.toLocaleString()} Viewers Milestone!`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back!</h2>
          <p className="text-white/60">
            Here's what's happening with your streams today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Widget Controls Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWidgetControls(!showWidgetControls)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            {showWidgetControls ? "Done" : "Customize"}
          </Button>
          
          {showWidgetControls && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-primary hover:opacity-90 shadow-glow-primary rounded-xl"
              onClick={handleGoLive}
            >
              <Radio className="w-5 h-5 animate-pulse" />
              Go Live Now
              <Sparkles className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Customization Hint */}
      <AnimatePresence>
        {showWidgetControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-white/80">
              <strong>Customize your dashboard:</strong> Drag widgets to reorder them, or click the eye icon to show/hide sections.
              Your layout is saved automatically.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Widgets */}
      <div className="space-y-8">
        {widgets.map((widget) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            isDragging={draggedWidget === widget.id}
            isDragOver={dragOverWidget === widget.id}
            onDragStart={() => handleDragStart(widget.id)}
            onDragOver={() => handleDragOver(widget.id)}
            onDragEnd={handleDragEnd}
            visible={widget.visible}
            onToggleVisibility={() => toggleVisibility(widget.id)}
            showControls={showWidgetControls}
          >
            {renderWidget(widget.id)}
          </DraggableWidget>
        ))}
      </div>
    </div>
  );
}
