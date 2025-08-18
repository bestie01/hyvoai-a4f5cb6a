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
    title: "Schedule Smarter",
    description: "Plan streams at optimal times for maximum viewership with AI-driven insights.",
    badge: "Scheduling",
    color: "text-primary"
  },
  {
    icon: MessageSquare,
    title: "Engage in Real Time",
    description: "Track chat activity, viewer trends, and audience sentiment live during streams.",
    badge: "Analytics",
    color: "text-accent"
  },
  {
    icon: Scissors,
    title: "Auto Highlights",
    description: "AI detects exciting moments and automatically creates clips and shorts.",
    badge: "AI Clips",
    color: "text-success"
  },
  {
    icon: Share2,
    title: "Promote Everywhere",
    description: "Share streams and highlights across platforms with optimized formats.",
    badge: "Social",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Growth Insights",
    description: "Get data-driven recommendations on titles, thumbnails, and stream topics.",
    badge: "Growth",
    color: "text-accent"
  },
  {
    icon: Palette,
    title: "Custom Overlays",
    description: "AI generates professional, branded stream visuals and alerts instantly.",
    badge: "Design",
    color: "text-success"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="py-2 px-4">
            Powerful Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything you need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              grow your stream
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hyvo.ai combines AI automation with creator-focused tools to help you 
            attract viewers, keep them engaged, and build a thriving community.
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