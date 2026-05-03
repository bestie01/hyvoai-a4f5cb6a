import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useApiCall } from './useApiCall';
import { toast } from 'sonner';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  is_paused?: boolean;
  paused_at?: string | null;
  payment_status?: string | null;
}

const EMPTY: SubscriptionData = {
  subscribed: false,
  subscription_tier: null,
  subscription_end: null,
  is_paused: false,
  paused_at: null,
  payment_status: null,
};

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>(EMPTY);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, session } = useAuth();

  const checkApi = useApiCall<undefined, SubscriptionData>('check-subscription', { silent: true });
  const checkoutApi = useApiCall<{ plan: string; promoCode?: string }, { url: string }>('create-checkout', { action: 'start checkout' });
  const portalApi = useApiCall<undefined, { url: string }>('customer-portal', { action: 'open billing portal' });
  const pauseApi = useApiCall<undefined, unknown>('pause-subscription', { action: 'pause subscription' });
  const resumeApi = useApiCall<undefined, unknown>('resume-subscription', { action: 'resume subscription' });

  const loading =
    checkApi.loading || checkoutApi.loading || portalApi.loading || pauseApi.loading || resumeApi.loading;

  const checkSubscription = useCallback(
    async (showToast = false) => {
      if (!user || !session) {
        setSubscription(EMPTY);
        setInitialLoading(false);
        return;
      }
      const data = await checkApi.invoke();
      if (data) {
        setSubscription({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
          is_paused: data.is_paused || false,
          paused_at: data.paused_at || null,
          payment_status: data.payment_status || null,
        });
        if (showToast && data.subscribed) {
          toast.success('Subscription active', { description: `Your ${data.subscription_tier} plan is active.` });
        }
      }
      setInitialLoading(false);
    },
    [user, session, checkApi]
  );

  const createCheckout = async (plan: 'starter' | 'pro' | 'yearone', promoCode?: string) => {
    if (!user || !session) {
      toast.error('Please sign in to subscribe');
      return false;
    }
    const data = await checkoutApi.invoke({ plan, promoCode });
    if (data?.url) {
      window.open(data.url, '_blank');
      toast('Redirecting to checkout', { description: 'Opening Stripe in a new tab…' });
      return true;
    }
    return false;
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast.error('Please sign in to manage subscription');
      return;
    }
    const data = await portalApi.invoke();
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  const pauseSubscription = async () => {
    if (!user || !session) return false;
    const data = await pauseApi.invoke();
    if (data) {
      toast.success('Subscription paused', { description: 'You can resume anytime.' });
      await checkSubscription(false);
      return true;
    }
    return false;
  };

  const resumeSubscription = async () => {
    if (!user || !session) return false;
    const data = await resumeApi.invoke();
    if (data) {
      toast.success('Subscription resumed');
      await checkSubscription(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    checkSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => checkSubscription(false), 300000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const refreshSubscription = () => checkSubscription(true);

  const isPro =
    subscription.subscribed &&
    (subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Year One');
  const isYearOne = subscription.subscribed && subscription.subscription_tier === 'Year One';
  const isStarter = subscription.subscribed && subscription.subscription_tier === 'Starter';
  const isPaid = subscription.subscribed;
  const isPaused = subscription.is_paused || false;
  const paymentFailed = subscription.payment_status === 'failed';

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
    isPro,
    isYearOne,
    isStarter,
    isPaid,
    isPaused,
    paymentFailed,
    canAccessStudio,
    canAccessAI,
    canAccessAdvanced,
  };
};
