import { Badge } from "@/components/ui/badge";
import { Link2, Radio, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const steps = [
  {
    number: "1",
    icon: Link2,
    title: "Connect your stream",
    description: "Link your Twitch, YouTube, or Kick account in seconds",
    color: "primary",
  },
  {
    number: "2",
    icon: Radio,
    title: "Go live",
    description: "Start streaming with your AI assistant active in the background",
    color: "accent",
  },
  {
    number: "3",
    icon: BarChart3,
    title: "Get AI insights",
    description: "Receive real-time suggestions and post-stream analytics",
    color: "success",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center gap-2 glass-strong rounded-full border-primary/20"
          >
            <span className="font-semibold">Simple Setup</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            How it <span className="text-gradient-primary">works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in under 5 minutes with three simple steps
          </p>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.15} className="flex-1 w-full lg:w-auto">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative p-8 rounded-3xl glass-strong border-border/50 hover:border-primary/40 transition-all duration-500 text-center w-full"
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow-primary">
                    {step.number}
                  </div>

                  <div className="mt-2 space-y-4">
                    <motion.div
                      className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                        step.color === "primary"
                          ? "bg-primary/10"
                          : step.color === "accent"
                          ? "bg-accent/10"
                          : "bg-success/10"
                      }`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <step.icon
                        className={`w-8 h-8 ${
                          step.color === "primary"
                            ? "text-primary"
                            : step.color === "accent"
                            ? "text-accent"
                            : "text-success"
                        }`}
                      />
                    </motion.div>
                    <h3 className="font-bold text-xl text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>

                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:flex items-center justify-center w-12"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </motion.div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
