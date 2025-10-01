import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';

export const useStatusBar = () => {
  const setStyle = async (style: Style) => {
    try {
      await StatusBar.setStyle({ style });
    } catch (error) {
      console.log('StatusBar not available:', error);
    }
  };

  const setBackgroundColor = async (color: string) => {
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.log('StatusBar not available:', error);
    }
  };

  const hide = async () => {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.log('StatusBar not available:', error);
    }
  };

  const show = async () => {
    try {
      await StatusBar.show();
    } catch (error) {
      console.log('StatusBar not available:', error);
    }
  };

  const setOverlaysWebView = async (overlay: boolean) => {
    try {
      await StatusBar.setOverlaysWebView({ overlay });
    } catch (error) {
      console.log('StatusBar not available:', error);
    }
  };

  useEffect(() => {
    // Set dark style by default for streaming app
    setStyle(Style.Dark);
    setBackgroundColor('#1e293b'); // slate-900
  }, []);

  return {
    setStyle,
    setBackgroundColor,
    hide,
    show,
    setOverlaysWebView,
  };
};
