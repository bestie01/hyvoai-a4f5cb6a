import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, MessageSquare, Scissors, BarChart3, Lightbulb, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card3D } from "@/components/animations/Card3D";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const features = [
  {
    icon: Wand2,
    title: "AI Stream Assistant",
    description: "Real-time AI that monitors your stream, suggests responses, and highlights key moments as they happen.",
    badge: "Core",
    color: "primary",
  },
  {
    icon: MessageSquare,
    title: "Chat & Engagement Insights",
    description: "Understand your audience with sentiment analysis, topic detection, and engagement scoring.",
    badge: "Analytics",
    color: "accent",
  },
  {
    icon: Scissors,
    title: "Clip & Highlight Suggestions",
    description: "AI automatically identifies viral-worthy moments and creates shareable clips for social media.",
    badge: "AI",
    color: "success",
  },
  {
    icon: BarChart3,
    title: "Growth & Performance Analytics",
    description: "Track viewer trends, retention rates, and growth patterns with actionable recommendations.",
    badge: "Insights",
    color: "warning",
  },
  {
    icon: Lightbulb,
    title: "Stream Coaching Tips",
    description: "Personalized suggestions to improve your content, engagement, and streaming schedule.",
    badge: "Pro",
    color: "primary",
  },
];

const colorClasses = {
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

const iconBgClasses = {
  primary: "bg-gradient-primary",
  accent: "bg-gradient-secondary",
  success: "from-success to-success/60",
  warning: "from-warning to-warning/60",
};

const Features = () => {
  return (
    <section id="features" className="py-32 bg-background relative overflow-hidden scroll-mt-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-[10%] right-[5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center space-y-8 mb-20">
          <Badge
            variant="secondary"
            className="py-2.5 px-5 glass-strong inline-flex items-center gap-2.5 rounded-full border-primary/20"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-primary" />
            <span className="font-semibold text-sm">Powerful Features</span>
          </Badge>
          <h2 className="text-4xl lg:text-6xl xl:text-7xl font-display font-extrabold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-primary">grow your stream</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI-powered tools designed specifically for content creators who want to level up
          </p>
        </FadeIn>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} direction={index % 2 === 0 ? "left" : "right"} delay={index * 0.08}>
              <Card3D>
                <Card className="relative group h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-500 overflow-hidden rounded-2xl hover:shadow-large">
                  <div className="p-7 space-y-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <motion.div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconBgClasses[feature.color as keyof typeof iconBgClasses]} flex items-center justify-center shadow-medium`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="w-7 h-7 text-primary-foreground" />
                      </motion.div>
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold rounded-full px-3 py-1 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                      >
                        {feature.badge}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {feature.title}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>

                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Card>
              </Card3D>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
