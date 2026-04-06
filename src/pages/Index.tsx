import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import Features from "@/components/Features";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhoItsForSection from "@/components/WhoItsForSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { ParticleSystem } from "@/components/animations/ParticleSystem";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { FloatingActions } from "@/components/ui/floating-actions";
import { PlatformLogos } from "@/components/PlatformLogos";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative scroll-smooth">
        <ScrollProgress color="gradient" />
        <CursorGlow color="dynamic" magnetic trail />
        <FloatingActions />
        <Navigation />
        <div className="relative">
          <ParticleSystem count={30} className="opacity-40" />
          <Hero />
        </div>

        {/* Platform Logos Section */}
        <section className="py-12 bg-background relative overflow-hidden border-t border-border/20">
          <div className="container mx-auto px-6">
            <PlatformLogos />
          </div>
        </section>

        {/* Problem Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />
          <ProblemSection />
        </div>

        {/* Solution Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background pointer-events-none" />
          <SolutionSection />
        </div>

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
          <HowItWorksSection />
        </div>

        {/* Who It's For Section */}
        <WhoItsForSection />

        {/* CTA Section */}
        <CTA />

        {/* Footer */}
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;
