import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Mic, Video, Layers, Wand2, BarChart3, Sparkles, Radio, Users, Scissors, MessageSquare, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card3D } from "@/components/animations/Card3D";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
const streamlabsFeatures = [{
  icon: Monitor,
  title: "Multi-Platform Streaming",
  description: "Stream simultaneously to Twitch, YouTube, and Facebook. One click to go live everywhere.",
  badge: "Core",
  color: "primary"
}, {
  icon: Mic,
  title: "Professional Audio Mixer",
  description: "Multi-channel audio control with real-time monitoring, effects, and noise suppression.",
  badge: "Pro Audio",
  color: "accent"
}, {
  icon: Video,
  title: "Scene Manager",
  description: "Create unlimited scenes with smooth transitions. Switch seamlessly during your stream.",
  badge: "Studio",
  color: "success"
}, {
  icon: Layers,
  title: "Source Control",
  description: "Drag-and-drop sources: cameras, screens, images, text, and browser overlays.",
  badge: "Studio",
  color: "warning"
}, {
  icon: Wand2,
  title: "AI Auto-Highlights",
  description: "AI detects peak moments and generates viral-ready clips automatically.",
  badge: "AI",
  color: "primary"
}, {
  icon: BarChart3,
  title: "Real-Time Analytics",
  description: "Live viewer counts, engagement metrics, and stream health monitoring.",
  badge: "Analytics",
  color: "accent"
}];
const aiFeatures = [{
  icon: Wand2,
  title: "AI Thumbnail Generator",
  description: "Generate eye-catching thumbnails with AI that understands your brand."
}, {
  icon: MessageSquare,
  title: "AI Chat Moderator",
  description: "Automatically filter toxic messages and highlight important chat."
}, {
  icon: Scissors,
  title: "AI Clip Editor",
  description: "Transform highlights into social-ready vertical videos instantly."
}, {
  icon: Users,
  title: "AI Viewer Insights",
  description: "Predict optimal stream times based on your audience patterns."
}];
const colorClasses = {
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20"
};
const iconBgClasses = {
  primary: "bg-gradient-primary",
  accent: "bg-gradient-secondary",
  success: "from-success to-success/60",
  warning: "from-warning to-warning/60"
};
const Features = () => {
  return <section id="features" className="py-32 bg-background relative overflow-hidden scroll-mt-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
      
      {/* Floating gradient orbs */}
      <motion.div className="absolute top-[10%] right-[5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" animate={{
      opacity: [0.3, 0.5, 0.3]
    }} transition={{
      duration: 8,
      repeat: Infinity
    }} />
      <motion.div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" animate={{
      opacity: [0.2, 0.4, 0.2]
    }} transition={{
      duration: 10,
      repeat: Infinity,
      delay: 2
    }} />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center space-y-8 mb-20">
          <Badge variant="secondary" className="py-2.5 px-5 glass-strong inline-flex items-center gap-2.5 rounded-full border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="font-semibold text-sm">Professional Streaming Tools</span>
          </Badge>
          <h2 className="text-4xl lg:text-6xl xl:text-7xl font-display font-extrabold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-primary text-secondary-foreground">
              stream like a pro
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built for streamers who demand the best. Professional-grade tools with AI superpowers.
          </p>
        </FadeIn>
        
        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-28">
          {streamlabsFeatures.map((feature, index) => <ScrollReveal key={index} direction={index % 2 === 0 ? "left" : "right"} delay={index * 0.08}>
              <Card3D>
                <Card className="relative group h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-500 overflow-hidden rounded-2xl hover:shadow-large">
                  <div className="p-7 space-y-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <motion.div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconBgClasses[feature.color as keyof typeof iconBgClasses]} flex items-center justify-center shadow-medium`} whileHover={{
                    scale: 1.1,
                    rotate: 5
                  }} transition={{
                    type: "spring",
                    stiffness: 300
                  }}>
                        <feature.icon className="w-7 h-7 text-primary-foreground" />
                      </motion.div>
                      <Badge variant="outline" className={`text-xs font-bold rounded-full px-3 py-1 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {feature.title}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Card>
              </Card3D>
            </ScrollReveal>)}
        </div>

        {/* AI Features Section */}
        <FadeIn className="text-center space-y-8 mb-16">
          <Badge variant="secondary" className="py-2.5 px-5 glass-strong inline-flex items-center gap-2.5 rounded-full border-accent/20">
            <Sparkles className="w-4 h-4 animate-pulse text-accent" />
            <span className="font-semibold text-sm">AI Superpowers</span>
          </Badge>
          <h3 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">
            Automate with <span className="text-gradient-accent text-secondary-foreground">AI</span>
          </h3>
        </FadeIn>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {aiFeatures.map((feature, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} viewport={{
          once: true
        }} className="group">
              <Card className="h-full p-6 bg-card/60 backdrop-blur-sm border-border/40 hover:border-accent/50 transition-all duration-500 hover:shadow-glow-accent rounded-2xl">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/25 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-2 text-lg">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default Features;