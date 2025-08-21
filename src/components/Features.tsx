import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  Scissors, 
  Share2, 
  BarChart3, 
  Palette 
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
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="py-2 px-4">
            AI-Powered Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Advanced AI that{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              transforms streaming
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hyvo.ai leverages cutting-edge artificial intelligence, machine learning, and computer vision 
            to automate every aspect of content creation and audience growth.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="relative p-8 bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary group"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-primary rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;