import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import { ParticleSystem } from "@/components/animations/ParticleSystem";
import { CursorGlow } from "@/components/effects/CursorGlow";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <CursorGlow />
      <Navigation />
      <div className="relative">
        <ParticleSystem count={30} className="opacity-40" />
        <Hero />
      </div>
      <Features />
      <CTA />
    </div>
  );
};

export default Index;
