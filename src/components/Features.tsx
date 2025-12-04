import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Mic, 
  Video, 
  Layers,
  Wand2,
  BarChart3,
  Sparkles,
  Radio,
  Users,
  Scissors,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card3D } from "@/components/animations/Card3D";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const streamlabsFeatures = [
  {
    icon: Monitor,
    title: "Multi-Platform Streaming",
    description: "Stream simultaneously to Twitch, YouTube, and Facebook. One click to go live everywhere.",
    badge: "Core",
    gradient: "from-primary to-primary/60"
  },
  {
    icon: Mic,
    title: "Professional Audio Mixer",
    description: "Multi-channel audio control with real-time monitoring, effects, and noise suppression.",
    badge: "Pro Audio",
    gradient: "from-accent to-accent/60"
  },
  {
    icon: Video,
    title: "Scene Manager",
    description: "Create unlimited scenes with smooth transitions. Switch seamlessly during your stream.",
    badge: "Studio",
    gradient: "from-success to-success/60"
  },
  {
    icon: Layers,
    title: "Source Control",
    description: "Drag-and-drop sources: cameras, screens, images, text, and browser overlays.",
    badge: "Studio",
    gradient: "from-warning to-warning/60"
  },
  {
    icon: Wand2,
    title: "AI Auto-Highlights",
    description: "AI detects peak moments and generates viral-ready clips automatically.",
    badge: "AI",
    gradient: "from-primary to-accent"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Live viewer counts, engagement metrics, and stream health monitoring.",
    badge: "Analytics",
    gradient: "from-accent to-primary"
  }
];

const aiFeatures = [
  {
    icon: Wand2,
    title: "AI Thumbnail Generator",
    description: "Generate eye-catching thumbnails with AI that understands your brand."
  },
  {
    icon: MessageSquare,
    title: "AI Chat Moderator",
    description: "Automatically filter toxic messages and highlight important chat."
  },
  {
    icon: Scissors,
    title: "AI Clip Editor",
    description: "Transform highlights into social-ready vertical videos instantly."
  },
  {
    icon: Users,
    title: "AI Viewer Insights",
    description: "Predict optimal stream times based on your audience patterns."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden scroll-mt-20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="py-2 px-4 glass inline-flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse text-destructive" />
            <span className="font-semibold">Professional Streaming Tools</span>
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-display font-extrabold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-primary">
              stream like a pro
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built for streamers who demand the best. Professional-grade tools with AI superpowers.
          </p>
        </FadeIn>
        
        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {streamlabsFeatures.map((feature, index) => (
            <ScrollReveal
              key={index}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={index * 0.08}
            >
              <Card3D>
                <Card className="relative group h-full backdrop-blur-sm bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <div className="p-6 space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <motion.div 
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="w-6 h-6 text-primary-foreground" />
                      </motion.div>
                      <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary">
                        {feature.badge}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-primary pointer-events-none" />
                </Card>
              </Card3D>
            </ScrollReveal>
          ))}
        </div>

        {/* AI Features Section */}
        <FadeIn className="text-center space-y-6 mb-12">
          <Badge variant="secondary" className="py-2 px-4 glass inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse text-accent" />
            <span className="font-semibold">AI Superpowers</span>
          </Badge>
          <h3 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
            Automate with <span className="text-gradient-accent">AI</span>
          </h3>
        </FadeIn>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full p-5 bg-card/30 border-border/30 hover:border-accent/50 transition-all duration-300 hover:shadow-glow-accent">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;