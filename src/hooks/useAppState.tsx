import { useState, useEffect } from 'react';
import { App, AppState } from '@capacitor/app';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>({ isActive: true });
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
    let stateListener: any;
    let backButtonListener: any;

    const setupListeners = async () => {
      // Listen for app state changes
      stateListener = await App.addListener('appStateChange', (state) => {
        console.log('App state changed:', state);
        setAppState(state);
        setIsBackground(!state.isActive);
      });

      // Listen for back button on Android
      backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });

      // Get initial app state
      const state = await App.getState();
      setAppState(state);
    };

    setupListeners();

    return () => {
      stateListener?.remove();
      backButtonListener?.remove();
    };
  }, []);

  const minimizeApp = async () => {
    try {
      await App.minimizeApp();
    } catch (error) {
      console.log('Minimize not available:', error);
    }
  };

  return {
    appState,
    isBackground,
    minimizeApp,
  };
};
