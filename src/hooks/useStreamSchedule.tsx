import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StreamSchedule {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  platform: 'twitch' | 'youtube';
  scheduled_start_time: string;
  duration: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const useStreamSchedule = () => {
  const [schedules, setSchedules] = useState<StreamSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stream_schedules')
        .select('*')
        .order('scheduled_start_time', { ascending: true });

      if (error) throw error;
      const typedData = (data || []) as StreamSchedule[];
      setSchedules(typedData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stream schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createSchedule = useCallback(async (schedule: Omit<StreamSchedule, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stream_schedules')
        .insert([{ ...schedule, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stream scheduled successfully',
      });

      fetchSchedules();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  }, [toast, fetchSchedules]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<StreamSchedule>) => {
    try {
      const { error } = await supabase
        .from('stream_schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule updated successfully',
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  }, [toast, fetchSchedules]);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('stream_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  }, [toast, fetchSchedules]);

  return {
    schedules,
    loading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};
