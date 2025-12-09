import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Sparkles, Zap, Shield } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ProBadge } from "@/components/ProFeatureGate";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
const Pricing = () => {
  const {
    createCheckout,
    loading,
    subscription,
    isPro,
    isYearOne,
    initialLoading
  } = useSubscription();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const plans = [{
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professionals and growing streamers",
    features: ["Advanced Stream Analytics", "Multi-platform Streaming", "Stream Recording & Highlights", "Custom Overlay Templates", "Premium Audio Controls", "Priority Support", "API Access", "Custom Branding Options"],
    buttonText: "Start Pro Trial",
    variant: "hero" as const,
    popular: false,
    isCurrent: isPro && !isYearOne
  }, {
    id: "yearone",
    name: "Year One",
    price: "$290",
    period: "per year",
    description: "Save 17% with annual billing + exclusive perks",
    features: ["Everything in Pro", "2 months free (17% savings)", "Priority onboarding call", "Advanced viewer analytics", "Custom workflow automation", "Dedicated account manager", "Early access to new features", "Premium community access"],
    buttonText: "Get Year One",
    variant: "secondary" as const,
    popular: true,
    isCurrent: isYearOne
  }];
  const handleSubscribe = (planId: string) => {
    if (!user) {
      // Redirect to auth page for non-authenticated users
      navigate('/auth', {
        state: {
          redirect: '/pricing',
          plan: planId
        }
      });
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
  return <PageTransition>
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <motion.div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }} transition={{
            duration: 8,
            repeat: Infinity
          }} />
            <motion.div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }} transition={{
            duration: 10,
            repeat: Infinity,
            delay: 1
          }} />
          </div>
          
          <div className="container mx-auto text-center relative">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }}>
              <Badge className="mb-4 bg-gradient-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Transparent Pricing
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Simple pricing,{" "}
                <span className="bg-gradient-primary bg-clip-text text-secondary-foreground bg-primary-foreground">
                  powerful features
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Choose the perfect plan for your streaming journey. Start free and scale as you grow.
              </p>
            </motion.div>
          
            {/* Current Subscription Status */}
            {user && !initialLoading && <motion.div className="mb-8" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.3
          }}>
                {isPro ? <div className="inline-flex items-center gap-2 px-6 py-3 glass-card shadow-glow-primary">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold">
                      You're on the {subscription.subscription_tier} plan
                    </span>
                    <ProBadge />
                  </div> : <div className="inline-flex items-center gap-2 px-6 py-3 glass-card">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      You're currently on the free plan
                    </span>
                  </div>}
              </motion.div>}
          </div>
        </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => <motion.div key={plan.name} initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1,
              duration: 0.5
            }}>
                <Card className={`relative h-full transition-all duration-300 hover-lift ${plan.popular ? 'border-primary/50 shadow-glow-primary bg-gradient-card' : 'bg-card hover:border-primary/30'} ${plan.isCurrent ? 'ring-2 ring-success' : ''}`}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>}
                  
                  {plan.isCurrent && <Badge className="absolute -top-3 right-4 bg-success text-success-foreground shadow-glow-success">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>}
                  
                  <CardHeader className="text-center pb-8 space-y-4">
                    <div className="inline-flex items-center justify-center gap-2">
                      <CardTitle className="text-3xl font-bold">
                        {plan.name}
                      </CardTitle>
                      {plan.isCurrent && <Crown className="w-6 h-6 text-amber-500 animate-pulse-glow" />}
                    </div>
                    
                    <div className="mt-6">
                      <motion.span whileHover={{
                      scale: 1.05
                    }} className="text-5xl font-bold bg-gradient-primary bg-clip-text text-secondary-foreground bg-primary-foreground">
                        {plan.price}
                      </motion.span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                    
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => <motion.li key={feature} className="flex items-start gap-3" initial={{
                      opacity: 0,
                      x: -10
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: index * 0.1 + featureIndex * 0.05
                    }}>
                          <div className="mt-0.5">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          </div>
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </motion.li>)}
                    </ul>
                    
                    <motion.div whileHover={{
                    scale: 1.02
                  }} whileTap={{
                    scale: 0.98
                  }}>
                      <Button variant={plan.variant} size="lg" className={`w-full font-semibold ${plan.popular ? 'shadow-glow-primary' : ''}`} onClick={() => handleSubscribe(plan.id)} disabled={isButtonDisabled(plan)}>
                        {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                        {getButtonText(plan)}
                      </Button>
                    </motion.div>

                    {plan.isCurrent && <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="text-muted-foreground hover:text-foreground">
                          Manage Subscription
                        </Button>
                      </div>}
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>

          {/* Free Plan Features */}
          <motion.div className="mt-20 text-center" initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }}>
            <h3 className="text-3xl font-bold mb-4">Also included free</h3>
            <p className="text-muted-foreground mb-10">Start streaming today with our generous free tier</p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[{
                title: "Basic Streaming",
                desc: "Stream to one platform at a time with standard quality",
                icon: Zap
              }, {
                title: "Basic Analytics",
                desc: "View basic streaming metrics and viewer counts",
                icon: Sparkles
              }, {
                title: "Community Support",
                desc: "Access to community forums and basic documentation",
                icon: Shield
              }].map((feature, i) => <motion.div key={feature.title} className="p-6 glass-card hover-lift cursor-pointer group" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.5 + i * 0.1
              }} whileHover={{
                y: -5
              }}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary group-hover:shadow-glow-primary-strong transition-all">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto text-center relative">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }}>
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-secondary-foreground">
                Questions?
              </span>{" "}
              We've got answers
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
            {[{
              q: "Can I change plans anytime?",
              a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
            }, {
              q: "Is there a free trial?",
              a: "Yes, Pro plan comes with a 14-day free trial. No credit card required to start."
            }, {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards through Stripe's secure payment processing."
            }, {
              q: "Do you offer refunds?",
              a: "Yes, we offer a 30-day money-back guarantee for all paid plans."
            }, {
              q: "What happens when I cancel?",
              a: "You'll retain access to Pro features until the end of your billing period, then automatically return to the free plan."
            }, {
              q: "Can I get a custom plan?",
              a: "For enterprise needs or custom requirements, contact our sales team for a tailored solution."
            }].map((faq, i) => <motion.div key={faq.q} className="p-6 glass-card hover-lift text-left" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: i * 0.05
            }}>
                <h3 className="font-semibold text-lg mb-3 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </motion.div>)}
          </div>
        </div>
      </section>
      </div>
    </PageTransition>;
};
export default Pricing;