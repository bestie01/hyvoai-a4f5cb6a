import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-full border-2 border-background"></div>
              <div className="w-6 h-6 bg-gradient-secondary rounded-full border-2 border-background"></div>
              <div className="w-6 h-6 bg-success rounded-full border-2 border-background"></div>
              <div className="w-6 h-6 bg-primary/70 rounded-full border-2 border-background"></div>
            </div>
            <span className="font-medium">3.2M+ users worldwide</span>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Generate{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                viral-ready clips
              </span>
              <br />
              in seconds
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your all-in-one tool for creating AI voiceovers, engaging subtitles, optimized gameplay, and more.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4 h-auto">
              Start Editing Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;