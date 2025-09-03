import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface ProFeatureGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  showUpgrade?: boolean;
}

export const ProFeatureGate = ({ 
  children, 
  feature, 
  description = "This feature is available for Pro subscribers only.",
  showUpgrade = true 
}: ProFeatureGateProps) => {
  const { isPro, createCheckout, loading } = useSubscription();
  const navigate = useNavigate();

  if (isPro) {
    return <>{children}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-amber-600" />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pro Feature
          </Badge>
        </div>
        <CardTitle className="text-xl">{feature}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={() => createCheckout('pro')} 
            disabled={loading}
            className="bg-gradient-primary hover:opacity-90"
          >
            {loading ? "Processing..." : "Upgrade to Pro"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/pricing')}
          >
            View Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProBadgeProps {
  className?: string;
}

export const ProBadge = ({ className }: ProBadgeProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-gradient-primary text-white ${className}`}
    >
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  );
};