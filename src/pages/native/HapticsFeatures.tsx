import { useState } from "react";
import { ArrowLeft, Vibrate, Play, Zap, Circle, Square, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard, LiquidGlassIcon, LiquidGlassButton, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const impactStyles = [
  { id: ImpactStyle.Light, name: "Light", description: "Subtle tap", icon: Circle, color: "from-green-400 to-emerald-500" },
  { id: ImpactStyle.Medium, name: "Medium", description: "Standard tap", icon: Square, color: "from-blue-400 to-indigo-500" },
  { id: ImpactStyle.Heavy, name: "Heavy", description: "Strong tap", icon: Triangle, color: "from-purple-400 to-pink-500" },
];

const notificationTypes = [
  { id: NotificationType.Success, name: "Success", description: "Positive feedback", color: "bg-green-500" },
  { id: NotificationType.Warning, name: "Warning", description: "Caution alert", color: "bg-amber-500" },
  { id: NotificationType.Error, name: "Error", description: "Error feedback", color: "bg-red-500" },
];

const HapticsFeatures = () => {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const [vibrationDuration, setVibrationDuration] = useState([300]);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const [patternIndex, setPatternIndex] = useState(0);

  const customPatterns = [
    { name: "Double Tap", pattern: async () => {
      await haptics.impact(ImpactStyle.Light);
      await new Promise(r => setTimeout(r, 100));
      await haptics.impact(ImpactStyle.Light);
    }},
    { name: "Heartbeat", pattern: async () => {
      await haptics.impact(ImpactStyle.Heavy);
      await new Promise(r => setTimeout(r, 150));
      await haptics.impact(ImpactStyle.Light);
      await new Promise(r => setTimeout(r, 300));
      await haptics.impact(ImpactStyle.Heavy);
      await new Promise(r => setTimeout(r, 150));
      await haptics.impact(ImpactStyle.Light);
    }},
    { name: "Crescendo", pattern: async () => {
      await haptics.impact(ImpactStyle.Light);
      await new Promise(r => setTimeout(r, 100));
      await haptics.impact(ImpactStyle.Medium);
      await new Promise(r => setTimeout(r, 100));
      await haptics.impact(ImpactStyle.Heavy);
    }},
    { name: "SOS", pattern: async () => {
      // Short short short
      for (let i = 0; i < 3; i++) {
        await haptics.impact(ImpactStyle.Light);
        await new Promise(r => setTimeout(r, 100));
      }
      await new Promise(r => setTimeout(r, 200));
      // Long long long
      for (let i = 0; i < 3; i++) {
        await haptics.vibrate(300);
        await new Promise(r => setTimeout(r, 100));
      }
      await new Promise(r => setTimeout(r, 200));
      // Short short short
      for (let i = 0; i < 3; i++) {
        await haptics.impact(ImpactStyle.Light);
        await new Promise(r => setTimeout(r, 100));
      }
    }},
  ];

  const handleImpact = async (style: ImpactStyle, name: string) => {
    await haptics.impact(style);
    setLastTriggered(name);
  };

  const handleNotification = async (type: NotificationType, name: string) => {
    await haptics.notification(type);
    setLastTriggered(name);
  };

  const handleVibrate = async () => {
    await haptics.vibrate(vibrationDuration[0]);
    setLastTriggered(`Vibrate ${vibrationDuration[0]}ms`);
  };

  const handlePattern = async (index: number) => {
    setPatternIndex(index);
    await customPatterns[index].pattern();
    setLastTriggered(customPatterns[index].name);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

        {/* Header */}
        <header className="liquid-glass-nav relative z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/native-features")}
                className="liquid-glass-button !p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gradient-primary">Haptic Feedback</h1>
                <p className="text-sm text-muted-foreground">Tactile responses & vibrations</p>
              </div>
              {lastTriggered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={lastTriggered}
                >
                  <LiquidGlassBadge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white !border-0">
                    {lastTriggered}
                  </LiquidGlassBadge>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
          {/* Impact Styles */}
          <LiquidGlassCard variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Impact Styles
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              {impactStyles.map((style) => (
                <motion.button
                  key={style.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleImpact(style.id, style.name)}
                  className="focus:outline-none"
                >
                  <LiquidGlassCard className="p-6 text-center" hoverEffect>
                    <LiquidGlassIcon 
                      size="lg" 
                      className={`mx-auto mb-3 bg-gradient-to-br ${style.color} !border-0`}
                    >
                      <style.icon className="w-6 h-6 text-white" />
                    </LiquidGlassIcon>
                    <h3 className="font-semibold">{style.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </LiquidGlassCard>
                </motion.button>
              ))}
            </div>
          </LiquidGlassCard>

          {/* Notification Types */}
          <LiquidGlassCard variant="default" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Vibrate className="w-5 h-5 text-primary" />
              Notification Haptics
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              {notificationTypes.map((type) => (
                <LiquidGlassButton
                  key={type.id}
                  onClick={() => handleNotification(type.id, type.name)}
                  className="flex flex-col items-center gap-2 py-4"
                >
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </LiquidGlassButton>
              ))}
            </div>
          </LiquidGlassCard>

          {/* Custom Vibration */}
          <LiquidGlassCard variant="default" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Custom Vibration
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="text-primary font-mono">{vibrationDuration[0]}ms</span>
                </Label>
                <Slider
                  value={vibrationDuration}
                  onValueChange={setVibrationDuration}
                  min={50}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>
              
              <LiquidGlassButton
                variant="primary"
                onClick={handleVibrate}
                className="w-full flex items-center justify-center gap-2"
              >
                <Vibrate className="w-5 h-5" />
                Vibrate
              </LiquidGlassButton>
            </div>
          </LiquidGlassCard>

          {/* Custom Patterns */}
          <LiquidGlassCard variant="panel" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Custom Patterns
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {customPatterns.map((pattern, index) => (
                <motion.button
                  key={pattern.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePattern(index)}
                  className="focus:outline-none"
                >
                  <LiquidGlassCard 
                    className={`p-4 text-center ${patternIndex === index ? 'liquid-glass-glow-primary' : ''}`}
                    hoverEffect
                  >
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary/60"
                          animate={patternIndex === index ? {
                            scale: [1, 1.5, 1],
                            opacity: [0.6, 1, 0.6],
                          } : {}}
                          transition={{
                            duration: 0.4,
                            delay: i * 0.1,
                            repeat: patternIndex === index ? 2 : 0,
                          }}
                        />
                      ))}
                    </div>
                  </LiquidGlassCard>
                </motion.button>
              ))}
            </div>
          </LiquidGlassCard>
        </main>
      </div>
    </PageTransition>
  );
};

export default HapticsFeatures;
