import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SocialPost {
  platform: 'twitter' | 'discord' | 'instagram' | 'tiktok' | 'facebook';
  content: string;
  mediaUrls?: string[];
  scheduled?: string;
}

export function useSocialPosts() {
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  const postToTwitter = useCallback(async (text: string, mediaIds?: string[], scheduled?: string) => {
    try {
      setPosting(true);
      const { data, error } = await supabase.functions.invoke('twitter-post', {
        body: { text, mediaIds, scheduled },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: scheduled ? "Tweet scheduled" : "Tweet posted successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post tweet",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }, [toast]);

  const postToDiscord = useCallback(async (
    webhookUrl: string,
    content?: string,
    embeds?: any[],
    scheduled?: string
  ) => {
    try {
      setPosting(true);
      const { data, error } = await supabase.functions.invoke('discord-webhook', {
        body: { webhookUrl, content, embeds, scheduled },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: scheduled ? "Discord post scheduled" : "Posted to Discord successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post to Discord",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }, [toast]);

  const fetchScheduledPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('status', 'pending')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch scheduled posts",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const cancelScheduledPost = useCallback(async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled post cancelled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cancel post",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    posting,
    postToTwitter,
    postToDiscord,
    fetchScheduledPosts,
    cancelScheduledPost,
  };
}