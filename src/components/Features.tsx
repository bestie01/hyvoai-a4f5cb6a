import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  Scissors, 
  Share2, 
  BarChart3, 
  Palette,
  Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";

const features = [
  {
    icon: Calendar,
    title: "AI Scheduling Intelligence",
    description: "Machine learning algorithms analyze viewer patterns to predict optimal streaming times and maximize audience reach.",
    badge: "AI Scheduling",
    color: "text-primary"
  },
  {
    icon: MessageSquare,
    title: "AI Chat Analysis",
    description: "Natural language processing monitors chat sentiment, detects trends, and provides real-time engagement insights.",
    badge: "AI Analytics",
    color: "text-accent"
  },
  {
    icon: Scissors,
    title: "Smart AI Highlights",
    description: "Computer vision and audio analysis automatically identify peak moments and generate viral-ready clips.",
    badge: "AI Video",
    color: "text-success"
  },
  {
    icon: Share2,
    title: "AI Content Distribution",
    description: "Intelligent cross-platform posting with AI-optimized captions, hashtags, and timing for each social network.",
    badge: "AI Social",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Predictive AI Insights",
    description: "Advanced analytics engine predicts content performance and recommends data-driven improvements.",
    badge: "AI Prediction",
    color: "text-accent"
  },
  {
    icon: Palette,
    title: "AI Visual Generator",
    description: "Generative AI creates custom overlays, thumbnails, and branded visuals tailored to your content style.",
    badge: "AI Design",
    color: "text-success"
  }
];

const Features = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(240_5%_16%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(240_5%_16%)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <FadeIn className="text-center space-y-6 mb-20">
          <Badge variant="secondary" className="py-2 px-4 glass inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI-Powered Features
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-display font-bold tracking-tight">
            Advanced AI that{" "}
            <span className="text-gradient-primary">
              transforms streaming
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hyvo.ai leverages cutting-edge artificial intelligence, machine learning, and computer vision 
            to automate every aspect of content creation and audience growth.
          </p>
        </FadeIn>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <motion.div
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="card-elevated group h-full">
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary"
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 3,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </motion.div>
                    <Badge variant="secondary" className="text-xs font-semibold glass">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Enhanced hover effects */}
                <div className="absolute inset-0 bg-gradient-primary rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-primary pointer-events-none" />
              </Card>
            </motion.div>
          </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;