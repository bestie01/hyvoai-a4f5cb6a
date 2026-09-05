import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, ArrowRight, Download, Monitor, Mic, Video, Layers, Wand2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import { FadeIn } from "@/components/animations/FadeIn";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { motion } from "framer-motion";

const HERO_JARVIS_URL = "/lovable-uploads/hyvo-jarvis-hero.jpg";

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

  const capabilities = [
    { icon: Monitor, label: "Multi-Platform" },
    { icon: Mic, label: "Voice Co-Pilot" },
    { icon: Video, label: "Scene Manager" },
    { icon: Layers, label: "Sources" },
    { icon: Wand2, label: "AI Tools" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Full-bleed holographic core */}
      <div className="absolute inset-0">
        <img
          src={HERO_JARVIS_URL}
          alt="Hyvo.ai holographic AI core linking Twitch, YouTube and Kick"
          className="h-full w-full object-cover object-center"
          width={1408}
          height={768}
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,transparent_10%,hsl(var(--background)/0.85)_75%,hsl(var(--background))_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Scan grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_55%,transparent_100%)]" />

      {/* Breathing core glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]"
        animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 mx-auto px-6 pt-28 pb-20">
        <FadeIn className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 rounded-full border-primary/25 glass-strong px-5 py-2.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-semibold tracking-wide">AI-Powered Streaming Assistant</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Badge>
            <VersionBadge />
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary p-3.5 shadow-glow-primary"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.webp"
                alt="Hyvo.ai logo"
                className="h-full w-full object-contain brightness-0 invert dark:brightness-100 dark:invert-0"
              />
            </motion.div>
            <span className="font-display text-3xl font-extrabold tracking-tight text-foreground">Hyvo.ai</span>
          </div>

          <motion.h1
            className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-7xl xl:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-foreground">Streaming is</span>
            <br />
            <span className="text-gradient-primary">hard.</span>
          </motion.h1>

          <motion.p
            className="max-w-2xl text-xl font-medium leading-relaxed text-muted-foreground lg:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            Your <span className="font-semibold text-foreground">AI co-pilot</span> makes it easier. Real-time
            assistance, post-stream insights, and smarter growth.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {capabilities.map((feature, idx) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + idx * 0.07 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex cursor-default items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2.5 text-sm font-medium text-muted-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:text-foreground"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                {feature.label}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <MagneticButton>
              <Button
                size="lg"
                className="group rounded-2xl bg-gradient-primary px-10 py-7 text-lg font-bold text-primary-foreground transition-all duration-500 hover:shadow-glow-primary-strong"
                onClick={() => (user ? navigate("/studio") : navigate("/auth"))}
              >
                <Radio className="mr-2.5 h-5 w-5 animate-pulse transition-transform group-hover:scale-110" />
                {user ? "Open Studio" : "Start Streaming with AI"}
                <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                variant="outline"
                size="lg"
                className="group glass-strong rounded-2xl border-border/60 px-10 py-7 text-lg font-bold transition-all duration-500 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => navigate("/download")}
              >
                <Download className="mr-2.5 h-5 w-5 transition-transform group-hover:scale-110" />
                Download Desktop App
              </Button>
            </MagneticButton>
          </motion.div>

          <motion.p
            className="flex items-center gap-2 text-sm text-muted-foreground/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Mic className="h-4 w-4 text-primary" />
            The always-on voice co-pilot lives in the{" "}
            <button onClick={() => navigate("/download")} className="font-semibold text-primary hover:underline">
              desktop command center
            </button>
            .
          </motion.p>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
