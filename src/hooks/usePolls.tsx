import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  id: string;
  user_id: string;
  stream_id: string;
  question: string;
  options: Array<{ text: string; votes: number }>;
  active: boolean;
  created_at: string;
  ends_at: string | null;
}

export const usePolls = (streamId: string) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPolls = useCallback(async () => {
    if (!streamId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stream_polls')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedData = (data || []) as Poll[];
      setPolls(typedData);
      
      const active = typedData.find(p => p.active);
      setActivePoll(active || null);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  const createPoll = useCallback(async (question: string, options: string[], duration?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const endsAt = duration ? new Date(Date.now() + duration * 1000).toISOString() : null;
      const pollOptions = options.map(text => ({ text, votes: 0 }));

      const { data, error } = await supabase
        .from('stream_polls')
        .insert([{
          user_id: user.id,
          stream_id: streamId,
          question,
          options: pollOptions,
          active: true,
          ends_at: endsAt,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Poll created',
        description: 'Your poll is now live',
      });

      fetchPolls();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to create poll',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  }, [streamId, toast, fetchPolls]);

  const vote = useCallback(async (pollId: string, optionIndex: number, voterIdentifier: string) => {
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          voter_identifier: voterIdentifier,
          selected_option: optionIndex,
        }]);

      if (error) throw error;

      toast({
        title: 'Vote recorded',
        description: 'Thank you for voting!',
      });

      fetchPolls();
    } catch (error: any) {
      if (error?.code === '23505') {
        toast({
          title: 'Already voted',
          description: 'You have already voted in this poll',
          variant: 'destructive',
        });
      } else {
        console.error('Error voting:', error);
        toast({
          title: 'Error',
          description: 'Failed to record vote',
          variant: 'destructive',
        });
      }
    }
  }, [toast, fetchPolls]);

  const endPoll = useCallback(async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('stream_polls')
        .update({ active: false })
        .eq('id', pollId);

      if (error) throw error;

      toast({
        title: 'Poll ended',
        description: 'Results are now final',
      });

      fetchPolls();
    } catch (error) {
      console.error('Error ending poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to end poll',
        variant: 'destructive',
      });
    }
  }, [toast, fetchPolls]);

  useEffect(() => {
    fetchPolls();

    const channel = supabase
      .channel(`polls:${streamId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stream_polls', filter: `stream_id=eq.${streamId}` },
        () => fetchPolls()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'poll_votes' },
        () => fetchPolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId, fetchPolls]);

  return {
    polls,
    activePoll,
    loading,
    createPoll,
    vote,
    endPoll,
    fetchPolls,
  };
};
