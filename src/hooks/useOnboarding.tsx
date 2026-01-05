import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const ONBOARDING_KEY = 'hyvo-onboarding-completed';
const TOUR_KEY = 'hyvo-tour-completed';

interface OnboardingState {
  showWelcome: boolean;
  showTour: boolean;
  isFirstVisit: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    showWelcome: false,
    showTour: false,
    isFirstVisit: false,
  });

  useEffect(() => {
    if (!user) {
      setState({ showWelcome: false, showTour: false, isFirstVisit: false });
      return;
    }

    const userKey = `${ONBOARDING_KEY}-${user.id}`;
    const tourKey = `${TOUR_KEY}-${user.id}`;
    
    const hasCompletedOnboarding = localStorage.getItem(userKey) === 'true';
    const hasCompletedTour = localStorage.getItem(tourKey) === 'true';
    
    setState({
      showWelcome: !hasCompletedOnboarding,
      showTour: false,
      isFirstVisit: !hasCompletedOnboarding,
    });
  }, [user]);

  const completeWelcome = useCallback(() => {
    if (user) {
      const userKey = `${ONBOARDING_KEY}-${user.id}`;
      localStorage.setItem(userKey, 'true');
      setState(prev => ({
        ...prev,
        showWelcome: false,
        showTour: true,
      }));
    }
  }, [user]);

  const completeTour = useCallback(() => {
    if (user) {
      const tourKey = `${TOUR_KEY}-${user.id}`;
      localStorage.setItem(tourKey, 'true');
      setState(prev => ({
        ...prev,
        showTour: false,
        isFirstVisit: false,
      }));
    }
  }, [user]);

  const resetOnboarding = useCallback(() => {
    if (user) {
      const userKey = `${ONBOARDING_KEY}-${user.id}`;
      const tourKey = `${TOUR_KEY}-${user.id}`;
      localStorage.removeItem(userKey);
      localStorage.removeItem(tourKey);
      setState({
        showWelcome: true,
        showTour: false,
        isFirstVisit: true,
      });
    }
  }, [user]);

  const startTour = useCallback(() => {
    setState(prev => ({ ...prev, showTour: true }));
  }, []);

  return {
    ...state,
    completeWelcome,
    completeTour,
    resetOnboarding,
    startTour,
  };
}
