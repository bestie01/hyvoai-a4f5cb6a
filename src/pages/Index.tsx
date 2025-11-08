import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { ParticleSystem } from "@/components/animations/ParticleSystem";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative scroll-smooth">
        <CursorGlow />
        <Navigation />
        <div className="relative">
          <ParticleSystem count={30} className="opacity-40" />
          <Hero />
        </div>
        <Features />
        <CTA />
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;
