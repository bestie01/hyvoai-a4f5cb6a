import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAIVoiceAssistant } from '@/hooks/useAIVoiceAssistant';
import { Badge } from '@/components/ui/badge';

export function AIVoiceAssistant() {
  const { startListening, stopListening, listening, loading, supported } = useAIVoiceAssistant();

  if (!supported) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          Voice assistant is not supported in this browser. Try Chrome or Edge.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Voice Assistant</h3>
          <p className="text-sm text-muted-foreground">Control your stream with voice commands</p>
        </div>
        {listening && (
          <Badge variant="outline" className="animate-pulse">
            Listening...
          </Badge>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          variant={listening ? "destructive" : "default"}
          className="h-24 w-24 rounded-full"
          onClick={listening ? stopListening : startListening}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : listening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Try saying:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• "Start stream"</li>
          <li>• "Show poll"</li>
          <li>• "Read last 3 chat messages"</li>
          <li>• "Mute microphone"</li>
        </ul>
      </div>
    </Card>
  );
}
