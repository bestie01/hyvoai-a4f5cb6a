import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Ban, 
  Clock, 
  AlertTriangle, 
  MoreVertical,
  MessageSquareOff,
  UserX,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatModerationControlsProps {
  username: string;
  messageId: string;
  message: string;
  platform: 'twitch' | 'youtube';
  streamId?: string;
  onAction?: (action: string, username: string) => void;
}

export function ChatModerationControls({
  username,
  messageId,
  message,
  platform,
  streamId = 'default',
  onAction,
}: ChatModerationControlsProps) {
  const { toast } = useToast();
  const [timeoutDuration, setTimeoutDuration] = useState(600);
  const [timeoutDialogOpen, setTimeoutDialogOpen] = useState(false);

  const handleTimeout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
        return;
      }

      await supabase.from('chat_moderation_actions').insert({
        user_id: user.id,
        stream_id: streamId,
        username,
        message,
        action: 'timeout',
        reason: `Timeout for ${timeoutDuration} seconds`,
        toxicity_score: 0,
      });

      toast({
        title: 'User Timed Out',
        description: `${username} has been timed out for ${timeoutDuration}s`,
      });
      
      onAction?.('timeout', username);
      setTimeoutDialogOpen(false);
    } catch (error) {
      console.error('Timeout error:', error);
      toast({ title: 'Error', description: 'Failed to timeout user', variant: 'destructive' });
    }
  };

  const handleBan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
        return;
      }

      await supabase.from('chat_moderation_actions').insert({
        user_id: user.id,
        stream_id: streamId,
        username,
        message,
        action: 'ban',
        reason: 'Manual ban by streamer',
        toxicity_score: 0,
      });

      toast({
        title: 'User Banned',
        description: `${username} has been banned`,
        variant: 'destructive',
      });
      
      onAction?.('ban', username);
    } catch (error) {
      console.error('Ban error:', error);
      toast({ title: 'Error', description: 'Failed to ban user', variant: 'destructive' });
    }
  };

  const handleWarn = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
        return;
      }

      await supabase.from('chat_moderation_actions').insert({
        user_id: user.id,
        stream_id: streamId,
        username,
        message,
        action: 'warn',
        reason: 'Warning issued by streamer',
        toxicity_score: 0,
      });

      toast({
        title: 'Warning Issued',
        description: `${username} has been warned`,
      });
      
      onAction?.('warn', username);
    } catch (error) {
      console.error('Warn error:', error);
      toast({ title: 'Error', description: 'Failed to warn user', variant: 'destructive' });
    }
  };

  const handleDeleteMessage = async () => {
    toast({
      title: 'Message Deleted',
      description: 'Message has been removed from view',
    });
    onAction?.('delete', username);
  };

  const handleAddToBannedWords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
        return;
      }

      // Extract potential problematic words (simplified)
      const words = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.length > 0) {
        await supabase.from('banned_words').insert({
          user_id: user.id,
          word: words[0],
          action: 'timeout',
          timeout_duration: 300,
        });

        toast({
          title: 'Word Added',
          description: `"${words[0]}" added to banned words`,
        });
      }
    } catch (error) {
      console.error('Add banned word error:', error);
      toast({ title: 'Error', description: 'Failed to add banned word', variant: 'destructive' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Shield className="h-3 w-3" />
          Moderate {username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDeleteMessage} className="gap-2 text-muted-foreground">
          <Trash2 className="h-4 w-4" />
          Delete Message
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleWarn} className="gap-2 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          Warn User
        </DropdownMenuItem>
        
        <Dialog open={timeoutDialogOpen} onOpenChange={setTimeoutDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="gap-2 text-orange-600"
            >
              <Clock className="h-4 w-4" />
              Timeout User
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[300px]">
            <DialogHeader>
              <DialogTitle>Timeout {username}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="timeout-duration">Duration (seconds)</Label>
              <Input
                id="timeout-duration"
                type="number"
                value={timeoutDuration}
                onChange={(e) => setTimeoutDuration(Number(e.target.value))}
                min={1}
                max={86400}
              />
              <div className="flex gap-2 mt-2">
                {[60, 300, 600, 3600].map((secs) => (
                  <Button
                    key={secs}
                    variant="outline"
                    size="sm"
                    onClick={() => setTimeoutDuration(secs)}
                    className="text-xs"
                  >
                    {secs >= 3600 ? `${secs / 3600}h` : `${secs / 60}m`}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTimeoutDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTimeout} className="gap-1">
                <Clock className="h-4 w-4" />
                Timeout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuItem onClick={handleBan} className="gap-2 text-destructive">
          <Ban className="h-4 w-4" />
          Ban User
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleAddToBannedWords} className="gap-2">
          <Plus className="h-4 w-4" />
          Add to Banned Words
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
