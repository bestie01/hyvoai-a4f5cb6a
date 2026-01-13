import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Slider } from "./ui/slider";
import { LiquidGlassCard } from "./ui/liquid-glass-card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  minViewers: number;
  minHours: number;
  minPlatforms: number;
  price: number;
  features: string[];
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    icon: <Zap className="h-5 w-5" />,
    minViewers: 0,
    minHours: 0,
    minPlatforms: 1,
    price: 0,
    features: ["1 platform", "720p streaming", "Basic analytics", "5 hours/month"],
  },
  {
    name: "Pro",
    icon: <Sparkles className="h-5 w-5" />,
    minViewers: 100,
    minHours: 20,
    minPlatforms: 2,
    price: 19,
    features: ["3 platforms", "1080p streaming", "AI features", "Unlimited hours"],
  },
  {
    name: "Business",
    icon: <Crown className="h-5 w-5" />,
    minViewers: 500,
    minHours: 50,
    minPlatforms: 3,
    price: 49,
    features: ["Unlimited platforms", "4K streaming", "Priority support", "Custom branding"],
  },
];

export const PricingCalculator = () => {
  const [viewers, setViewers] = useState(50);
  const [hours, setHours] = useState(10);
  const [platforms, setPlatforms] = useState(1);
  const navigate = useNavigate();

  const recommendedTier = useMemo(() => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      const tier = tiers[i];
      if (viewers >= tier.minViewers || hours >= tier.minHours || platforms >= tier.minPlatforms) {
        return tier;
      }
    }
    return tiers[0];
  }, [viewers, hours, platforms]);

  return (
    <LiquidGlassCard className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Find Your Perfect Plan</h3>
        <p className="text-muted-foreground">Adjust the sliders based on your streaming needs</p>
      </div>

      <div className="space-y-8 mb-8">
        {/* Viewers Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Expected Viewers</label>
            <span className="text-sm font-bold text-primary">{viewers.toLocaleString()}</span>
          </div>
          <Slider
            value={[viewers]}
            onValueChange={([v]) => setViewers(v)}
            min={0}
            max={10000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>10,000+</span>
          </div>
        </div>

        {/* Hours Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Stream Hours / Month</label>
            <span className="text-sm font-bold text-primary">{hours} hours</span>
          </div>
          <Slider
            value={[hours]}
            onValueChange={([h]) => setHours(h)}
            min={0}
            max={200}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>200+</span>
          </div>
        </div>

        {/* Platforms Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Number of Platforms</label>
            <span className="text-sm font-bold text-primary">{platforms} platform{platforms > 1 ? 's' : ''}</span>
          </div>
          <Slider
            value={[platforms]}
            onValueChange={([p]) => setPlatforms(p)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1</span>
            <span>5+</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <motion.div
        key={recommendedTier.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              {recommendedTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold">{recommendedTier.name}</h4>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </div>
              <p className="text-muted-foreground text-sm">Best for your needs</p>
            </div>
          </div>
          <div className="text-right">
            <motion.div
              key={recommendedTier.price}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold"
            >
              ${recommendedTier.price}
            </motion.div>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-2 mb-4">
          {recommendedTier.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>

        <Button 
          variant="hero" 
          className="w-full"
          onClick={() => navigate('/pricing')}
        >
          Get Started with {recommendedTier.name}
        </Button>
      </motion.div>
    </LiquidGlassCard>
  );
};
