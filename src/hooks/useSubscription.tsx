import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
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

  const createCheckout = async (plan: 'starter' | 'pro' | 'yearone') => {
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
        body: { plan },
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

  return {
    subscription,
    loading,
    initialLoading,
    checkSubscription,
    refreshSubscription,
    createCheckout,
    openCustomerPortal,
    isPro: subscription.subscribed && (subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Year One'),
    isYearOne: subscription.subscribed && subscription.subscription_tier === 'Year One',
    isStarter: subscription.subscribed && subscription.subscription_tier === 'Starter',
    isPaid: subscription.subscribed,
  };
};