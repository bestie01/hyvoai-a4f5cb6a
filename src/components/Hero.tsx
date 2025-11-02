import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-dashboard.jpg";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideIn } from "@/components/animations/SlideIn";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { RippleEffect } from "@/components/effects/RippleEffect";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/studio');
  };

  const handleViewDemo = () => {
    navigate('/studio');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(240_5%_16%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(240_5%_16%)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      
      {/* Floating elements with enhanced animation */}
      <motion.div 
        className="absolute top-20 left-10 w-3 h-3 bg-primary rounded-full shadow-glow-primary"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-40 right-20 w-4 h-4 bg-accent rounded-full shadow-glow-accent"
        animate={{
          y: [0, 30, 0],
          x: [0, 10, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-40 left-20 w-2 h-2 bg-success rounded-full shadow-glow-success"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <FadeIn className="text-center lg:text-left space-y-8">
            <Badge variant="secondary" className="inline-flex items-center gap-2 py-2 px-4 glass shine-effect">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Advanced AI Streaming Intelligence
            </Badge>
            
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-4">
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-primary rounded-2xl p-4 shadow-glow-primary animate-pulse-glow">
                  <img 
                    src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png" 
                    alt="Hyvo.ai Logo" 
                    className="w-full h-full object-contain brightness-0 invert dark:brightness-100 dark:invert-0" 
                  />
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight tracking-tight">
                <span className="text-gradient-primary">
                  Hyvo.ai
                </span>
                <br />
                <span className="text-foreground">
                  AI-Powered
                </span>{" "}
                <span className="text-gradient-accent">
                  Streaming
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Revolutionary AI assistant that intelligently automates streaming operations, 
                analyzes audience behavior, and optimizes content performance with machine learning algorithms.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <MagneticButton>
                <Button 
                  size="lg" 
                  className="group bg-gradient-primary hover:shadow-glow-primary-strong transition-all duration-300 font-semibold text-lg px-8 py-6 rounded-xl" 
                  onClick={handleStartTrial}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Launch Studio
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="glass hover:bg-accent/10 border-accent/30 hover:border-accent font-semibold text-lg px-8 py-6 rounded-xl transition-all duration-300"
                  onClick={handleViewDemo}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Try Demo
                </Button>
              </MagneticButton>
            </div>
            
            <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                No credit card required
              </div>
            </div>
          </FadeIn>
          
          {/* Right column - Dashboard preview */}
          <FadeIn delay={0.3} className="relative">
            <RippleEffect>
              <div className="relative overflow-hidden rounded-2xl glass hover-lift transition-all duration-500 hover:shadow-glow-primary-strong">
              <img
                src={heroImage}
                alt="Hyvo.ai Dashboard Preview - AI-powered streaming analytics"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              
              {/* Floating UI elements */}
              <SlideIn direction="right" delay={0.5} className="absolute top-6 right-6">
                <div className="glass-card p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                    <span className="text-foreground font-semibold">Live</span>
                    <span className="text-muted-foreground">1.2k viewers</span>
                  </div>
                </div>
              </SlideIn>
              
              <SlideIn direction="left" delay={0.7} className="absolute bottom-6 left-6">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-primary">
                      <TrendingUp className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Growth Rate</div>
                      <div className="text-xs text-success font-medium">+24% this week</div>
                    </div>
                  </div>
                </div>
              </SlideIn>
            </div>
          </RippleEffect>
            
            {/* Enhanced glow effect */}
            <div className="absolute -inset-6 bg-gradient-primary rounded-3xl opacity-20 blur-3xl animate-pulse-glow -z-10" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;