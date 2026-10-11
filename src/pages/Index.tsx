import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { ParticleSystem } from "@/components/animations/ParticleSystem";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { FloatingActions } from "@/components/ui/floating-actions";
import { PlatformLogos } from "@/components/PlatformLogos";
import { Seo } from "@/components/Seo";
import { ProductShowcase } from "@/components/ProductShowcase";

const Index = () => {
  return (
    <PageTransition>
      <Seo
        title="Hyvo.ai — AI Streaming Assistant for YouTube & Twitch"
        description="Automate streaming with AI. Schedule smarter, engage in real-time, and create highlights automatically. The all-in-one tool for YouTube and Twitch streamers."
        path="/"
      />

      <div className="min-h-screen bg-background relative scroll-smooth">
        <ScrollProgress color="gradient" />
        <CursorGlow color="dynamic" magnetic trail />
        <FloatingActions />
        <Navigation />
        <div className="relative">
          <ParticleSystem count={30} className="opacity-40" />
          <Hero />
        </div>

        <ProductShowcase />
        <Features />
        <section className="relative overflow-hidden border-b border-border/30 bg-background">
          <div className="container mx-auto px-6"><PlatformLogos /></div>
        </section>
        <HowItWorksSection />
        <CTA />
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;
