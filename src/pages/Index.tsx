import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturesBento from "@/components/FeaturesBento";
import CTA from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <FeaturesBento />
      <CTA />
    </div>
  );
};

export default Index;
