import { Card } from "@/components/ui/card";
import { MessageSquare, Mic, Video, Music, UserMinus, Gamepad2 } from "lucide-react";

const FeaturesBento = () => {
  const features = [
    {
      title: "Fake Texts Videos",
      description: "Have an idea for a convo that would go viral? Make it into a full video in just a few clicks.",
      icon: MessageSquare,
      image: "/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png",
      className: "md:col-span-1"
    },
    {
      title: "Generate AI Voiceovers",
      description: "It's never been easier to make the AI-narrated videos you see on your timeline.",
      icon: Mic,
      image: "/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png",
      className: "md:col-span-1"
    },
    {
      title: "Create Reddit Story Videos",
      description: "Write your own script or generate one auto-magically from a Reddit link.",
      icon: Video,
      image: "/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png",
      className: "md:col-span-1"
    },
    {
      title: "Create Split-Screen Videos",
      description: "Make your clips more engaging by showing them beside premium gameplay.",
      icon: Gamepad2,
      image: "/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png",
      className: "md:col-span-1"
    },
    {
      title: "Background music remover",
      description: "Remove any background music from your videos / audios.",
      icon: Music,
      image: "/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png",
      className: "md:col-span-1"
    },
    {
      title: "AI Vocal Remover",
      description: "Upload your audio or video file and our AI will remove the vocals.",
      icon: UserMinus,
      image: "/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.png",
      className: "md:col-span-1"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 group cursor-pointer ${feature.className}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Feature Image/Preview */}
                <div className="relative">
                  <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden border border-border/50">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <feature.icon className="w-12 h-12 text-primary/60" />
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-primary rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;