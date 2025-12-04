import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, TrendingUp, Radio, ArrowRight, Download, Zap, Monitor, Mic, Video, Layers, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-dashboard.jpg";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideIn } from "@/components/animations/SlideIn";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { RippleEffect } from "@/components/effects/RippleEffect";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const streamlabsFeatures = [
    { icon: Monitor, label: "Multi-Platform Streaming" },
    { icon: Mic, label: "Pro Audio Mixer" },
    { icon: Video, label: "Scene Manager" },
    { icon: Layers, label: "Source Control" },
    { icon: Wand2, label: "AI Enhancements" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      
      {/* Floating elements */}
      <motion.div 
        className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full shadow-glow-primary"
        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-40 right-20 w-4 h-4 bg-accent rounded-full shadow-glow-accent"
        animate={{ y: [0, 30, 0], x: [0, 10, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-40 left-20 w-2 h-2 bg-success rounded-full shadow-glow-success"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <FadeIn className="text-center lg:text-left space-y-8">
            <Badge variant="secondary" className="inline-flex items-center gap-2 py-2 px-4 glass shine-effect">
              <Sparkles className="w-4 h-4 animate-pulse text-primary" />
              <span className="font-semibold tracking-wide">Professional Streaming Studio</span>
            </Badge>
            
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-4">
                <motion.div 
                  className="w-20 h-20 flex items-center justify-center bg-gradient-primary rounded-2xl p-4 shadow-glow-primary"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png" 
                    alt="Hyvo.ai Logo" 
                    className="w-full h-full object-contain brightness-0 invert dark:brightness-100 dark:invert-0" 
                  />
                </motion.div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-[1.1] tracking-tight">
                <span className="text-gradient-primary bg-clip-text">
                  Stream Like
                </span>
                <br />
                <span className="text-foreground">
                  A Pro With
                </span>{" "}
                <span className="text-gradient-accent relative">
                  AI
                  <motion.span 
                    className="absolute -right-2 -top-2 text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                The <span className="text-foreground font-semibold">OBS alternative</span> powered by AI. 
                Multi-platform streaming, pro audio mixing, scene management, and intelligent automation — all in one beautiful app.
              </p>
            </div>
            
            {/* Streamlabs-like feature pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {streamlabsFeatures.map((feature, idx) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-default"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  {feature.label}
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <MagneticButton>
                <Button 
                  size="lg" 
                  className="group bg-gradient-primary hover:shadow-glow-primary-strong transition-all duration-300 font-bold text-lg px-8 py-6 rounded-xl" 
                  onClick={() => user ? navigate('/studio') : navigate('/auth')}
                >
                  <Radio className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform animate-pulse" />
                  {user ? 'Open Studio' : 'Start Streaming Free'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="glass hover:bg-accent/10 border-primary/30 hover:border-primary font-bold text-lg px-8 py-6 rounded-xl transition-all duration-300 group"
                  onClick={() => navigate('/download')}
                >
                  <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Download App
                </Button>
              </MagneticButton>
            </div>
            
            <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                <span className="font-medium">Free forever tier</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                <span className="font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="font-medium">AI-powered</span>
              </div>
            </div>
          </FadeIn>
          
          {/* Right column - Dashboard preview */}
          <FadeIn delay={0.3} className="relative">
            <RippleEffect>
              <div className="relative overflow-hidden rounded-2xl glass hover-lift transition-all duration-500 hover:shadow-glow-primary-strong border border-border/50">
                <img
                  src={heroImage}
                  alt="Hyvo.ai Dashboard Preview - AI-powered streaming analytics"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* Live indicator */}
                <SlideIn direction="right" delay={0.5} className="absolute top-6 right-6">
                  <div className="glass-card p-3 border border-destructive/50">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <span className="text-foreground font-bold tracking-wide">LIVE</span>
                      <span className="text-muted-foreground font-medium">1,247 viewers</span>
                    </div>
                  </div>
                </SlideIn>
                
                {/* Stats card */}
                <SlideIn direction="left" delay={0.7} className="absolute bottom-6 left-6">
                  <div className="glass-card p-4 border border-primary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                        <TrendingUp className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-foreground">Stream Health</div>
                        <div className="text-sm text-success font-semibold">Excellent • 60 FPS</div>
                      </div>
                    </div>
                  </div>
                </SlideIn>

                {/* AI indicator */}
                <SlideIn direction="up" delay={0.9} className="absolute bottom-6 right-6">
                  <div className="glass-card p-3 border border-accent/30">
                    <div className="flex items-center gap-2 text-sm">
                      <Wand2 className="w-4 h-4 text-accent" />
                      <span className="text-foreground font-semibold">AI Active</span>
                    </div>
                  </div>
                </SlideIn>
              </div>
            </RippleEffect>
            
            {/* Enhanced glow effect */}
            <div className="absolute -inset-6 bg-gradient-primary rounded-3xl opacity-15 blur-3xl animate-pulse-glow -z-10" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;