import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-accent rounded-full animate-float" />
      <div className="absolute bottom-40 left-20 w-1 h-1 bg-success rounded-full animate-pulse" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left space-y-8">
            <Badge variant="secondary" className="inline-flex items-center gap-2 py-2 px-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Streaming Assistant
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Hyvo.ai
                </span>
                <br />
                <span className="text-foreground">
                  Stream
                </span>{" "}
                <span className="bg-gradient-secondary bg-clip-text text-transparent">
                  Smarter
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                The AI-powered tool that automates the hardest parts of streaming—scheduling, 
                engagement, and promotion—so you can focus on creating amazing content.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </Button>
              <Button variant="accent" size="lg">
                <TrendingUp className="w-5 h-5" />
                View Demo
              </Button>
            </div>
            
            <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                No credit card required
              </div>
            </div>
          </div>
          
          {/* Right column - Dashboard preview */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-2xl">
              <img
                src={heroImage}
                alt="Hyvo.ai Dashboard Preview"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              
              {/* Floating UI elements */}
              <div className="absolute top-6 right-6">
                <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-foreground font-medium">Live</span>
                    <span className="text-muted-foreground">1.2k viewers</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6">
                <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Growth Rate</div>
                      <div className="text-xs text-muted-foreground">+24% this week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-20 blur-2xl animate-pulse-glow -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;