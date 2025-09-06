import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, MessageSquare, AlertTriangle, TrendingUp } from "lucide-react";
import { useAIChatAnalysis } from "@/hooks/useAIChatAnalysis";

interface AIChatAnalysisProps {
  messages: Array<{
    username: string;
    message: string;
    timestamp: string;
  }>;
  streamId: string;
  platform: string;
  autoAnalyze?: boolean;
}

export function AIChatAnalysis({ messages, streamId, platform, autoAnalyze = true }: AIChatAnalysisProps) {
  const { analyzeChat, analysis, loading } = useAIChatAnalysis();
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  // Auto-analyze when message count increases significantly
  useEffect(() => {
    if (!autoAnalyze || messages.length < 10) return;
    
    const messageDiff = messages.length - lastAnalyzedCount;
    if (messageDiff >= 20 || (messageDiff >= 10 && messages.length > 50)) {
      analyzeChat(messages.slice(-50), platform, streamId);
      setLastAnalyzedCount(messages.length);
    }
  }, [messages.length, analyzeChat, platform, streamId, autoAnalyze, lastAnalyzedCount]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success text-success-foreground';
      case 'negative': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getToxicityColor = (score: number) => {
    if (score < 30) return 'hsl(var(--success))';
    if (score < 70) return 'hsl(var(--accent))';
    return 'hsl(var(--destructive))';
  };

  if (!analysis && !loading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="h-5 w-5 text-primary" />
            AI Chat Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Analyzing chat messages...</p>
            <p className="text-sm mt-1">Need at least 10 messages for analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-primary" />
          AI Chat Analysis
          {loading && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis && (
          <>
            {/* Sentiment & Engagement */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Sentiment</span>
                  <Badge className={getSentimentColor(analysis.sentiment)}>
                    {analysis.sentiment}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <span className="text-sm font-medium text-foreground">{analysis.engagement_score}%</span>
                </div>
                <Progress value={analysis.engagement_score} className="h-2" />
              </div>
            </div>

            {/* Toxicity Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Toxicity Level
                </span>
                <span className="text-sm font-medium text-foreground">{analysis.toxicity_score}%</span>
              </div>
              <Progress 
                value={analysis.toxicity_score} 
                className="h-2"
                style={{ '--progress-background': getToxicityColor(analysis.toxicity_score) } as any}
              />
            </div>

            {/* Topics */}
            {analysis.topics.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Trending Topics</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.topics.slice(0, 5).map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {analysis.highlights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Chat Highlights</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {analysis.highlights.slice(0, 3).map((highlight, index) => (
                    <div key={index} className="text-xs p-2 bg-muted/50 rounded border-l-2 border-accent">
                      <span className="font-medium text-accent">{highlight.username}</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <span className="text-foreground">{highlight.message}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {highlight.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderation Flags */}
            {analysis.moderation_flags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Moderation Alerts
                </h4>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {analysis.moderation_flags.slice(0, 2).map((flag, index) => (
                    <div key={index} className="text-xs p-2 bg-destructive/10 rounded border-l-2 border-destructive">
                      <span className="text-foreground">{flag.message}</span>
                      <div className="text-xs text-destructive mt-1">
                        Reason: {flag.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}