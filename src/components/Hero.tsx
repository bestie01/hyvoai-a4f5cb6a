import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Radio, ArrowRight, Download, Zap, Monitor, Mic, Video, Layers, Wand2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import heroImage from "@/assets/hero-dashboard.jpg";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideIn } from "@/components/animations/SlideIn";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { RippleEffect } from "@/components/effects/RippleEffect";
import { motion } from "framer-motion";

const VersionBadge = () => {
  const { latestVersion, isLoading } = useGitHubReleases();
  const navigate = useNavigate();
  if (isLoading || !latestVersion) return null;
  return (
    <Badge
      variant="outline"
      className="py-1.5 px-3 rounded-full text-xs font-mono cursor-pointer hover:bg-primary/10 transition-colors border-border/60"
      onClick={() => navigate("/changelog")}
    >
      v{latestVersion}
    </Badge>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const streamlabsFeatures = [
    { icon: Monitor, label: "Multi-Platform" },
    { icon: Mic, label: "Pro Audio" },
    { icon: Video, label: "Scene Manager" },
    { icon: Layers, label: "Sources" },
    { icon: Wand2, label: "AI Tools" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-mesh opacity-80" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-accent/15 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-[40%] right-[30%] w-48 h-48 bg-primary/10 rounded-full blur-[60px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto px-6 relative z-10 pt-24">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left column - Content */}
          <FadeIn className="text-center lg:text-left space-y-10">
            {/* Badge */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 py-2.5 px-5 glass-strong rounded-full border-primary/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-semibold tracking-wide text-sm">AI-Powered Streaming Assistant</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Badge>
              <VersionBadge />
            </motion.div>

            <div className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-5 justify-center lg:justify-start">
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

              {/* Headline */}
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-display font-extrabold leading-[1.05] tracking-tight">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-foreground inline-block"
                >
                  Streaming is
                </motion.span>
                <br />
                <motion.span
                  className="text-gradient-primary inline-block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  hard.
                </motion.span>
              </h1>

              {/* Subheadline */}
              <motion.p
                className="text-xl lg:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Your <span className="text-foreground font-semibold">AI co-pilot</span> makes it easier.
                Real-time assistance, post-stream insights, and smarter growth.
              </motion.p>
            </div>

            {/* Feature pills */}
            <motion.div
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {streamlabsFeatures.map((feature, idx) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.08 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/80 border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card transition-all duration-300 cursor-default shadow-soft"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  {feature.label}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <MagneticButton>
                <Button
                  size="lg"
                  className="group bg-gradient-primary hover:shadow-glow-primary-strong transition-all duration-500 font-bold text-lg px-10 py-7 rounded-2xl text-primary-foreground"
                  onClick={() => (user ? navigate("/studio") : navigate("/auth"))}
                >
                  <Radio className="w-5 h-5 mr-2.5 group-hover:scale-110 transition-transform animate-pulse" />
                  {user ? "Open Studio" : "Start Streaming with AI"}
                  <ArrowRight className="w-5 h-5 ml-2.5 group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-strong hover:bg-primary/5 border-border/60 hover:border-primary/50 font-bold text-lg px-10 py-7 rounded-2xl transition-all duration-500 group"
                  onClick={() => navigate("/download")}
                >
                  <Download className="w-5 h-5 mr-2.5 group-hover:scale-110 transition-transform" />
                  Download App
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                <span className="font-medium">Free forever tier</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-glow-success" />
                <span className="font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-warning" />
                <span className="font-medium">AI-powered</span>
              </div>
            </motion.div>
          </FadeIn>

          {/* Right column - Dashboard preview */}
          <FadeIn delay={0.4} className="relative">
            <RippleEffect>
              <motion.div
                className="relative overflow-hidden rounded-3xl glass-strong hover-lift transition-all duration-700 hover:shadow-glow-primary border border-border/50"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <img
                  src={heroImage}
                  alt="Hyvo.ai Dashboard Preview - AI-powered streaming analytics"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />

                {/* Live indicator */}
                <SlideIn direction="right" delay={0.6} className="absolute top-6 right-6">
                  <div className="glass-strong p-4 rounded-xl border border-destructive/40 shadow-large">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                      </span>
                      <span className="text-foreground font-bold tracking-wide">LIVE</span>
                      <span className="text-muted-foreground font-medium">1,247 viewers</span>
                    </div>
                  </div>
                </SlideIn>

                {/* Stats card */}
                <SlideIn direction="left" delay={0.8} className="absolute bottom-6 left-6">
                  <div className="glass-strong p-5 rounded-xl border border-primary/30 shadow-large">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                        <TrendingUp className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-foreground">Stream Health</div>
                        <div className="text-sm text-success font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-success rounded-full"></span>
                          Excellent • 60 FPS
                        </div>
                      </div>
                    </div>
                  </div>
                </SlideIn>

                {/* AI indicator */}
                <SlideIn direction="up" delay={1} className="absolute bottom-6 right-6">
                  <div className="glass-strong p-4 rounded-xl border border-accent/30 shadow-large">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Wand2 className="w-4 h-4 text-accent" />
                      <span className="text-foreground font-semibold">AI Active</span>
                    </div>
                  </div>
                </SlideIn>
              </motion.div>
            </RippleEffect>

            {/* Enhanced glow effect */}
            <div className="absolute -inset-8 bg-gradient-primary rounded-[2rem] opacity-10 blur-[60px] animate-pulse-glow -z-10" />
          </FadeIn>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
