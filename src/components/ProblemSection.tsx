import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare, TrendingDown, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const painPoints = [
  {
    icon: MessageSquare,
    title: "Fast-moving chat",
    description: "Miss important messages and engagement opportunities while focusing on gameplay",
  },
  {
    icon: TrendingDown,
    title: "Unclear growth",
    description: "No idea which content drives subscribers or what's actually resonating with viewers",
  },
  {
    icon: AlertCircle,
    title: "No real-time feedback",
    description: "Flying blind without data on what's working during your live streams",
  },
  {
    icon: Clock,
    title: "Slow progress",
    description: "Hours of streaming with minimal growth and no clear path forward",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-[120px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-destructive/20"
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="font-semibold">The Struggle is Real</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Streaming is <span className="text-destructive">overwhelming</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Managing a stream alone means juggling too many things at once — and dropping the ball.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((point, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full p-6 bg-card/60 backdrop-blur-sm border-border/40 hover:border-destructive/30 transition-all duration-500 rounded-2xl group">
                  <div className="flex flex-col gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 group-hover:scale-110 transition-all duration-300">
                      <point.icon className="w-7 h-7 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{point.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
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

export default ProblemSection;
