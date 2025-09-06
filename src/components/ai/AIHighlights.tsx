import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Download, Clock, Star } from "lucide-react";
import { useAIHighlights } from "@/hooks/useAIHighlights";

interface AIHighlightsProps {
  streamData: {
    id: string;
    duration: string;
    viewers: number;
    category: string;
  };
  chatMessages: Array<{
    username: string;
    message: string;
    timestamp: string;
  }>;
  audioLevels: number[];
}

export function AIHighlights({ streamData, chatMessages, audioLevels }: AIHighlightsProps) {
  const { generateHighlights, highlights, loading } = useAIHighlights();
  const [generated, setGenerated] = useState(false);

  const handleGenerateHighlights = async () => {
    const result = await generateHighlights(streamData, chatMessages, audioLevels);
    if (result.data) {
      setGenerated(true);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reaction': return 'bg-accent text-accent-foreground';
      case 'gameplay': return 'bg-primary text-primary-foreground';
      case 'chat_moment': return 'bg-success text-success-foreground';
      case 'achievement': return 'bg-gradient-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Highlights
          </div>
          {!generated && (
            <Button 
              onClick={handleGenerateHighlights}
              disabled={loading || chatMessages.length < 20}
              size="sm"
              className="bg-gradient-primary hover:opacity-90"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!generated && highlights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>AI-powered highlight detection</p>
            <p className="text-sm mt-1">
              {chatMessages.length < 20 
                ? `Need ${20 - chatMessages.length} more chat messages`
                : "Click Generate to find exciting moments"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {highlights.map((highlight, index) => (
              <div key={index} className="border border-border/50 rounded-lg p-3 bg-muted/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(highlight.type)}>
                      {highlight.type.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {highlight.timestamp}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-current text-accent" />
                      {highlight.confidence}%
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium text-foreground mb-1">
                  {highlight.suggested_title}
                </h4>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {highlight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {highlight.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {generated && highlights.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>No highlights detected in this stream segment</p>
                <p className="text-xs mt-1">Try generating again after more activity</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}