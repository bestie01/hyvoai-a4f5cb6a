import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Zap, BarChart3, Users, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const benefits = [
  {
    icon: Zap,
    title: "Real-time AI assistance",
    description: "AI monitors your chat, highlights important moments, and suggests responses during your stream",
  },
  {
    icon: BarChart3,
    title: "Post-stream insights",
    description: "Get detailed analytics on what worked, peak engagement moments, and actionable recommendations",
  },
  {
    icon: Users,
    title: "Better engagement",
    description: "Know exactly how viewers are responding and optimize your content in real-time",
  },
  {
    icon: Heart,
    title: "Streamer-first design",
    description: "Built by streamers who understand your workflow and challenges",
  },
];

const SolutionSection = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <motion.div
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-primary/20"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold">The Solution</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Meet your <span className="text-gradient-primary">AI streaming co-pilot</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hyvo.ai watches your stream in real-time, providing insights and assistance so you can focus on what matters — your content.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction={index % 2 === 0 ? "left" : "right"}>
              <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-500 rounded-2xl group">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-glow-primary">
                      <benefit.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
