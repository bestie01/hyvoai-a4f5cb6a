import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIChatModerator } from '@/hooks/useAIChatModerator';
import { Shield, AlertTriangle, Ban, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface AIChatModeratorProps {
  messages: ChatMessage[];
  streamId: string;
  onModerate?: (messageId: string, action: string) => void;
}

export function AIChatModerator({ messages, streamId, onModerate }: AIChatModeratorProps) {
  const { moderateMessage, loading, sensitivity, setSensitivity } = useAIChatModerator();
  const [moderatedMessages, setModeratedMessages] = useState<Map<string, any>>(new Map());
  const [autoModerate, setAutoModerate] = useState(false);

  useEffect(() => {
    if (!autoModerate) return;

    const checkLatestMessage = async () => {
      if (messages.length === 0) return;
      const latestMessage = messages[messages.length - 1];
      
      if (moderatedMessages.has(latestMessage.id)) return;

      const { data } = await moderateMessage(
        latestMessage.message,
        latestMessage.username,
        streamId
      );

      if (data) {
        setModeratedMessages(prev => new Map(prev).set(latestMessage.id, data));
      }
    };

    checkLatestMessage();
  }, [messages, autoModerate, moderateMessage, streamId, moderatedMessages]);

  const handleManualModerate = async (msg: ChatMessage) => {
    const { data } = await moderateMessage(msg.message, msg.username, streamId);
    if (data) {
      setModeratedMessages(prev => new Map(prev).set(msg.id, data));
    }
  };

  const flaggedMessages = messages.filter(msg => {
    const modData = moderatedMessages.get(msg.id);
    return modData && modData.action !== 'none';
  });

  const getToxicityColor = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'default';
    if (score >= 30) return 'secondary';
    return 'outline';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ban': return <Ban className="h-4 w-4" />;
      case 'timeout': return <Clock className="h-4 w-4" />;
      case 'warn': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Chat Moderator</h3>
          </div>
          <Button
            variant={autoModerate ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoModerate(!autoModerate)}
          >
            {autoModerate ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Sensitivity Level</Label>
            <Select value={sensitivity} onValueChange={(v: any) => setSensitivity(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict (Low tolerance)</SelectItem>
                <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                <SelectItem value="lenient">Lenient (High tolerance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Flagged Messages</Label>
              <Badge variant="destructive">{flaggedMessages.length}</Badge>
            </div>
            
            {flaggedMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No flagged messages</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {flaggedMessages.map(msg => {
                  const modData = moderatedMessages.get(msg.id);
                  return (
                    <Card key={msg.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{msg.username}</span>
                            <Badge variant={getToxicityColor(modData.toxicity_score)}>
                              {modData.toxicity_score}% toxic
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {modData.reason}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onModerate?.(msg.id, modData.action)}
                        >
                          {getActionIcon(modData.action)}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}