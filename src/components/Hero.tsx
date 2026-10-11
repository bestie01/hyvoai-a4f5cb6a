import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, Mic, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGitHubReleases } from "@/hooks/useGitHubReleases";
import { motion } from "framer-motion";

const HERO_JARVIS_URL = "/lovable-uploads/hyvo-jarvis-hero.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latestVersion } = useGitHubReleases();

  return (
    <section className="relative flex min-h-[92dvh] items-center overflow-hidden border-b border-border/30 bg-background">
      <div className="absolute inset-0">
        <img
          src={HERO_JARVIS_URL}
          alt="Hyvo AI command center connecting live streaming platforms"
          className="h-full w-full object-cover object-center"
          width={1408}
          height={768}
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_65%_46%,transparent_5%,hsl(var(--background)/0.72)_72%,hsl(var(--background))_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:linear-gradient(to_bottom,#000,transparent_88%)]" />

      <div className="container relative z-10 mx-auto px-6 pb-16 pt-32">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 flex flex-wrap items-center gap-3"
          >
            <Badge variant="secondary" className="gap-2 border border-primary/25 bg-background/55 px-4 py-2 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Desktop AI co-pilot for live streaming
            </Badge>
            {latestVersion && <span className="font-mono text-xs text-muted-foreground">v{latestVersion}</span>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mb-7 flex items-center gap-3"
          >
            <img
              src="/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.webp"
              alt="Hyvo.ai"
              className="h-11 w-11 object-contain"
              width={44}
              height={44}
            />
            <span className="font-display text-2xl font-bold text-foreground">HYVO.AI</span>
          </motion.div>

          <motion.h1
            className="max-w-4xl font-display text-5xl font-extrabold leading-[1.04] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14 }}
          >
            Focus on streaming.
            <span className="block text-gradient-primary">Your AI handles the rest.</span>
          </motion.h1>

          <motion.p
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            Hyvo watches your broadcast, listens when you call, and turns live moments into actions—without pulling you out of the stream.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            <Button size="lg" className="h-14 px-7 text-base font-bold shadow-glow-primary" onClick={() => navigate("/download")}>
              <Download className="h-5 w-5" />
              Download Hyvo for desktop
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 border-border/70 bg-background/45 px-7 text-base font-semibold backdrop-blur-xl"
              onClick={() => (user ? navigate("/studio") : navigate("/auth"))}
            >
              {user ? "Open web studio" : "Try the web app"}
            </Button>
          </motion.div>

          <motion.div
            className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
          >
            <span className="flex items-center gap-2"><Mic className="h-4 w-4 text-accent" /> Voice and typed commands</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> OAuth-first platform linking</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;