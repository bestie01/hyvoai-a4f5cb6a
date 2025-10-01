import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  const register = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
      setIsRegistered(true);

      toast({
        title: "Notifications enabled",
        description: "You'll receive stream updates",
      });
    } catch (error) {
      console.error('Push notification error:', error);
      toast({
        title: "Notification error",
        description: "Could not enable notifications",
        variant: "destructive",
      });
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      await PushNotifications.createChannel({
        id: 'stream-updates',
        name: 'Stream Updates',
        description: 'Notifications for stream events',
        importance: 5,
        visibility: 1,
      });

      // Note: Local notifications require additional setup
      toast({
        title: title,
        description: body,
      });
    } catch (error) {
      console.error('Local notification error:', error);
    }
  };

  useEffect(() => {
    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      setToken(token.value);
      console.log('Push registration success, token: ' + token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      toast({
        title: notification.title || 'New notification',
        description: notification.body || '',
      });
    });

    // Listen for notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [toast]);

  return {
    token,
    isRegistered,
    register,
    sendLocalNotification,
  };
};
