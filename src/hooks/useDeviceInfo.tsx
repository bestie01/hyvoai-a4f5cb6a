import { useState, useCallback, useEffect } from 'react';
import { Device, DeviceInfo, BatteryInfo, GetLanguageCodeResult } from '@capacitor/device';

interface DeviceState {
  info: DeviceInfo | null;
  battery: BatteryInfo | null;
  languageCode: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useDeviceInfo() {
  const [state, setState] = useState<DeviceState>({
    info: null,
    battery: null,
    languageCode: null,
    isLoading: false,
    error: null,
  });

  const getInfo = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const info = await Device.getInfo();
      setState(prev => ({ ...prev, info, isLoading: false }));
      return info;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to get device info',
      }));
      return null;
    }
  }, []);

  const getBatteryInfo = useCallback(async () => {
    try {
      const battery = await Device.getBatteryInfo();
      setState(prev => ({ ...prev, battery }));
      return battery;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to get battery info',
      }));
      return null;
    }
  }, []);

  const getLanguageCode = useCallback(async () => {
    try {
      const result = await Device.getLanguageCode();
      setState(prev => ({ ...prev, languageCode: result.value }));
      return result.value;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to get language code',
      }));
      return null;
    }
  }, []);

  const getId = useCallback(async () => {
    try {
      const id = await Device.getId();
      return id.identifier;
    } catch (error: any) {
      console.error('Failed to get device ID:', error);
      return null;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const [info, battery, langResult] = await Promise.all([
        Device.getInfo(),
        Device.getBatteryInfo(),
        Device.getLanguageCode(),
      ]);
      
      setState({
        info,
        battery,
        languageCode: langResult.value,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to refresh device info',
      }));
    }
  }, []);

  const isStreamReady = useCallback((): { ready: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (state.battery) {
      if ((state.battery.batteryLevel || 0) < 0.2 && !state.battery.isCharging) {
        issues.push('Battery below 20% - consider charging');
      }
    }
    
    return {
      ready: issues.length === 0,
      issues,
    };
  }, [state.battery]);

  const getPlatformIcon = useCallback(() => {
    if (!state.info) return '📱';
    switch (state.info.platform) {
      case 'ios': return '🍎';
      case 'android': return '🤖';
      case 'web': return '🌐';
      default: return '📱';
    }
  }, [state.info]);

  // Auto-refresh battery every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getBatteryInfo();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [getBatteryInfo]);

  return {
    ...state,
    getInfo,
    getBatteryInfo,
    getLanguageCode,
    getId,
    refreshAll,
    isStreamReady,
    getPlatformIcon,
  };
}
