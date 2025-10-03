import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModerationResult {
  toxicity_score: number;
  action: 'none' | 'warn' | 'timeout' | 'ban';
  reason: string;
  categories: string[];
}

export function useAIChatModerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sensitivity, setSensitivity] = useState<'strict' | 'balanced' | 'lenient'>('balanced');

  const moderateMessage = useCallback(async (
    message: string,
    username: string,
    streamId: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-chat-moderator', {
        body: { message, username, streamId, sensitivity }
      });

      if (error) {
        console.error('[AI-CHAT-MODERATOR] Error:', error);
        return { data: null, error };
      }

      // Only show toast for actions that need attention
      if (data.action !== 'none') {
        toast({
          title: 'Moderation Alert! ⚠️',
          description: `${username}: ${data.action} (${data.toxicity_score}% toxicity)`,
          variant: data.action === 'ban' ? 'destructive' : 'default',
        });
      }

      return { data: data as ModerationResult, error: null };
    } catch (error) {
      console.error('[AI-CHAT-MODERATOR] Exception:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast, sensitivity]);

  return {
    moderateMessage,
    loading,
    sensitivity,
    setSensitivity,
  };
}