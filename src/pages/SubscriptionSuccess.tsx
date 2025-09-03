import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSubscription, subscription } = useSubscription();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Refresh subscription status after successful payment
      checkSubscription();
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is now active. Enjoy all Pro features!",
      });
    }
  }, [sessionId, checkSubscription, toast]);

  const proFeatures = [
    "Multi-platform streaming (Twitch + YouTube)",
    "Stream recording and highlights",
    "Advanced analytics and insights",
    "Custom overlays and branding",
    "Priority support",
    "Professional audio mixing",
    "Stream scheduling",
    "Chat moderation tools",
    "API access and integrations"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Hyvo Pro!</CardTitle>
          <CardDescription className="text-lg">
            Your subscription is now active. You have access to all Pro features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Your Pro Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {subscription.subscription_end && (
            <div className="text-center text-muted-foreground">
              <p>Your subscription {subscription.subscription_tier === 'Year One' ? 'expires' : 'renews'} on{' '}
                {new Date(subscription.subscription_end).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/studio')} size="lg">
              Start Streaming <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;