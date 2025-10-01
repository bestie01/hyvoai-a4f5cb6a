import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const useHaptics = () => {
  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const notification = async (type: NotificationType = NotificationType.Success) => {
    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const vibrate = async (duration = 200) => {
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const selectionStart = async () => {
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const selectionChanged = async () => {
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const selectionEnd = async () => {
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
  };
};
