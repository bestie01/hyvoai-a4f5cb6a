import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const RETRY_DELAYS_MS = [1000, 2500, 5000, 8000, 12000];

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription, subscription, isPaid } = useSubscription();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");
  const [activated, setActivated] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    // Aggressive retry chain — webhook usually lands within seconds.
    RETRY_DELAYS_MS.forEach((delay) => {
      const t = window.setTimeout(() => {
        refreshSubscription();
      }, delay);
      timersRef.current.push(t);
    });
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (isPaid && !activated) {
      setActivated(true);
      timersRef.current.forEach(clearTimeout);
      toast({
        title: "Welcome to Hyvo Pro!",
        description: `Your ${subscription.subscription_tier} plan is active.`,
      });
    }
  }, [isPaid, activated, subscription.subscription_tier, toast]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full liquid-glass-panel border-white/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-primary shadow-glow-primary">
            {activated ? (
              <Check className="w-8 h-8 text-white" />
            ) : (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            )}
          </div>
          <CardTitle className="text-3xl font-display font-bold">
            {activated ? "You're all set!" : "Activating your plan…"}
          </CardTitle>
          <CardDescription className="text-base text-white/70">
            {activated
              ? `Your ${subscription.subscription_tier ?? "Pro"} subscription is live.`
              : "We're confirming the payment with Stripe — this usually takes a few seconds."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activated && subscription.subscription_end && (
            <div className="text-center text-sm text-white/60">
              {subscription.subscription_tier === "Year One" ? "Renews" : "Next billing"}:{" "}
              {new Date(subscription.subscription_end).toLocaleDateString()}
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate("/studio")} disabled={!activated}>
              Open Studio <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
            {!activated && (
              <Button variant="ghost" onClick={() => refreshSubscription()}>
                Check again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
