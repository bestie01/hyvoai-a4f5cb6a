import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Calendar, Target, Lightbulb } from 'lucide-react';
import { useAIPredictiveAnalytics } from '@/hooks/useAIPredictiveAnalytics';

export function AIPredictiveDashboard() {
  const { generatePredictions, predictions, loading } = useAIPredictiveAnalytics();

  useEffect(() => {
    generatePredictions();
  }, []);

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            AI is analyzing your streaming data...
          </p>
        </div>
      </Card>
    );
  }

  if (!predictions) {
    return (
      <Card className="p-8 text-center space-y-4">
        <Target className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="font-semibold mb-2">Not Enough Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Stream at least 5 times to get AI-powered predictions and insights
          </p>
          <Button onClick={generatePredictions}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">AI Insights Dashboard 📊</h2>
        <p className="text-muted-foreground">
          Predictions and recommendations powered by AI
        </p>
      </div>

      {/* Viewer Forecast */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Viewer Forecast</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next Week</p>
            <p className="text-2xl font-bold">
              {predictions.viewer_forecast.next_week.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next Month</p>
            <p className="text-2xl font-bold">
              {predictions.viewer_forecast.next_month.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
            <p className="text-2xl font-bold text-green-500">
              +{predictions.viewer_forecast.growth_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Optimal Stream Times */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Optimal Stream Times</h3>
        </div>
        <div className="space-y-3">
          {predictions.optimal_stream_times.slice(0, 3).map((time, index) => (
            <Card key={index} className="p-4 hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{time.day} at {time.time}</p>
                  <p className="text-sm text-muted-foreground">
                    Expected viewers: {time.expected_viewers}
                  </p>
                </div>
                <Badge variant="outline">
                  {(time.confidence * 100).toFixed(0)}% confident
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {predictions.recommendations.map((rec, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant={getImpactColor(rec.impact)}>
                      {rec.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Key Insights</h3>
        <ul className="space-y-2">
          {predictions.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Button onClick={generatePredictions} variant="outline" className="w-full">
        Refresh Predictions
      </Button>
    </div>
  );
}