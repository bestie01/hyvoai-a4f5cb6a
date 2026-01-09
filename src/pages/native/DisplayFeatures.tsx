import { useState } from "react";
import { ArrowLeft, Smartphone, Sun, Moon, Eye, EyeOff, RotateCcw, Palette, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LiquidGlassCard, LiquidGlassIcon, LiquidGlassButton, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { useStatusBar } from "@/hooks/useStatusBar";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle } from "@capacitor/haptics";
import { Style } from "@capacitor/status-bar";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const colorPresets = [
  { name: "Default", light: "#ffffff", dark: "#1e293b" },
  { name: "Primary", light: "#8b5cf6", dark: "#7c3aed" },
  { name: "Accent", light: "#14b8a6", dark: "#0d9488" },
  { name: "Rose", light: "#f43f5e", dark: "#e11d48" },
  { name: "Amber", light: "#f59e0b", dark: "#d97706" },
  { name: "Emerald", light: "#10b981", dark: "#059669" },
];

const DisplayFeatures = () => {
  const navigate = useNavigate();
  const statusBar = useStatusBar();
  const haptics = useHaptics();
  const [currentStyle, setCurrentStyle] = useState<"light" | "dark">("dark");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [brightness, setBrightness] = useState([80]);
  const [keepAwake, setKeepAwake] = useState(false);

  const handleStyleChange = async (style: "light" | "dark") => {
    await haptics.impact(ImpactStyle.Light);
    setCurrentStyle(style);
    if (style === "light") {
      await statusBar.setStyle(Style.Light);
      await statusBar.setBackgroundColor(selectedColor.light);
    } else {
      await statusBar.setStyle(Style.Dark);
      await statusBar.setBackgroundColor(selectedColor.dark);
    }
  };

  const handleColorChange = async (preset: typeof colorPresets[0]) => {
    await haptics.impact(ImpactStyle.Light);
    setSelectedColor(preset);
    await statusBar.setBackgroundColor(currentStyle === "light" ? preset.light : preset.dark);
  };

  const handleVisibilityToggle = async () => {
    await haptics.impact(ImpactStyle.Medium);
    if (isVisible) {
      await statusBar.hide();
    } else {
      await statusBar.show();
    }
    setIsVisible(!isVisible);
  };

  const handleReset = async () => {
    await haptics.impact(ImpactStyle.Heavy);
    setCurrentStyle("dark");
    setSelectedColor(colorPresets[0]);
    setIsVisible(true);
    setBrightness([80]);
    setKeepAwake(false);
    await statusBar.setStyle(Style.Dark);
    await statusBar.setBackgroundColor(colorPresets[0].dark);
    await statusBar.show();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />

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
                <h1 className="text-2xl font-bold text-gradient-primary">Display & Status Bar</h1>
                <p className="text-sm text-muted-foreground">Customize display settings</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
          {/* Status Bar Style */}
          <LiquidGlassCard variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Status Bar Style
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleChange("light")}
                className="focus:outline-none"
              >
                <LiquidGlassCard 
                  className={`p-6 text-center ${currentStyle === 'light' ? 'liquid-glass-glow-primary' : ''}`}
                  hoverEffect
                >
                  <LiquidGlassIcon size="lg" className="mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 !border-0">
                    <Sun className="w-7 h-7 text-white" />
                  </LiquidGlassIcon>
                  <h3 className="font-semibold">Light Mode</h3>
                  <p className="text-xs text-muted-foreground mt-1">Dark icons on light background</p>
                </LiquidGlassCard>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleChange("dark")}
                className="focus:outline-none"
              >
                <LiquidGlassCard 
                  className={`p-6 text-center ${currentStyle === 'dark' ? 'liquid-glass-glow-primary' : ''}`}
                  hoverEffect
                >
                  <LiquidGlassIcon size="lg" className="mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 !border-0">
                    <Moon className="w-7 h-7 text-white" />
                  </LiquidGlassIcon>
                  <h3 className="font-semibold">Dark Mode</h3>
                  <p className="text-xs text-muted-foreground mt-1">Light icons on dark background</p>
                </LiquidGlassCard>
              </motion.button>
            </div>
          </LiquidGlassCard>

          {/* Status Bar Visibility */}
          <LiquidGlassCard variant="default" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <LiquidGlassIcon 
                  size="md" 
                  className={`bg-gradient-to-br ${isVisible ? 'from-green-500 to-emerald-500' : 'from-gray-500 to-slate-500'} !border-0`}
                >
                  {isVisible ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
                </LiquidGlassIcon>
                <div>
                  <h2 className="text-lg font-semibold">Status Bar Visibility</h2>
                  <p className="text-sm text-muted-foreground">
                    {isVisible ? "Status bar is visible" : "Status bar is hidden"}
                  </p>
                </div>
              </div>

              <LiquidGlassButton onClick={handleVisibilityToggle} className="flex items-center gap-2">
                {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {isVisible ? "Hide" : "Show"}
              </LiquidGlassButton>
            </div>
          </LiquidGlassCard>

          {/* Color Presets */}
          <LiquidGlassCard variant="default" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Background Color
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {colorPresets.map((preset) => (
                <motion.button
                  key={preset.name}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleColorChange(preset)}
                  className="focus:outline-none"
                >
                  <LiquidGlassCard 
                    className={`p-3 text-center ${selectedColor.name === preset.name ? 'ring-2 ring-primary' : ''}`}
                    hoverEffect
                  >
                    <div 
                      className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-white/20"
                      style={{ 
                        background: `linear-gradient(135deg, ${preset.light}, ${preset.dark})` 
                      }}
                    />
                    <span className="text-xs font-medium">{preset.name}</span>
                  </LiquidGlassCard>
                </motion.button>
              ))}
            </div>
          </LiquidGlassCard>

          {/* Display Settings */}
          <LiquidGlassCard variant="panel" className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Display Settings
            </h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Brightness
                  </Label>
                  <span className="text-sm font-mono text-primary">{brightness[0]}%</span>
                </div>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Keep Screen Awake
                  </Label>
                  <p className="text-sm text-muted-foreground">Prevent screen from sleeping during stream</p>
                </div>
                <Switch checked={keepAwake} onCheckedChange={setKeepAwake} />
              </div>
            </div>
          </LiquidGlassCard>

          {/* Preview Card */}
          <LiquidGlassCard variant="elevated" className="p-6" shimmer>
            <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
            <div className="relative rounded-2xl overflow-hidden border border-border/50">
              {/* Mock Phone Status Bar */}
              <div 
                className="h-8 flex items-center justify-between px-4 text-xs"
                style={{ 
                  backgroundColor: currentStyle === 'light' ? selectedColor.light : selectedColor.dark,
                  color: currentStyle === 'light' ? '#1f2937' : '#ffffff'
                }}
              >
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
              {/* Mock Content */}
              <div className="h-32 bg-gradient-hero flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Your app content</p>
              </div>
            </div>
          </LiquidGlassCard>
        </main>
      </div>
    </PageTransition>
  );
};

export default DisplayFeatures;
