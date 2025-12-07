import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Users, Trophy, Radio, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
import { CountUp } from "@/components/animations/CountUp";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { motion } from "framer-motion";
const stats = [{
  icon: Users,
  value: "10K+",
  label: "AI-Powered Creators"
}, {
  icon: Zap,
  value: "50M+",
  label: "AI Operations Daily"
}, {
  icon: Trophy,
  value: "300%",
  label: "AI-Driven Growth"
}];
const CTA = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  return <section className="py-32 bg-background relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-60" />
      
      {/* Gradient orbs */}
      <ParallaxSection speed={0.3} className="absolute inset-0">
        <motion.div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]" animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity
      }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px]" animate={{
        scale: [1, 1.15, 1],
        opacity: [0.2, 0.4, 0.2]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        delay: 2
      }} />
      </ParallaxSection>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-16">
          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {stats.map((stat, index) => <ScrollReveal key={index} delay={index * 0.1}>
                <motion.div className="text-center space-y-4 p-8 rounded-3xl glass-strong border-border/40 hover:border-primary/40 transition-all duration-500 group" whileHover={{
              y: -8,
              scale: 1.02
            }} transition={{
              type: "spring",
              stiffness: 300
            }}>
                  <motion.div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-5 shadow-glow-primary" whileHover={{
                rotate: 360,
                scale: 1.1
              }} transition={{
                duration: 0.6
              }}>
                    <stat.icon className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  <div className="text-4xl lg:text-5xl font-bold text-gradient-primary font-mono tracking-tight text-secondary-foreground">
                    {stat.value.includes('+') ? <>
                        <CountUp value={parseInt(stat.value.replace(/\D/g, ''))} />
                        {stat.value.match(/[^\d]/g)?.join('')}
                      </> : stat.value}
                  </div>
                  <div className="text-lg text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              </ScrollReveal>)}
          </div>
          
          {/* Main CTA */}
          <ScrollReveal delay={0.3}>
            <div className="space-y-10 max-w-4xl mx-auto">
              <Badge variant="secondary" className="py-2.5 px-5 shine-effect glass-strong rounded-full border-primary/20 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold">Experience Next-Gen AI Streaming Technology</span>
              </Badge>
            
              <h2 className="text-4xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.1] tracking-tight">
                Ready to{" "}
                <span className="text-gradient-primary text-secondary-foreground">
                  unlock AI
                </span>
                <br />
                streaming power?
              </h2>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Start your free trial today and experience how advanced AI algorithms can revolutionize 
                your content creation and maximize audience engagement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
                <MagneticButton>
                  <Button size="lg" className="group bg-gradient-primary hover:shadow-glow-primary-strong transition-all duration-500 text-lg px-10 py-7 rounded-2xl font-bold text-primary-foreground" onClick={() => user ? navigate('/studio') : navigate('/auth')}>
                    <Radio className="w-5 h-5 mr-2.5 animate-pulse" />
                    {user ? 'Go to Studio' : 'Start Free Trial'}
                    <ArrowRight className="w-5 h-5 ml-2.5 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button variant="outline" size="lg" className="text-lg px-10 py-7 glass-strong rounded-2xl font-bold border-border/60 hover:border-primary/50" onClick={() => navigate('/pricing')}>
                    View Pricing
                  </Button>
                </MagneticButton>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 justify-center text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-success rounded-full shadow-glow-success" />
                  <span className="font-medium">14-day free trial</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-success rounded-full shadow-glow-success" />
                  <span className="font-medium">Setup in under 5 minutes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-success rounded-full shadow-glow-success" />
                  <span className="font-medium">Cancel anytime</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>;
};
export default CTA;