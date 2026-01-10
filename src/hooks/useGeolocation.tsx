import { useState, useCallback } from 'react';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';

interface GeolocationState {
  position: Position | null;
  isLoading: boolean;
  error: string | null;
  isWatching: boolean;
  watchId: string | null;
  permissionStatus: PermissionStatus | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    isLoading: false,
    error: null,
    isWatching: false,
    watchId: null,
    permissionStatus: null,
  });

  const checkPermissions = useCallback(async () => {
    try {
      const status = await Geolocation.checkPermissions();
      setState(prev => ({ ...prev, permissionStatus: status }));
      return status;
    } catch (error) {
      console.error('Error checking geolocation permissions:', error);
      return null;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const status = await Geolocation.requestPermissions();
      setState(prev => ({ ...prev, permissionStatus: status }));
      return status;
    } catch (error) {
      console.error('Error requesting geolocation permissions:', error);
      return null;
    }
  }, []);

  const getCurrentPosition = useCallback(async (enableHighAccuracy = true) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 0,
      });
      
      setState(prev => ({
        ...prev,
        position,
        isLoading: false,
        error: null,
      }));
      
      return position;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get location';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const startWatching = useCallback(async (
    onPositionChange?: (position: Position) => void,
    enableHighAccuracy = true
  ) => {
    if (state.isWatching) return;

    try {
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy },
        (position, err) => {
          if (err) {
            setState(prev => ({ ...prev, error: err.message }));
            return;
          }
          if (position) {
            setState(prev => ({ ...prev, position, error: null }));
            onPositionChange?.(position);
          }
        }
      );

      setState(prev => ({
        ...prev,
        isWatching: true,
        watchId,
        error: null,
      }));

      return watchId;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to start location watching',
      }));
      return null;
    }
  }, [state.isWatching]);

  const stopWatching = useCallback(async () => {
    if (state.watchId) {
      await Geolocation.clearWatch({ id: state.watchId });
      setState(prev => ({
        ...prev,
        isWatching: false,
        watchId: null,
      }));
    }
  }, [state.watchId]);

  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const getLocationName = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`
      );
      const data = await response.json();
      return data.display_name || 'Unknown location';
    } catch {
      return 'Unknown location';
    }
  }, []);

  return {
    ...state,
    checkPermissions,
    requestPermissions,
    getCurrentPosition,
    startWatching,
    stopWatching,
    calculateDistance,
    getLocationName,
  };
}
