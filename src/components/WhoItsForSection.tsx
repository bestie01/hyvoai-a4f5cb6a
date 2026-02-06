import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Twitch, Youtube, Zap, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const audiences = [
  {
    name: "Twitch Streamers",
    description: "Grow your community with AI-powered chat insights and engagement tools",
    icon: Twitch,
    color: "from-[#9146FF] to-[#772CE8]",
    bgColor: "bg-[#9146FF]/10",
    borderColor: "border-[#9146FF]/30",
    iconColor: "text-[#9146FF]",
  },
  {
    name: "YouTube Live Creators",
    description: "Optimize your live streams with real-time analytics and smart recommendations",
    icon: Youtube,
    color: "from-[#FF0000] to-[#CC0000]",
    bgColor: "bg-[#FF0000]/10",
    borderColor: "border-[#FF0000]/30",
    iconColor: "text-[#FF0000]",
  },
  {
    name: "Kick Streamers",
    description: "Stand out on the fastest-growing platform with AI-driven content optimization",
    icon: Zap,
    color: "from-[#53FC18] to-[#3BC711]",
    bgColor: "bg-[#53FC18]/10",
    borderColor: "border-[#53FC18]/30",
    iconColor: "text-[#53FC18]",
  },
  {
    name: "Growing Creators",
    description: "Accelerate your growth with data-driven insights and automated workflows",
    icon: TrendingUp,
    color: "from-primary to-accent",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    iconColor: "text-primary",
  },
];

const WhoItsForSection = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-primary/20"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold">Who It's For</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Built for <span className="text-gradient-primary">every streamer</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're just starting or have thousands of followers, Hyvo.ai scales with you
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card
                  className={`h-full p-6 bg-card/80 backdrop-blur-sm ${audience.borderColor} hover:shadow-lg transition-all duration-500 rounded-2xl group overflow-hidden relative`}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="relative z-10 flex flex-col gap-4">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl ${audience.bgColor} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <audience.icon className={`w-7 h-7 ${audience.iconColor}`} />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{audience.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{audience.description}</p>
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

export default WhoItsForSection;
