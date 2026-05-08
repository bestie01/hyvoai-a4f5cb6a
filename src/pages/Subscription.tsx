import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, Star, Pause, Play, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "$5",
    period: "month",
    description: "For new streamers getting started",
    features: ["Single platform streaming", "Basic analytics", "720p quality", "Community support"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$15",
    period: "month",
    description: "For professionals and growing streamers",
    popular: true,
    hasTrial: true,
    features: ["14-day free trial", "Multi-platform streaming", "Stream recording & highlights", "Premium audio mixing", "AI features", "Priority support"],
  },
  {
    id: "yearone" as const,
    name: "Year One",
    price: "$30",
    period: "year",
    description: "Save 83% with annual billing",
    hasTrial: true,
    features: ["14-day free trial", "Everything in Pro", "10 months free", "Advanced viewer analytics", "Dedicated account manager", "Early access"],
  },
];

const Subscription = () => {
  const {
    subscription, isPro, isYearOne, isStarter, isPaid, isPaused,
    initialLoading, loading, createCheckout, openCustomerPortal,
    pauseSubscription, resumeSubscription,
  } = useSubscription();

  const tierMatches = (id: string) => {
    if (id === "starter") return isStarter;
    if (id === "pro") return isPro && !isYearOne;
    if (id === "yearone") return isYearOne;
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Subscription</h1>
        <p className="text-white/60 mt-1">Manage your Hyvo.ai plan and billing.</p>
      </div>

      {/* Current plan summary */}
      {!initialLoading && (
        <Card className="liquid-glass-panel border-white/10">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {isPaid ? (
                  <Crown className="w-6 h-6 text-amber-400" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white/50" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    {isPaid ? `${subscription.subscription_tier} Plan` : "Free Plan"}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {isPaid && subscription.subscription_end
                      ? `Renews ${new Date(subscription.subscription_end).toLocaleDateString()}`
                      : "Upgrade to unlock pro features"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isPaused && <Badge variant="secondary">Paused</Badge>}
                {isPaid && (
                  <>
                    <Button variant="outline" size="sm" onClick={openCustomerPortal} disabled={loading}>
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Manage Billing
                    </Button>
                    {isPaused ? (
                      <Button variant="outline" size="sm" onClick={resumeSubscription} disabled={loading}>
                        <Play className="w-3.5 h-3.5 mr-1.5" /> Resume
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={pauseSubscription} disabled={loading}>
                        <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const isCurrent = tierMatches(plan.id);
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`relative h-full liquid-glass-panel transition-all ${
                  plan.popular ? "border-primary/40 shadow-glow-primary" : "border-white/10"
                } ${isCurrent ? "ring-2 ring-success" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">
                    <Star className="w-3 h-3 mr-1" /> Most Popular
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-3 right-4 bg-success text-success-foreground">
                    <Check className="w-3 h-3 mr-1" /> Active
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-gradient-primary">{plan.price}</span>
                    <span className="text-white/50 ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-white/60">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={loading || isCurrent}
                    onClick={() => createCheckout(plan.id)}
                  >
                    {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                    {isCurrent ? "Current Plan" : plan.hasTrial ? "Start 14-Day Trial" : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
