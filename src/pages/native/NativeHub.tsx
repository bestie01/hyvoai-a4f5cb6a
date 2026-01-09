import { ArrowLeft, Camera, Vibrate, HardDrive, Bell, Smartphone, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard, LiquidGlassIcon, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";

const features = [
  {
    id: "camera",
    title: "Camera & Gallery",
    description: "Capture photos, pick from gallery, adjust quality settings",
    icon: Camera,
    path: "/native/camera",
    color: "from-blue-500 to-cyan-500",
    badge: "Photos",
  },
  {
    id: "haptics",
    title: "Haptic Feedback",
    description: "Tactile responses with various patterns and intensities",
    icon: Vibrate,
    path: "/native/haptics",
    color: "from-purple-500 to-pink-500",
    badge: "Touch",
  },
  {
    id: "storage",
    title: "Local Storage",
    description: "Save and manage files, export highlights, storage stats",
    icon: HardDrive,
    path: "/native/storage",
    color: "from-emerald-500 to-teal-500",
    badge: "Files",
  },
  {
    id: "notifications",
    title: "Push Notifications",
    description: "Schedule alerts, manage permissions, notification history",
    icon: Bell,
    path: "/native/notifications",
    color: "from-orange-500 to-amber-500",
    badge: "Alerts",
  },
  {
    id: "display",
    title: "Display & Status Bar",
    description: "Customize status bar, screen brightness, orientation",
    icon: Smartphone,
    path: "/native/display",
    color: "from-rose-500 to-red-500",
    badge: "Display",
  },
];

const NativeHub = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
        
        {/* Header */}
        <header className="liquid-glass-nav relative z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="liquid-glass-button !p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gradient-primary">Native Features</h1>
                <p className="text-sm text-muted-foreground">Access device capabilities</p>
              </div>
              <LiquidGlassBadge className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Beta</span>
              </LiquidGlassBadge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10">
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <LiquidGlassCard
                  className="p-6 cursor-pointer group"
                  onClick={() => navigate(feature.path)}
                  variant="default"
                >
                  <div className="flex items-start gap-4">
                    <LiquidGlassIcon size="lg" className={`bg-gradient-to-br ${feature.color} !border-0`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </LiquidGlassIcon>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <LiquidGlassBadge className="text-[10px]">
                          {feature.badge}
                        </LiquidGlassBadge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <LiquidGlassCard variant="panel" className="p-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Native Mobile Experience</h2>
                <p className="text-muted-foreground mb-6">
                  Access powerful device features when running as a native app on iOS or Android. 
                  These features require the Capacitor runtime and won't work in a standard browser.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <LiquidGlassBadge>iOS</LiquidGlassBadge>
                  <LiquidGlassBadge>Android</LiquidGlassBadge>
                  <LiquidGlassBadge>Capacitor</LiquidGlassBadge>
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default NativeHub;
