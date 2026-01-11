import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  is_paused?: boolean;
  paused_at?: string | null;
  payment_status?: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    is_paused: false,
    paused_at: null,
    payment_status: null,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = useCallback(async (showToast = false) => {
    if (!user || !session) {
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        is_paused: false,
        paused_at: null,
        payment_status: null,
      });
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        is_paused: data.is_paused || false,
        paused_at: data.paused_at || null,
        payment_status: data.payment_status || null,
      });

      if (showToast && data.subscribed) {
        toast({
          title: "Subscription Active",
          description: `Your ${data.subscription_tier} plan is active!`,
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to check subscription status",
          variant: "destructive",
        });
      }
      // Retry logic for failed requests
      setTimeout(() => {
        checkSubscription(false);
      }, 5000);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [user, session, toast]);

  const createCheckout = async (plan: 'starter' | 'pro' | 'yearone', promoCode?: string) => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, promoCode },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to checkout",
        description: "Opening Stripe checkout in a new tab...",
      });
      
      return true;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage subscription",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to customer portal",
        description: "Opening subscription management portal...",
      });
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pauseSubscription = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to pause subscription",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pause-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Subscription Paused",
        description: "Your subscription has been paused. You can resume anytime.",
      });

      // Refresh subscription status
      await checkSubscription(false);
      
      return true;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to pause subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resumeSubscription = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to resume subscription",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resume-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Subscription Resumed",
        description: "Your subscription has been resumed successfully!",
      });

      // Refresh subscription status
      await checkSubscription(false);
      
      return true;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: "Error",
        description: "Failed to resume subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check subscription on auth changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription every 5 minutes instead of 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription(false);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const refreshSubscription = () => {
    checkSubscription(true);
  };

  // Computed properties for feature access
  const isPro = subscription.subscribed && (subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Year One');
  const isYearOne = subscription.subscribed && subscription.subscription_tier === 'Year One';
  const isStarter = subscription.subscribed && subscription.subscription_tier === 'Starter';
  const isPaid = subscription.subscribed;
  const isPaused = subscription.is_paused || false;
  const paymentFailed = subscription.payment_status === 'failed';

  // Feature access helpers
  const canAccessStudio = isPaid && !isPaused;
  const canAccessAI = isPro && !isPaused;
  const canAccessAdvanced = isYearOne && !isPaused;

  return {
    subscription,
    loading,
    initialLoading,
    checkSubscription,
    refreshSubscription,
    createCheckout,
    openCustomerPortal,
    pauseSubscription,
    resumeSubscription,
    // Tier checks
    isPro,
    isYearOne,
    isStarter,
    isPaid,
    isPaused,
    paymentFailed,
    // Feature access
    canAccessStudio,
    canAccessAI,
    canAccessAdvanced,
  };
};
