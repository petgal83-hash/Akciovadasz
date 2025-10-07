import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Ensure this only runs in the browser
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Ez a böngésző nem támogatja az asztali értesítéseket.');
      return;
    }

    const status = await Notification.requestPermission();
    setPermission(status);
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      // In a real app, you would have these assets.
      // For now, we omit them to avoid 404 errors.
      const notificationOptions = {
        ...options,
        // icon: '/logo.png', 
        // badge: '/badge.png',
      };
      new Notification(title, notificationOptions);
    }
  }, [permission]);

  return { permission, requestPermission, sendNotification };
};
