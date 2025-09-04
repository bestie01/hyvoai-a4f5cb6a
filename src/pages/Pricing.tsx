import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ProBadge } from "@/components/ProFeatureGate";

const Pricing = () => {
  const { createCheckout, loading, subscription, isPro, isYearOne, initialLoading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const plans = [
    {
      id: "pro",
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For professionals and growing streamers",
      features: [
        "Advanced Stream Analytics",
        "Multi-platform Streaming",
        "Stream Recording & Highlights", 
        "Custom Overlay Templates",
        "Premium Audio Controls",
        "Priority Support",
        "API Access",
        "Custom Branding Options"
      ],
      buttonText: "Start Pro Trial",
      variant: "hero" as const,
      popular: false,
      isCurrent: isPro && !isYearOne
    },
    {
      id: "yearone",
      name: "Year One",
      price: "$290",
      period: "per year",
      description: "Save 17% with annual billing + exclusive perks",
      features: [
        "Everything in Pro",
        "2 months free (17% savings)",
        "Priority onboarding call",
        "Advanced viewer analytics",
        "Custom workflow automation",
        "Dedicated account manager",
        "Early access to new features",
        "Premium community access"
      ],
      buttonText: "Get Year One",
      variant: "secondary" as const,
      popular: true,
      isCurrent: isYearOne
    }
  ];

  const handleSubscribe = (planId: string) => {
    if (!user) {
      // Redirect to auth page for non-authenticated users
      navigate('/auth', { state: { redirect: '/pricing', plan: planId } });
      return;
    }
    
    if (planId === "pro") {
      createCheckout('pro');
    } else {
      createCheckout('yearone');
    }
  };

  const getButtonText = (plan: any) => {
    if (loading) return "Processing...";
    if (plan.isCurrent) return "Current Plan";
    if (!user) return `Sign up for ${plan.name}`;
    return plan.buttonText;
  };

  const isButtonDisabled = (plan: any) => {
    return loading || plan.isCurrent;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, transparent{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your streaming needs. Start free and upgrade as you grow.
          </p>
          
          {/* Current Subscription Status */}
          {user && !initialLoading && (
            <div className="mb-8">
              {isPro ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">
                    You're currently on the {subscription.subscription_tier} plan
                  </span>
                  <ProBadge />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border rounded-full">
                  <span className="text-sm text-muted-foreground">
                    You're currently on the free plan
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-glow-primary' : ''} ${plan.isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <Badge 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                {plan.isCurrent && (
                  <Badge 
                    className="absolute -top-3 right-4 bg-green-500"
                  >
                    Current Plan
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                    {plan.name}
                    {plan.isCurrent && <Crown className="w-5 h-5 text-amber-500" />}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.variant} 
                    size="lg" 
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isButtonDisabled(plan)}
                  >
                    {getButtonText(plan)}
                  </Button>

                  {plan.isCurrent && (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/profile')}
                      >
                        Manage Subscription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Free Plan Features */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">Also available on the free plan:</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Basic Streaming</h4>
                <p className="text-sm text-muted-foreground">Stream to one platform at a time with standard quality</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Basic Analytics</h4>
                <p className="text-sm text-muted-foreground">View basic streaming metrics and viewer counts</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Community Support</h4>
                <p className="text-sm text-muted-foreground">Access to community forums and basic documentation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">Yes, Pro plan comes with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">We accept all major credit cards through Stripe's secure payment processing.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens when I cancel?</h3>
              <p className="text-muted-foreground">You'll retain access to Pro features until the end of your billing period, then automatically return to the free plan.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I get a custom plan?</h3>
              <p className="text-muted-foreground">For enterprise needs or custom requirements, contact our sales team for a tailored solution.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;