import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Users, Trophy, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
import { CountUp } from "@/components/animations/CountUp";
import { MagneticButton } from "@/components/animations/MagneticButton";

const stats = [
  { icon: Users, value: "10K+", label: "AI-Powered Creators" },
  { icon: Zap, value: "50M+", label: "AI Operations Daily" },
  { icon: Trophy, value: "300%", label: "AI-Driven Growth" }
];

const CTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartTrial = () => {
    navigate('/studio');
  };

  const handleBookDemo = () => {
    // You can replace this with a contact form or demo booking page
    window.open('mailto:demo@hyvo.ai?subject=Book a Demo&body=Hi, I would like to book a demo of Hyvo.ai.', '_blank');
  };

  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background pattern */}
      <ParallaxSection speed={0.3} className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </ParallaxSection>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-12">
          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow-primary">
                    <stat.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent font-mono">
                    {stat.value.includes('+') ? (
                      <>
                        <CountUp value={parseInt(stat.value.replace(/\D/g, ''))} />
                        {stat.value.match(/[^\d]/g)?.join('')}
                      </>
                    ) : stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          {/* Main CTA */}
          <ScrollReveal delay={0.3}>
            <div className="space-y-8">
              <Badge variant="secondary" className="py-2 px-4 shine-effect">
                Experience Next-Gen AI Streaming Technology
              </Badge>
            
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Ready to{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                unlock AI
              </span>
              <br />
              streaming power?
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your free trial today and experience how advanced AI algorithms can revolutionize 
              your content creation, automate growth strategies, and maximize audience engagement.
            </p>
            
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <MagneticButton>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="group text-lg px-8 py-4" 
                    onClick={() => user ? navigate('/studio') : navigate('/auth')}
                  >
                    <Radio className="w-5 h-5 mr-2 animate-pulse" />
                    {user ? 'Go to Studio' : 'Start Free Trial'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-4 glass" 
                    onClick={() => navigate('/pricing')}
                  >
                    View Pricing
                  </Button>
                </MagneticButton>
              </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                Setup in under 5 minutes
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                Cancel anytime
              </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default CTA;