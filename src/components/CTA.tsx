import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Mic, MonitorDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const CTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden border-t border-border/30 bg-background py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_70%_at_50%_100%,hsl(var(--primary)/0.18),transparent_70%)]" />
      <div className="container relative mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center"><span className="flex h-14 w-14 items-center justify-center border border-accent/30 bg-accent/10 text-accent"><Mic className="h-6 w-6" /></span></div>
          <p className="mb-4 font-mono text-xs uppercase text-accent">Your stream deserves a co-pilot</p>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-6xl">Stop managing windows.<br />Start running the show.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">Download the full Hyvo voice co-pilot and command center, or start with the web studio.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-14 px-8 text-base font-bold shadow-glow-primary" onClick={() => navigate("/download")}>
              <Download className="h-5 w-5" /> Download desktop app <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 border-border/70 bg-card/45 px-8 text-base font-semibold" onClick={() => (user ? navigate("/studio") : navigate("/auth"))}>
              <MonitorDown className="h-5 w-5" /> {user ? "Open web studio" : "Try the web app"}
            </Button>
          </div>
          <button type="button" onClick={() => navigate("/pricing")} className="mt-6 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Compare plans</button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;