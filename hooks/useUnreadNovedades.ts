import { useState, useEffect } from 'react';
import { novedadesService } from '@/services/novedadesService';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadNovedades() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await novedadesService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    if (!user) return;

    const subscription = novedadesService.subscribeToNovedades(() => {
      fetchUnreadCount();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async () => {
    if (!user) return;

    try {
      await novedadesService.markAsRead(user.id);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return { unreadCount, markAsRead, refetch: fetchUnreadCount };
}
