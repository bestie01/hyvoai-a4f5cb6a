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
        <div className="text-center space-y-6 mb-20 animate-fade-in-up">
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
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-elevated hover-lift group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-glow-primary">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;