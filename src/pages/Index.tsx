import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { ParticleSystem } from "@/components/animations/ParticleSystem";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { FloatingActions } from "@/components/ui/floating-actions";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { PricingCalculator } from "@/components/PricingCalculator";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { PlatformLogos } from "@/components/PlatformLogos";
import { motion } from "framer-motion";
import { Sparkles, Users, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        <section className="py-8 bg-background relative overflow-hidden border-t border-border/30">
          <div className="container mx-auto px-6">
            <PlatformLogos />
          </div>
        </section>
        
        <Features />
        
        {/* Interactive Demo Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <motion.div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold">Try It Yourself</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Experience the <span className="text-gradient-primary">Power</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hover over the hotspots to explore our professional streaming features
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <InteractiveDemo />
            </ScrollReveal>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-30" />
          <motion.div 
            className="absolute top-1/3 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-primary/20">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold">Loved by Streamers</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                What Creators <span className="text-gradient-primary">Say</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of streamers who've transformed their content with Hyvo
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <TestimonialCarousel />
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing Calculator Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <motion.div 
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-primary/20">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-semibold">Find Your Plan</span>
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                What Do <span className="text-gradient-primary">You Need?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Answer a few questions and we'll recommend the perfect plan for you
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PricingCalculator />
            </ScrollReveal>
          </div>
        </section>
        
        <CTA />
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Index;

